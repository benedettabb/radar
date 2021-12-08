var calibration = require ("users/bene96detta/radar:moisture/calibration")
var hydro1_coll = calibration.hydro1.map(function(img){return img.clip(hydro1)})
var cerbara_coll = calibration.cerbara.map(function(img){return img.clip(cerbara_)})
var petrelle_coll = calibration.petrelle.map(function(img){return img.clip(petrelle_)})
var torreOlmo = calibration.torreOlmo.map(function(img){return img.clip(torre_olmo)})


var s1=ee.ImageCollection('COPERNICUS/S1_GRD') 
    .filterBounds(geometry) 
    .filterDate('2015-08-01','2016-11-25') 
    .map(function(img){
      var date = ee.String(img.get('system:index'))                                         //nomino le immagini utilizzando la data in system:index
      var dateSlice = date.slice(17,25)
      var img_set = img.set('date', dateSlice)  
      return img_set})   
print(s1)

var collection=ee.ImageCollection('COPERNICUS/S1_GRD') 
  .filterBounds(geometry) 
  .filterDate('2015-01-01','2018-01-01');
  
var s2 = ee.ImageCollection("COPERNICUS/S2")
    .filterBounds(geometry) 
    .filterDate('2015-08-01','2018-01-01') 
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .map (function (img) { 
      var ndvi = img.normalizedDifference(['B5','B4']).rename('ndvi');
      return img.addBands(ndvi)})

var linearfit=collection.select(['angle', 'VV'])
  .reduce(ee.Reducer.linearFit()); 
var beta=linearfit.select('scale');


var calculateVVnorm=function(image){ 
  var norm = image.addBands(image.select('VV')
  .subtract(beta.multiply(image.select('angle').subtract(40)))); 
  return norm.select('VV_1').rename('VV_norm')};  
  
var VVnorm =s1.map(calculateVVnorm); 


// Define a max difference filter to compare timestamps.
var maxDiffFilter = ee.Filter.maxDifference({
  difference: 2 * 24 * 60 * 60 * 1000,
  leftField: 'system:time_start',
  rightField: 'system:time_start'
});

// Define the join.
var saveBestJoin = ee.Join.saveBest({
  matchKey: 'bestImage',
  measureKey: 'timeDiff'
});

// Apply the join.
var join = saveBestJoin.apply(VVnorm , s2, maxDiffFilter);


var plot = join.map(function(img) {
  return ee.Image.cat([img, img.get('bestImage')]);
})


var dataset = plot.map(function(img){
  var normAngle = ee.Image.constant(40);
  var cos = normAngle.cos().rename('cos');
  var Avv = ee.Image.constant(0.0950).rename('Avv');  //baghdadi winter crop
  var Bvv = ee.Image.constant(0.5513).rename('Bvv');  //baghdadi winter crop
  var add = ee.Image.cat([img, cos, Avv, Bvv]).select(['VV_norm','cos','Avv','Bvv','ndvi']);
  return add
});

//calcolo tau^2 per ogni pixel di ogni immagine nella image collection
//tau^2 = exp (-2*Bvv*V*sec(theta_i))
var tau = dataset.map(function (image) {
  var img = ee.Image(image)
  var num = ee.Image.constant(-2).multiply(img.select('Bvv')).multiply(img.select('ndvi'))
  var den = img.select('cos')
  var t = num.divide(den)
  var tau = t.exp().rename('tau')
  return img.addBands(tau)
  })
  

//sigma_veg = A*V*cos(theta_i)(1-tau^2)
var sigma_veg = tau.map(function(image){
  var img = ee.Image(image)
  var fin = ee.Image.constant(1).subtract(img.select('tau'))
  var v = img.select('Avv').multiply(img.select('ndvi')).multiply(img.select('cos')).multiply(fin)
  var veg = v.rename('sigma_veg')
  return img.addBands(veg)
})

//sigma tot = sigma_veg + tau^2*sigma_soil 
var sigma_soil = sigma_veg.map(function(image){
  var img = ee.Image(image)
  var num = img.select('VV_norm').subtract(img.select('sigma_veg'))
  var den = img.select('tau')
  var soil = num.divide(den).rename('sigma_soil')
  return img.addBands(soil)
});


print(sigma_soil)
Map.addLayer(s2.first(),{bands:(['B4','B3','B2']), min:0, max:2000},'s2')
Map.addLayer(ee.Image(sigma_soil.first()),{bands:(['sigma_veg']), min:0.0029, max:0.026},'wcm dataset')


var filter = ee.Filter.equals({
  leftField: 'date',
  rightField: 'date'
});

var simpleJoin = ee.Join.inner();


//Hydro_net2 --------------------------------------------------------------------------
var hydro2_situ = calibration.hydro2//.map(function(img){return img.clip(hydro2)})
var hydro2_sar = sigma_soil.map(function(img){var image = ee.Image(img); return image.clip(hydro2)})

var hydro2_joint = ee.ImageCollection(simpleJoin.apply(hydro2_situ, hydro2_sar, filter))

var hydro2_tot = hydro2_joint.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
})

//Hydro_net1 --------------------------------------------------------------------------
var hydro1_situ = calibration.hydro1.map(function(img){return img.clip(hydro2)})
var hydro1_sar = sigma_soil.map(function(img){var image = ee.Image(img); return image.clip(hydro2)})

var hydro1_joint = ee.ImageCollection(simpleJoin.apply(hydro1_situ, hydro1_sar, filter))

var hydro1_tot = hydro1_joint.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
})

//cerbara --------------------------------------------------------------------------
var cerbara_situ = calibration.cerbara.map(function(img){return img.clip(cerbara_)})
var cerbara_sar = sigma_soil.map(function(img){var image = ee.Image(img); return image.clip(cerbara)})

var cerbara_joint = ee.ImageCollection(simpleJoin.apply(cerbara_situ, cerbara_sar, filter))

var cerbara_tot = cerbara_joint.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
})

//petrelle --------------------------------------------------------------------------
var petrelle_situ = calibration.petrelle.map(function(img){return img.clip(petrelle_)})
var petrelle_sar = sigma_soil.map(function(img){var image = ee.Image(img); return image.clip(petrelle_)})

var petrelle_joint = ee.ImageCollection(simpleJoin.apply(petrelle_situ, petrelle_sar, filter))

var petrelle_tot = petrelle_joint.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
})

//torre olmo --------------------------------------------------------------------------
var torreOlmo_situ = calibration.torreOlmo.map(function(img){return img.clip(torre_olmo)})
var torreOlmo_sar = sigma_soil.map(function(img){var image = ee.Image(img); return image.clip(petrelle_)})

var torreOlmo_joint = ee.ImageCollection(simpleJoin.apply(torreOlmo_situ, torreOlmo_sar, filter))

var torreOlmo_tot = torreOlmo_joint.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
})

print('Joined', hydro1_tot)
print('Joined', hydro2_tot)
print('Joined', petrelle_tot)
print('Joined', torreOlmo_tot)
print('Joined', cerbara_tot)

var tot = hydro1_tot.merge(hydro2_tot).merge(cerbara_tot).merge(petrelle_tot).merge(torreOlmo_tot)
var regression = tot.select(['constant', 'VV_norm'])
  .reduce(ee.Reducer.linearFit()); 
var Cvv = regression.select('scale');
var Dvv = regression.select('offset');



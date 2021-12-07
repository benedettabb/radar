Map.addLayer(hydro_net1,{},'hydro net 1')
// Create a planar polygon. 
var planarPolygon = geometry

var january=ee.ImageCollection('COPERNICUS/S1_GRD') 
    .filterBounds(planarPolygon) 
    .filterDate('2016-08-01','2016-10-01') 
    .select('VV', 'angle');

var collection=ee.ImageCollection('COPERNICUS/S1_GRD') 
  .filterBounds(planarPolygon) 
  .filterDate('2016-01-01','2017-01-01');
var s2 = ee.ImageCollection("COPERNICUS/S2")
    .filterBounds(geometry) 
    .filterDate('2016-08-01','2016-10-01') 
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50))
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
var VVnorm =january.map(calculateVVnorm); 


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

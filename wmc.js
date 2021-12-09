var stazione_hydro1 = ee.Geometry.Point([12.352400606125457, 43.11696998689941]);
var stazione_hydro2 =ee.Geometry.Point([12.351959770332428, 43.11722017548435]);
var stazione_cerbara = ee.Geometry.Point([12.380008602748442, 43.55999965182553]);
var stazione_petrelle = ee.Geometry.Point([12.170003601469753, 43.34999838609007]);
var stazione_torreOlmo = ee.Geometry.Point([12.700002593262951, 43.3200037996784]);

var area_hydro1 = ee.Geometry.Polygon(
        [[[12.352296718465103, 43.11689090889345],
          [12.352343657123024, 43.11688062987814],
          [12.352490508073982, 43.1168541981156],
          [12.352545493360765, 43.11702845174451],
          [12.352314823376258, 43.117073483500505],
          [12.352258496984694, 43.11690510372147],
          [12.352255144225252, 43.116898251045875]]]);
var area_hydro2 = ee.Geometry.Polygon(
        [[[12.35188748251022, 43.11723499669336],
        [12.35193240951122, 43.11716451237993],
        [12.35202427516998, 43.11719583875147],
        [12.351975995407711, 43.11726730197654]]]);
var area_cerbara = ee.Geometry.Polygon(
        [[[12.379794056897477, 43.56014244338839],
          [12.379794056897477, 43.559808131812005],
          [12.38024466801198, 43.559808131812005],
          [12.38024466801198, 43.56014244338839]]]);
var area_petrelle = ee.Geometry.Polygon(
        [[[12.169965851494409, 43.34998873321012],
          [12.170026201197244, 43.34993802193103],
          [12.170097279736138, 43.34998190669426],
          [12.169984626957513, 43.350017014482]]]);
var area_torreOlmo = ee.Geometry.Polygon(
        [[[12.699867976770758, 43.320090441454866],
          [12.699881387815832, 43.3199050587878],
          [12.700141562090277, 43.31991481578438],
          [12.700125468836188, 43.32009629563513]]]);

var area_coll = ee.FeatureCollection ([area_hydro1, area_hydro2, area_cerbara, area_petrelle, area_torreOlmo])
var calibration = require ("users/bene96detta/radar:moisture/calibration")

var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
        .filterBounds(area_coll)
        .filterDate('2015-08-01','2018-12-31')
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
        .filter(ee.Filter.eq('instrumentMode', 'IW'))
        .map(function(img){
      var date = ee.String(img.get('system:index'))                                        
      var dateSlice = date.slice(17,25)
      var img_set = img.set('date', dateSlice)  
      return img_set})      

var collection=ee.ImageCollection('COPERNICUS/S1_GRD') 
  .filterBounds(area_coll) 
  .filterDate('2015-01-01','2018-01-01');
  
var s2 = ee.ImageCollection("COPERNICUS/S2")
    .filterBounds(area_coll) 
    .filterDate('2015-08-01','2018-12-31') 
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

var maxDiffFilter = ee.Filter.maxDifference({
  difference: 3 * 24 * 60 * 60 * 1000,  // 259.200.000ms / 86,400,000 = 3 giorni
  leftField: 'system:time_start',
  rightField: 'system:time_start'
});

var saveBestJoin = ee.Join.saveBest({
  matchKey: 'bestImage',
  measureKey: 'timeDiff'
});

var join = saveBestJoin.apply(VVnorm , s2, maxDiffFilter);


var plot = join.map(function(img) {
  var cat = ee.Image.cat([img, img.get('bestImage')]);
  var mask = ee.Image(img.get('bestImage'));
  var mask = mask.select('B1')
  return cat.updateMask(mask)
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


//-------------------------------------------------------------
var filter = ee.Filter.equals({
  leftField: 'date',
  rightField: 'date'
});

var simpleJoin = ee.Join.inner();


var mean_band = function(img){
  var image = ee.Image(img)
  var mean = image.get('mean')
  var mean_band = ee.Image.constant(mean).rename('sigma_soil_mean')
  return image.addBands(mean_band)
  }
  

//Hydro_net1 --------------------------------------------------------------------------
var hydro1_situ = calibration.hydro1
var hydro1_sar = sigma_soil
var hydro1_joint = ee.ImageCollection(simpleJoin.apply(hydro1_situ, hydro1_sar, filter))

var hydro1_tot = hydro1_joint.map(function(feature) {
  var tot = ee.Image.cat(feature.get('primary'), feature.get('secondary'));
  return tot.clip(area_hydro1)
})

var hydro1_mean = hydro1_tot.map(function (img) {
  var image = ee.Image(img);
  var mean = image.select('sigma_soil').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: area_hydro1,
    scale:10}).get('sigma_soil')
  return image.set('mean',mean)
})
var hydro1_filter = hydro1_mean.filter(ee.Filter.gt('mean', -100))//filter per prendere solo le immagini che hanno un valore medio in sigma soil
var hydro1_mean = hydro1_filter.map(mean_band).select(['constant','sigma_soil_mean'])


//Hydro_net2 --------------------------------------------------------------------------
var hydro2_situ = calibration.hydro2
var hydro2_sar = sigma_soil
var hydro2_joint = ee.ImageCollection(simpleJoin.apply(hydro2_situ, hydro2_sar, filter))

var hydro2_tot = hydro2_joint.map(function(feature) {
  var tot = ee.Image.cat(feature.get('primary'), feature.get('secondary'));
  return tot.clip(area_hydro2)
})

var hydro2_mean = hydro2_tot.map(function (img) {
  var image = ee.Image(img);
  var mean = image.select('sigma_soil').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: area_hydro2,
    scale:10}).get('sigma_soil')
  return image.set('mean',mean)
})
var hydro2_filter = hydro2_mean.filter(ee.Filter.gt('mean', -100))
var hydro2_mean = hydro2_filter.map(mean_band).select(['constant','sigma_soil_mean'])
  
//cerbara --------------------------------------------------------------------------
var cerbara_situ = calibration.cerbara
var cerbara_sar = sigma_soil
var cerbara_joint = ee.ImageCollection(simpleJoin.apply(cerbara_situ, cerbara_sar, filter))

var cerbara_tot = cerbara_joint.map(function(feature) {
  var tot = ee.Image.cat(feature.get('primary'), feature.get('secondary'));
  return tot.clip(area_cerbara)
})

var cerbara_mean = cerbara_tot.map(function (img) {
  var image = ee.Image(img);
  var mean = image.select('sigma_soil').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: area_cerbara,
    scale:10}).get('sigma_soil')
  return image.set('mean',mean)
})
var cerbara_filter = cerbara_mean.filter(ee.Filter.gt('mean', -100))
var cerbara_mean = cerbara_filter.map(mean_band).select(['constant','sigma_soil_mean'])

  
//petrelle --------------------------------------------------------------------------
var petrelle_situ = calibration.petrelle
var petrelle_sar = sigma_soil

var petrelle_joint = ee.ImageCollection(simpleJoin.apply(petrelle_situ, petrelle_sar, filter))

var petrelle_tot = petrelle_joint.map(function(feature) {
  var tot = ee.Image.cat(feature.get('primary'), feature.get('secondary'));
  return tot.clip(area_petrelle)
})

var petrelle_mean = petrelle_tot.map(function (img) {
  var image = ee.Image(img);
  var mean = image.select('sigma_soil').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: area_petrelle,
    scale:10}).get('sigma_soil')
  return image.set('mean',mean)
})
var petrelle_filter = petrelle_mean.filter(ee.Filter.gt('mean', -100))
var petrelle_mean = petrelle_filter.map(mean_band).select(['constant','sigma_soil_mean'])

  
//torre olmo --------------------------------------------------------------------------
var torreOlmo_situ = calibration.torreOlmo
var torreOlmo_sar = sigma_soil

var torreOlmo_joint = ee.ImageCollection(simpleJoin.apply(torreOlmo_situ, torreOlmo_sar, filter))

var torreOlmo_tot = torreOlmo_joint.map(function(feature) {
  var tot = ee.Image.cat(feature.get('primary'), feature.get('secondary'))
  return tot.clip(area_torreOlmo);
})

var torreOlmo_mean = torreOlmo_tot.map(function (img) {
  var image = ee.Image(img);
  var mean = image.select('sigma_soil').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: area_torreOlmo,
    scale:10}).get('sigma_soil')
  return image.set('mean',mean)
})
var torreOlmo_filter = torreOlmo_mean.filter(ee.Filter.gt('mean', -100))
var torreOlmo_mean = torreOlmo_filter.map(mean_band).select(['constant','sigma_soil_mean'])

//------------------------------------------------------------------------

var tot = hydro1_mean.merge(hydro2_mean).merge(cerbara_mean).merge(petrelle_mean).merge(torreOlmo_mean)
print(tot)
/*

var half = tot.size().divide(2).toInt() //metà della lunghezza della collezione
var calibration = ee.ImageCollection(tot.randomColumn('random',13).sort('random').limit(half));


//regression : parametri Cvv e Dvv
var regression = calibration.select(['constant', 'VV_norm'])
  .reduce(ee.Reducer.linearFit()); 

var Cvv = ee.Image.constant(-17.6).clip(geometry)
var Dvv = ee.Image.constant(-3.56).clip(geometry)


//umidità calcolata con il modello
var moisture = sigma_soil.map(function (img){
  var image = ee.Image(img)
  var num = image.select('sigma_soil').subtract(Cvv);
  var den = Dvv;
  var hum = num.divide(den).rename('hum_wcm')
  return image.addBands(hum)
})


//VV calcolato con il modello //da sistemare per sigma tot
var VVwcm = moisture.map(function(img){
  var image = ee.Image(img)
  var moisture = image.select('hum_wcm')
  var VVcalcolato = Cvv.add(Dvv.multiply(moisture)).rename('VV_wcm')
  return image.addBands(VVcalcolato)
}) 
print(VVwcm)
Map.addLayer(ee.Image(VVwcm.first()))


/*
var VVnorm_VVwcm = ee.Image(VVwcm.first())//.select(['VV_norm','VV_wcm'])
print(VVnorm_VVwcm)
 
// sample N points from the 2-band image
var values = VVnorm_VVwcm.sample({ region: geometry, scale: 100, numPixels: 100})
Map.addLayer(values)

// plot sampled features as a scatter chart
var chart = ui.Chart.feature.byFeature(values, 'VV_norm', 'VV_wcm')
  .setChartType('ScatterChart')
  .setOptions({ 
    title: 'σ0 vegetazione bassa',
    colors: ['#0ceeff'],
    pointSize: 1.5,  
    width: 300, 
    height: 300, 
    titleX: 'σ0[dB]', 
    titleY: 'Moisture [%]',
    vAxis: {  // y-axis
      viewWindow: {min: 5, max: 35}
    },
    trendlines: {
    0: {  // add a trend line to the 1st series
      type: 'linear',  // or 'polynomial', 'linear'
      color: 'black',
      lineDashStyle: [4, 4],
      lineWidth: 2,
      showR2: true,
      visibleInLegend: true,
    }
   },
    })


Map.addLayer(VVnorm_VVwcm)   
print(chart)  */

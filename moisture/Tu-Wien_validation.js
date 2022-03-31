
var station2 = ee.Geometry.Point([12.35196, 43.11722]);
var station1 = ee.Geometry.Point([12.35240, 43.11697]);


Map.addLayer(station1,{},'station1');
Map.addLayer(station2,{},'station2');

Map.addLayer(geometry1SMALL,{},'geometry1small')
Map.addLayer(geometry2SMALL,{},'geometry2small')


//angle normalization
var norm = require("users/bene96detta/radar:preprocessing/angleNormalization");
var corr = require("users/bene96detta/radar:preprocessing/terrainNorm");

//Sentinel-1 GRD
var coll =ee.ImageCollection("COPERNICUS/S1_GRD")  
  .filterBounds(station2) 
  .filterDate("2015-08-01","2015-09-01")   
  .map(function(img){  
  var vv = img.select("VV")
  var mask = vv.gt(-40) 
  return img.updateMask(mask)}) 
  //.map(corr.corr2)
//normalization
var norm = coll.map(norm.normUMBRIA).select(["VV_norm"])

var driest=norm.min(); 
var wettest=norm.max();  

var SMmax=0.30; 
var SMmin=0.09;

var moistureVol =function (image){ 
  var sensitivity=wettest.subtract(driest);
  //relative soil moisture
  var mr = image.subtract(driest).divide(sensitivity) 
  //volumetri soil moisture
  var mv = mr.multiply(SMmax-SMmin).add(SMmin) 
  return image.addBands(mv).rename("VV_norm","moisture")} 

var coll_hum = norm.map(moistureVol); 
var SSM = coll_hum.select("moisture");

var mean = function (img){
  var mean = img.reduceRegion({
    reducer: ee.Reducer.mean(), 
    geometry:station1, 
    scale:10
  })
  return img.set('mean',mean)
}

var meanSSM = SSM.map(mean);

var list = SSM.toList(6); 
var visParams = {
  bands: ["moisture"],
  min: 0.05,
  max: 0.35
};


for(var i = 0; i < 6; i++){
  var image = ee.Image(list.get(i));
  var string = "moisture" + i.toString()
  Map.addLayer(image, visParams, string,0)
}

var meanSSM = meanSSM.map(function(img){
  var date = ee.Date(img.get('system:time_start')).format(null, 'GMT')
  return img.set('date',date)
});

var wanted = ['mean', 'date'];
var augmented = meanSSM.map(function (image) {
  return image.set('dict', image.toDictionary(wanted));
});

var list = augmented.aggregate_array('dict');
print(list);

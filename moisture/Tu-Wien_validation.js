//HYDRO2
var geometry = ee.Geometry.Polygon( 
        [[[12.351986779678068, 43.11728059713532],
          [12.351868762481411, 43.11723752343003],
          [12.352000190723142, 43.11705543879513],
          [12.352123572337828, 43.1171063442315]]]);
          
/*          
//HYDRO1
var geometry = ee.Geometry.Polygon( 
        [[[12.352069261089568, 43.117033562361215],
          [12.352069261089568, 43.11672617083199],
          [12.35253596545816, 43.11672617083199],
          [12.35253596545816, 43.117033562361215]]], null, false);    */
          
var station = ee.Geometry.Point([12.35196, 43.11722]);

Map.addLayer(station,{},'station');
Map.centerObject(geometry, 14)


//angle normalization
var norm = require("users/bene96detta/radar:preprocessing/angleNormalization");

//Sentinel-1 GRD
var coll =ee.ImageCollection("COPERNICUS/S1_GRD")  
  .filterBounds(station) 
  .filterDate("2015-08-01","2015-09-01")   
  .map(function(img){  
  var vv = img.select("VV")
  var mask = vv.gt(-40) 
  return img.updateMask(mask)}) 


//normalization
var norm = coll.map(norm.normASC).select(["VV_norm"])

var driest=norm.min(); 
var wettest=norm.max();  

var SMmax=0.35; 
var SMmin=0.05;

var moistureVol =function (image){ 
  var sensitivity=wettest.subtract(driest);
  //relative soil moisture
  var mr = image.subtract(driest).divide(sensitivity) 
  //volumetri soil moisture
  var mv = mr.multiply(SMmax-SMmin).add(SMmin) 
  return image.addBands(mv).rename("VV_norm","moisture")} 

var coll_hum = norm.map(moistureVol); 
var SSM = coll_hum.select("moisture");

//visualize first 5
var list = SSM.toList(5); 
var visParams = {
  bands: ["moisture"],
  min: 0,
  max: 1
};
// client side loop 
for(var i = 0; i < 5; i++){
  var image = ee.Image(list.get(i));
  var string = "moisture" + i.toString()
  Map.addLayer(image, visParams, string,0)
}

var mean = function (img){
  var mean = img.reduceRegion({
    reducer: ee.Reducer.mean(), 
    geometry:geometry, 
    scale:10
  })
  return img.set('mean',mean)
}

var meanSSM = SSM.map(mean);

print(meanSSM)

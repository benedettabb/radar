//import land cover classification for 2015/09 
var an = ee.Image("users/bene96detta/classASC/asc202009an");

var geometry = ee.Geometry.Polygon(
        [[[13.371809900785982, 43.54019105429452],
          [13.372389257933198, 43.54054880628671],
          [13.370962322676364, 43.54163760368871],
          [13.370415152098237, 43.54101543612983],
          [13.371766985441743, 43.54015994532531]]]);
          

//assam station
var station = ee.Geometry.Point([13.371661467311311,43.53964124588689])
Map.addLayer(station,{},'station');
Map.centerObject(station, 14)


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

var mask =  an.eq (1).or(an.eq(3)).or(an.eq(5)) 
var SSM_masked  =SSM.map (function(img){
return img.updateMask (mask) 
})

//visualize first 5
var list = SSM_masked.toList(5); 
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


//rainfall precipitation


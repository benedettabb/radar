//area d'interesse
var region = require("users/bene96detta/radar:preprocessing/area");
region = region.addRegion();

//Sentinel-1 GRD
var coll =ee.ImageCollection("COPERNICUS/S1_GRD")  
  .filterBounds(region) 
  .filterDate("2015-08-01","2015-11-01") 
  .select("VV","angle") 
  .map(function(img){  
  var vv = img.select("VV")
  var mask = vv.gt(-40) //1 dove VV>-40 e 0 dove VV<-40 
  return img.updateMask(mask)}) 

//regressione lineare
var linearfit=coll.select(["angle", "VV"]) 
  .reduce(ee.Reducer.linearFit()); 
var beta=linearfit.select("scale"); //'beta'=pendenza 

//funzione di normalizzazione
var norm = function(image){  
  var VVnorm = image.select("VV").subtract(beta.multiply(image.select("angle").subtract(40))).rename("VV_norm")
  return image.addBands(VVnorm); }; 
  
//normalizzazione di ogni immagine contenuta nella collezione 
var VVnorm = coll.map(norm); 

var s1 = VVnorm.select(["VV_norm"]).map(
  function(img){return img.clip(region)
  });

var driest=s1.min(); 
var wettest=s1.max();  

var SMmax=0.35; 
var SMmin=0.05;

var moistureVol =function (image){ 
  var sensitivity=wettest.subtract(driest);
  //umidita' relativa
  var mr = image.subtract(driest).divide(sensitivity) 
  //umidita' volumetrica
  var mv = mr.multiply(SMmax-SMmin).add(SMmin) 
  return image.addBands(mv).rename("VV_norm","moisture")} 

var coll_hum = s1.map(moistureVol); 
var SSM = coll_hum.select("moisture");

//visualizzazione delle prime 5 immagini di umidità
var list = SSM.toList(5); 
var visParams = {
  bands: ["moisture"],
  min: 0,
  max: 1
};
// ciclo client side 
for(var i = 0; i < 5; i++){
  var image = ee.Image(list.get(i));
  var string = "moisture" + i.toString()
  Map.addLayer(image, visParams, string)
}

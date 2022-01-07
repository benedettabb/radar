//area d'interesse
var region = require("users/bene96detta/radar:preprocessing/area");
region = region.addRegion();
var point = ee.Geometry.Point([13.175884885428433,43.388269749078034]);
//'region' viene aggiunto alla mappa
Map.addLayer(region,{color: "08ffcc"},"Marche") 
//la mappa viene centrata su "region", con livello di zoom 9
Map.centerObject(region, 9)

//Sentinel-1 GRD
var coll =ee.ImageCollection("COPERNICUS/S1_GRD")  
  .filterBounds(point) 
  .filterDate("2015-08-01","2021-02-01") 
  .filter(ee.Filter.calendarRange(8, 1,"month"))
  .select("VV","angle") 
  .map(function(img){  
  var vv = img.select("VV")
  var mask = vv.gt(-40) //1 dove VV>-40 e 0 dove VV<-40 
  return img.updateMask(mask)}) 

//regressione lineare
var linearfit=coll.select(["angle", "VV"]) 
  .reduce(ee.Reducer.linearFit()); 
var beta=linearfit.select("scale"); //"beta"=pendenza 

//funzione di normalizzazione
var norm = function(image){  
  var VVnorm = image.select("VV").subtract(beta.multiply(image.select("angle").subtract(40))).rename("VV_norm")
  return image.addBands(VVnorm); }; 
  
//normalizzazione di ogni immagine contenuta nella collezione 
var VVnorm = coll.map(norm); 

var s1 = VVnorm.select(["VV_norm","angle"]).map(function(img){
  return img.clip(region)})

var s2 = ee.ImageCollection("COPERNICUS/S2") //collezione sentinel2
  .filterBounds(point) 
  .filterDate("2015-08-01","2021-02-01") 
  .filter(ee.Filter.calendarRange(8, 1,"month"))
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30)) 
  .map(function (img) { //funzione per il calcolo dell'NDVI
    var ndvi = img.normalizedDifference(["B8","B4"])
    .rename("ndvi");
    return img.addBands(ndvi)})
  .map (function(img) {
     var mask = img.select("ndvi").lt(0.7)
     return img.updateMask(mask)})

//Filtro maxDifference
var maxDiffFilter = ee.Filter.maxDifference({ 
  difference: 10 * 24 * 60 * 60 * 1000,  //differenza massima
  leftField: "system:time_start", //operatore 1 
  rightField: "system:time_start" //operatore 2
});

//Definizione del join
var saveBestJoin = ee.Join.saveBest({ 
  matchKey: "bestImage",
  measureKey: "timeDiff"
});

//Applicazione del join alle due collezioni, secondo la condizione definita dal filtro
var join = saveBestJoin.apply(s1, s2, maxDiffFilter); 

//unione di ciascuna immagine
var plot = join.map(function(img) {
  var cat = ee.Image.cat([img, img.get("bestImage")]);
  var image = ee.Image(img)  //explicit cast
  var mask0 = ee.Image(image.get("bestImage"));
  var mask = mask0.select("B1") 
  return cat.updateMask(mask)  
}).filterBounds(point)

//preparazione del dataset con l'aggiunta delle bande necessarie
var dataset = plot.map(function(img){
  var normAngle = ee.Image.constant(40); 
  var cos = normAngle.cos().rename("cos"); 
  var Avv = ee.Image.constant(0.0950).toFloat().rename("Avv");  
  var Bvv = ee.Image.constant(0.5513).toFloat().rename("Bvv");  
  var add = ee.Image.cat([img, cos, Avv, Bvv]).select(["VV_norm","cos","Avv","Bvv","ndvi"]); 
  var vv_norm = add.select("VV_norm")
  var mask = vv_norm.gt(-40)
  return add.updateMask(mask)
});

//calcolo di tau^2 = exp (-2*Bvv*V*sec(theta_i)) 
var tau = dataset.map(function (image) {
  var img = ee.Image(image) 
  var num = ee.Image.constant(-2).multiply(img.select("Bvv")).multiply(img.select("ndvi")) 
  var den = img.select("cos") 
  var t = num.divide(den) 
  var tau = t.exp().rename("tau") 
  return img.addBands(tau) //tau è aggiunto come banda
  })
  
//calcolo di sigma_veg = A*V*cos(theta_i)(1-tau^2)
var sigma_veg = tau.map(function(image){
  var img = ee.Image(image)
  var fin = ee.Image.constant(1).subtract(img.select("tau"))
  var v = img.select("Avv").multiply(img.select("ndvi")).multiply(img.select("cos")).multiply(fin)
  var veg = v.rename("sigma_veg")
  return img.addBands(veg) //sigma_veg è aggiunto come banda
})

//calcolo di sigma_soil a partire da:
//sigma tot = sigma_veg + tau^2*sigma_soil 
var sigma_soil = sigma_veg.map(function(image){
  var img = ee.Image(image)
  var num = img.select("VV_norm").subtract(img.select("sigma_veg"))
  var den = img.select("tau")
  var soil = num.divide(den).rename("sigma_soil")
  return img.addBands(soil)
});

//visualizzazione delle prime 5 immagini della collezione nella mappa
var list = sigma_soil.toList(5); 
var visParams = {
  bands: ["sigma_soil"],
  min: -10,
  max: 1
};
// ciclo client side 
for(var i = 0; i < 5; i++){
  var image = ee.Image(list.get(i));
  var string = "sigma_soil" + i.toString()
  Map.addLayer(image, visParams, string)
}

var Cvv = ee.Image.constant(43.204).toFloat() //intercetta
var Dvv = ee.Image.constant(2.14).toFloat() //pendenza     

//umidità calcolata con il modello [%]
var moisture =sigma_soil.map(function (img){
  var image = ee.Image(img)
  var hum = Cvv.add(Dvv.multiply(image.select("sigma_soil"))).rename("hum_wcm")
  return image.addBands(hum).select("hum_wcm")
})

//visualizzazione delle prime 5 immagini di umidità
var list = roi_moisture.toList(5); 
var visParams = {
  bands: ["hum_wcm"],
  min: 0,
  max: 100
};
// ciclo client side 
for(var i = 0; i < 5; i++){
  var image = ee.Image(list.get(i));
  var string = "moisture" + i.toString()
  Map.addLayer(image, visParams, string)
}

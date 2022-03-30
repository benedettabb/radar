//HYDRO2
/*var geometry = ee.Geometry.Polygon( 
        [[[12.351986779678068, 43.11728059713532],
          [12.351868762481411, 43.11723752343003],
          [12.352000190723142, 43.11705543879513],
          [12.352123572337828, 43.1171063442315]]]);
          */
          
//HYDRO1
var geometry = ee.Geometry.Polygon( 
        [[[12.352069261089568, 43.117033562361215],
          [12.352069261089568, 43.11672617083199],
          [12.35253596545816, 43.11672617083199],
          [12.35253596545816, 43.117033562361215]]]);    
          
var station = ee.Geometry.Point([12.35196, 43.11722]);

Map.addLayer(station,{},'station');
Map.centerObject(geometry, 14)


//angle normalization
var norm = require("users/bene96detta/radar:preprocessing/angleNormalization");

//Sentinel-1 GRD
var coll =ee.ImageCollection("COPERNICUS/S1_GRD")  
  .filterBounds(station) 
  .filterDate("2015-08-01","2015-09-01")   

var collection=ee.ImageCollection('COPERNICUS/S1_GRD')
.filterBounds(station)
.filterDate('2015-01-01','2016-01-01');
var linearfit=collection.select(['angle', 'VV']).reduce(ee.Reducer.linearFit()); 
var beta=linearfit.select('scale');

var normalization =function(image){
return image.addBands(image.select('VV').subtract(beta.multiply(image.select('angle').subtract(40))));
};


var norm = coll.map(normalization).select('VV_1').map(function(img){return img.rename('VV_norm')});
//Map.addLayer(norm.first(),{min:-20},'normalized')

var s2 = ee.ImageCollection("COPERNICUS/S2") 
  .filterBounds(station) 
  .filterDate("2015-08-01","2015-09-01") 
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30)) 
  .map(function (img) { 
    var ndvi = img.normalizedDifference(["B8","B4"])
    .rename("ndvi");
    return img.addBands(ndvi)})

     
var maxDiffFilter = ee.Filter.maxDifference({ 
  difference: 10 * 24 * 60 * 60 * 1000,  //differenza massima
  leftField: "system:time_start", //operatore 1 
  rightField: "system:time_start" //operatore 2
});


var saveBestJoin = ee.Join.saveBest({ 
  matchKey: "bestImage",
  measureKey: "timeDiff"
});

var join = saveBestJoin.apply(norm, s2, maxDiffFilter); 

var plot = join.map(function(img) {
  var cat = ee.Image.cat([img, img.get("bestImage")]);
  return cat 
})


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


//tau^2 = exp (-2*Bvv*V*sec(theta_i)) 
var tau = dataset.map(function (image) {
  var img = ee.Image(image) 
  var num = ee.Image.constant(-2).multiply(img.select("Bvv")).multiply(img.select("ndvi")) 
  var den = img.select("cos") 
  var t = num.divide(den) 
  var tau = t.exp().rename("tau") 
  return img.addBands(tau) 
  })
  
//sigma_veg = A*V*cos(theta_i)(1-tau^2)
var sigma_veg = tau.map(function(image){
  var img = ee.Image(image)
  var fin = ee.Image.constant(1).subtract(img.select("tau"))
  var v = img.select("Avv").multiply(img.select("ndvi")).multiply(img.select("cos")).multiply(fin)
  var veg = v.rename("sigma_veg")
  return img.addBands(veg) 
})


//sigma tot = sigma_veg + tau^2*sigma_soil 
var sigma_soil = sigma_veg.map(function(image){
  var img = ee.Image(image)
  var num = img.select("VV_norm").subtract(img.select("sigma_veg"))
  var den = img.select("tau")
  var soil = num.divide(den).rename("sigma_soil")
  return img.addBands(soil)
});



var Cvv = ee.Image.constant(37.237).toFloat() 
var Dvv = ee.Image.constant(2.39).toFloat()    


var SSM =sigma_soil.map(function (img){
  var image = ee.Image(img)
  var hum = Cvv.add(Dvv.multiply(image.select("sigma_soil"))).rename("hum_wcm")
  return image.addBands(hum).select("hum_wcm")
})



var list = SSM.toList(5); 
var visParams = {
  bands: ["hum_wcm"],
  min: 5,
  max: 35
};


for(var i = 0; i < 5; i++){
  var image = ee.Image(list.get(i));
  var string = "moisture" + i.toString()
  Map.addLayer(image, visParams, string,0)
}


var mean = function (image){
  var img = ee.Image(image)
  var mean = img.reduceRegion({
    reducer: ee.Reducer.mean(), 
    geometry:geometry, 
    scale:10
  })
  return img.set('mean',mean)
}

var meanSSM = SSM.map(mean);

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

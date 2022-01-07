//AREA OF INTEREST

//confini regionali Marche
var region = ee.FeatureCollection("users/bene96detta/shp_file/Marche"); //cambiare path

//Export region
exports.addRegion = function (){
  return region};

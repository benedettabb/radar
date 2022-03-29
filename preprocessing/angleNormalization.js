exports.normASC = function(image){ 
  var coll = ee.ImageCollection("COPERNICUS/S1_GRD").filterBounds(table).filterDate('2015-09-01','2020-12-31')
  .filter(ee.Filter.eq('orbitProperties_pass','ASCENDING'));
  
  
  var linearfit=coll.select(['angle', 'VV'])
    .reduce(ee.Reducer.linearFit()); 
  var beta=linearfit.select('scale');
   
  var norm = function(image){ 
  var VVnorm = image.select('VV').subtract(beta.multiply(image.select('angle').subtract(40))).rename('VV_norm')
  return image.addBands(VVnorm); };
  var VVnorm = image.select('VV').subtract(beta.multiply(image.select('angle').subtract(40))).rename('VV_norm')
  return image.addBands(VVnorm); 
};
  
  
exports.normDESC = function(image){ 
  var coll = ee.ImageCollection("COPERNICUS/S1_GRD").filterBounds(table).filterDate('2015-09-01','2020-12-31')
  .filter(ee.Filter.eq('orbitProperties_pass','DESCENDING'));
  
  
  var linearfit=coll.select(['angle', 'VV'])
    .reduce(ee.Reducer.linearFit()); 
  var beta=linearfit.select('scale');
   
  var norm = function(image){ 
  var VVnorm = image.select('VV').subtract(beta.multiply(image.select('angle').subtract(40))).rename('VV_norm')
  return image.addBands(VVnorm); };
  var VVnorm = image.select('VV').subtract(beta.multiply(image.select('angle').subtract(40))).rename('VV_norm')
  return image.addBands(VVnorm); 
};

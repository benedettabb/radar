exports.ndviFunction = function(img){
  var ndvi = img.normalizedDifference(['B8','B4']).rename('NDVI')
  var ndbi = img.normalizedDifference(['B11','B8']).rename('NDBI')
  var output = ee.Image.cat([img, ndvi, ndbi])
  return output
};

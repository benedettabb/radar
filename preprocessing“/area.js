//AREA OF INTEREST
//sentinel 2- tile number field: T32TQN, T33TUJ, T32TUH, T33TUH
var s2 = ee.ImageCollection("COPERNICUS/S2_SR")
  .filterBounds (point)
  .filterDate ('2020-01-01', '2021-01-01')
  .sort ('CLOUD_COVERAGE_ASSESSMENT', true)
print (s2)

//Export geometry:
var point = ee.Geometry.Point (12.7, 43.3)
var roi = ee.Geometry.Polygon ([
  [11.437, 44.223],[13.898,44.223], [13.898,42.335],[11.437, 42.335]])
  
exports.addRegion = function (){
  return roi};

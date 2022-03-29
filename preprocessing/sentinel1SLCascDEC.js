//import decomposed SLC images
//SLC (split - orbit - cal -deburst - merge - multilook - refinedLee - TerrainCorrection) ASCENDING

//area of interest
var region = require("users/bene96detta/radar:preprocessing/area");
region = region.addRegion();

//filter function
var filter = require ("users/bene96detta/radar:preprocessing/filterFunction");

//mask0values pixels
var mask = require("users/bene96detta/radar:preprocessing/mask0values")

//funzione per ritagliare sull'area di interesse
var clip = function(img){
  return img.clip(region)};
  
//remove 4th band if present (sometimes accidentally saved theta_i)
var remove4 = function (img){
  return img.select(['b1','b2','b3'])};
  
//terrain normalization
var tN = require("users/bene96detta/radar:preprocessing/terrainNorm")


var angle44 = ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141020T165729_20141020T165754_002916_0034E5_CDA3").select('angle')
var angle117 = ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141013T170552_20141013T170611_002814_0032B1_A706").select('angle')



var p44 = ee.ImageCollection ([
  p44_20141020, 
  p44_20141207, 
  p44_20151226, 
  p44_20150828,
  p44_20160903, 
  p44_20161226,  
  p44_20170823, 
  p44_20171227, 
  p44_20180923,  
  p44_20181228,
  p44_20190912, 
  p44_20200104,
  p44_20200918, 
  p44_20201223])
  .map(remove4).map(function(img){
  return ee.Image.cat([img, angle44])})
var p44 = p44.map(mask.mask).map(clip).map(filter.filterFunctionDEC).map(tN.corrDEC)



var p117 = ee.ImageCollection ([
  p117_20141013, 
  p117_20141212,
  p117_20150902,
  p117_20151219, 
  p117_20160908, 
  p117_20161231, 
  p117_20170822, 
  p117_20171226, 
  p117_20180922, 
  p117_20181227,
  p117_20190911, 
  p117_20200103,
  p117_20200917, 
  p117_20201222]).map(remove4).map(function(img){
  return ee.Image.cat([img, angle117])})
var p117 = p117.map(mask.mask).map(clip).map(filter.filterFunctionDEC).map(tN.corrDEC)


var p44_list = p44.toList(15)
var p117_list =p117.toList(15)

var asc201410 = ee.ImageCollection ([p44_list.get(0),p117_list.get(0)]).mean()
var asc201412 = ee.ImageCollection ([p44_list.get(1),p117_list.get(1)]).mean()
var asc201509 = ee.ImageCollection ([p44_list.get(2),p117_list.get(2)]).mean()
var asc201512 = ee.ImageCollection ([p44_list.get(3),p117_list.get(3)]).mean()
var asc201609 = ee.ImageCollection ([p44_list.get(4),p117_list.get(4)]).mean()
var asc201612 = ee.ImageCollection ([p44_list.get(5),p117_list.get(5)]).mean()
var asc201708 = ee.ImageCollection ([p44_list.get(6),p117_list.get(6)]).mean()
var asc201712 = ee.ImageCollection ([p44_list.get(7),p117_list.get(7)]).mean()
var asc201809 = ee.ImageCollection ([p44_list.get(8),p117_list.get(8)]).mean()
var asc201812 = ee.ImageCollection ([p44_list.get(9),p117_list.get(9)]).mean()
var asc201909 = ee.ImageCollection ([p44_list.get(10),p117_list.get(10)]).mean()
var asc202001 = ee.ImageCollection ([p44_list.get(11),p117_list.get(11)]).mean()
var asc202009 = ee.ImageCollection ([p44_list.get(12),p117_list.get(12)]).mean()
var asc202012 = ee.ImageCollection ([p44_list.get(13),p117_list.get(13)]).mean()



// Export each image
Export.image.toAsset ({
  image:asc201812,
  description: 'asc201812dec',
  assetId: 'asc201812dec',
  scale:10,
  region: region,
  maxPixels:10e10,
  crs: 'EPSG:4326'})

//...
    


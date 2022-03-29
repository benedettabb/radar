//import SLC decomposed images

//SLC (split - orbit - cal -deburst - merge - multilook - refinedLee - TerrainCorrection) DESCENDING

//area of interest
var region = require("users/bene96detta/radar:preprocessing/area");
region = region.addRegion();

//filter function
var filter = require ("users/bene96detta/radar:preprocessing/filterFunction");

//mask0values pixels
var mask = require("users/bene96detta/radar:preprocessing/mask0values")

//clip
var clip = function(img){
  return img.clip(region)};
  
//remove 4th band if present (sometimes accidentally saved theta_i)
var remove4 = function (img){
  return img.select(['b1','b2','b3'])};
  
//terrain correction
var tN = require("users/bene96detta/radar:preprocessing/terrainNorm") 

var angle95 = ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141012T051913_20141012T051938_002792_003250_68A8").select('angle')
var angle22 = ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20150827T051057_20150827T051122_007444_00A415_D255").select('angle')


var p95 = ee.ImageCollection ([
  p95_20141223,
  p95_20150901, 
  p95_20151230,
  p95_20160826,
  p95_20161230,
  p95_20170821,
  p95_20171225,
  p95_20180927,
  p95_20181226,
  p95_20190910,
  p95_20200102,
  p95_20200916,
  p95_20201221])
  .map(remove4).map(function(img){
  return ee.Image.cat([img, angle95])})
var p95 = p95.map(mask.mask).map(clip).map(filter.filterFunctionDEC).map(tN.corrDEC)


var p22 = ee.ImageCollection ([
  p22_20141218,
  p22_20150827,
  p22_20151225,
  p22_20160827,
  p22_20161231,
  p22_20170822,
  p22_20171226,
  p22_20180928,
  p22_20181227,
  p22_20190911,
  p22_20200103,
  p22_20200917,
  p22_20201222]).map(function(img){
  return ee.Image.cat([img, angle22])})
var p22 = p22.map(mask.mask).map(clip).map(filter.filterFunctionDEC).map(tN.corrDEC)


var p95_list = p95.toList(13)
var p22_list =p22.toList(13)

var desc201412 = ee.ImageCollection ([p95_list.get(0),p22_list.get(0)]).mean()
var desc201508 = ee.ImageCollection ([p95_list.get(1),p22_list.get(1)]).mean()
var desc201512 = ee.ImageCollection ([p95_list.get(2),p22_list.get(2)]).mean()
var desc201608 = ee.ImageCollection ([p95_list.get(3),p22_list.get(3)]).mean()
var desc201612 = ee.ImageCollection ([p95_list.get(4),p22_list.get(4)]).mean()
var desc201708 = ee.ImageCollection ([p95_list.get(5),p22_list.get(5)]).mean()
var desc201712 = ee.ImageCollection ([p95_list.get(6),p22_list.get(6)]).mean()
var desc201809 = ee.ImageCollection ([p95_list.get(7),p22_list.get(7)]).mean()
var desc201812 = ee.ImageCollection ([p95_list.get(8),p22_list.get(8)]).mean()
var desc201909 = ee.ImageCollection ([p95_list.get(9),p22_list.get(9)]).mean()
var desc202001 = ee.ImageCollection ([p95_list.get(10),p22_list.get(10)]).mean()
var desc202009 = ee.ImageCollection ([p95_list.get(11),p22_list.get(11)]).mean()
var desc202012 = ee.ImageCollection ([p95_list.get(12),p22_list.get(12)]).mean()
print(desc202012)


//Export each image
Export.image.toAsset ({
  image:desc201512,
  description: 'desc201512dec',
  assetId: 'desc201512dec',
  scale:10,
  region: table,
  maxPixels:10e10,
  crs: 'EPSG:4326'})
//...

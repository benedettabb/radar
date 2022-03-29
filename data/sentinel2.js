//area of interest
var region = require("users/bene96detta/radar:preprocessing/area");
region = region.addRegion();

//add NDVI
var ndvi = require("users/bene96detta/radar:preprocessing/ndvi")

//Function to mask clouds using sentinel 2 CLOUD PROBABILITY 
//_______---------------------------------------------


var s2c = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
                .filterBounds(region)
                .filterDate ('2015-07-01', '2020-12-31')
                .map(function(img){return img.clip(region)})
                
// Load Sentinel-2 TOA reflectance data.
var s2 = ee.ImageCollection('COPERNICUS/S2')
                  .filterBounds(region)
                  .filterDate ('2015-07-01', '2020-12-31')
                  .map(function(img){return img.clip(region)})
                  



function indexJoin(collectionA, collectionB, propertyName) {
  var joined = ee.ImageCollection(ee.Join.saveFirst(propertyName).apply({
    primary: collectionA,
    secondary: collectionB,
    condition: ee.Filter.equals({
      leftField: 'system:index',
      rightField: 'system:index'})
  }));
  // Merge the bands of the joined image.
  return joined.map(function(image) {
    return image.addBands(ee.Image(image.get(propertyName)));
  });
}

var dataset = indexJoin(s2, s2c, 'cloud_probability');




// Aggressively mask clouds and shadows.
var maskS2clouds = function (image) {
  // Compute the cloud displacement index from the L1C bands.
  var cdi = ee.Algorithms.Sentinel2.CDI(image);
  var s2c = image.select('probability');
  var cirrus = image.select('B10').multiply(0.0001);

  // Assume low-to-mid atmospheric clouds to be pixels where probability
  // is greater than 65%, and CDI is less than -0.5. For higher atmosphere
  // cirrus clouds, assume the cirrus band is greater than 0.01.
  // The final cloud mask is one or both of these conditions.
  var isCloud = s2c.gt(60)//.and(cdi.lt(-0.5)).or(cirrus.gt(0.01));

  // Reproject is required to perform spatial operations at 20m scale.
  // 20m scale is for speed, and assumes clouds don't require 10m precision.
  //isCloud = isCloud.focal_min(3).focal_max(16);
  isCloud = isCloud.reproject({crs: cdi.projection(), scale: 20});

  return image.updateMask(isCloud.not());
}


var s2201509 = dataset.filterDate ('2015-08-10', '2015-09-20').map(maskS2clouds).median()
var s2201512 = dataset.filterDate ('2015-12-15', '2016-01-15').map(maskS2clouds).median()
var s2201609 = dataset.filterDate ('2016-08-15', '2016-09-15').map(maskS2clouds).median()
var s2201612 = dataset.filterDate ('2016-12-01', '2017-01-15').map(maskS2clouds).median()
var s2201709 = dataset.filterDate ('2017-08-15', '2017-09-15').map(maskS2clouds).median()
var s2201712 = dataset.filterDate ('2017-12-01', '2018-01-15').map(maskS2clouds).median()
var s2201809 = dataset.filterDate ('2018-08-15', '2018-09-15').map(maskS2clouds).median()
var s2201812 = dataset.filterDate ('2018-12-01', '2019-01-15').map(maskS2clouds).median()
var s2201909 = dataset.filterDate ('2019-08-15', '2019-09-15').map(maskS2clouds).median()
var s2201912 = dataset.filterDate ('2019-12-01', '2020-01-15').map(maskS2clouds).median()
var s2202009 = dataset.filterDate ('2020-08-15', '2020-09-15').map(maskS2clouds).median()
var s2202012 = dataset.filterDate ('2020-11-01', '2021-12-30').map(maskS2clouds).median()

//aggiungo la banda NDVI
var s2201509_ndvi = ndvi.ndviFunction (s2201509)
var s2201512_ndvi = ndvi.ndviFunction (s2201512)
var s2201609_ndvi = ndvi.ndviFunction (s2201609)
var s2201612_ndvi = ndvi.ndviFunction (s2201612)
var s2201709_ndvi = ndvi.ndviFunction (s2201709)
var s2201712_ndvi = ndvi.ndviFunction (s2201712)
var s2201809_ndvi = ndvi.ndviFunction (s2201809)
var s2201812_ndvi = ndvi.ndviFunction (s2201812)
var s2201909_ndvi = ndvi.ndviFunction (s2201909)
var s2201912_ndvi = ndvi.ndviFunction (s2201912)
var s2202009_ndvi = ndvi.ndviFunction (s2202009)
var s2202012_ndvi = ndvi.ndviFunction (s2202012)


//Export
Export.image.toAsset ({
  image:s2201712_ndvi,
  description: 's2201712',
  assetId: 's2201712',
  scale:10,
  region: region,
  maxPixels:10e10,
});
//...

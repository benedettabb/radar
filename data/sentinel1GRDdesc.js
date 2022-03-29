
//GRD DESCENDING

//area of interest
var region = require("users/bene96detta/radar:preprocessing/area");
region = region.addRegion();

//filter function
var filter = require ("users/bene96detta/radar:preprocessing/filterFunction");

//add SPAN e RATIO
var sr = require("users/bene96detta/radar:preprocessing/span_ratio")

//terrain correction
var tN = require("users/bene96detta/radar:preprocessing/terrainNorm")


//PATH 95
var p95ott2014 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141012T051913_20141012T051938_002792_003250_68A8"))).clip(region)
var p95dic2014 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141223T051850_20141223T051915_003842_00498A_E840"))).clip(region)
var p95set2015 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20150901T051914_20150901T051939_007517_00A624_1769"))).clip(region)
var p95dic2015 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20151230T051913_20151230T051938_009267_00D602_3940"))).clip(region)
var p95ago2016 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20160826T051923_20160826T051948_012767_0141C5_CCA4"))).clip(region)
var p95dic2016 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20161230T051833_20161230T051858_003621_00634A_AAEF"))).clip(region)
var p95ago2017 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20170821T051915_20170821T051940_018017_01E3E6_CA63"))).clip(region)
var p95dic2017 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20171225T051839_20171225T051904_008871_00FCF9_4792"))).clip(region)
var p95set2018 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20180927T051846_20180927T051911_012896_017D0E_412D"))).clip(region)
var p95dic2018 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20181226T051921_20181226T051946_025192_02C8A1_3834"))).clip(region)
var p95set2019 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20190910T051846_20190910T051911_017971_021D59_BAD5"))).clip(region)
var p95gen2020 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20200102T051927_20200102T051952_030617_038202_EB9A"))).clip(region)
var p95set2020 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20200916T051853_20200916T051918_023396_02C711_3FC2"))).clip(region)
var p95dic2020 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20201221T051903_20201221T051928_024796_02F32F_9F86"))).clip(region)

//PATH 22
var p22ott2014_1 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141007T051049_20141007T051114_002719_0030BD_DD98"))).clip(region)
var p22ott2014_2 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141007T051114_20141007T051139_002719_0030BD_F2B5"))).clip(region)
var p22ott2014 = ee.ImageCollection ([p22ott2014_1, p22ott2014_2]).mean()
var p22dic2014_1 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141218T051042_20141218T051107_003769_0047F5_40B7"))).clip(region)
var p22dic2014_2 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141218T051107_20141218T051132_003769_0047F5_D43E"))).clip(region)
var p22dic2014 = ee.ImageCollection ([p22dic2014_1, p22dic2014_2]).mean()
var p22ago2015_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20150827T051057_20150827T051122_007444_00A415_D255"))).clip(region)
var p22ago2015_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20150827T051122_20150827T051147_007444_00A415_E9A5"))).clip(region)
var p22ago2015= ee.ImageCollection ([p22ago2015_1, p22ago2015_2]).mean()
var p22dic2015_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20151225T051051_20151225T051116_009194_00D3ED_5016"))).clip(region)
var p22dic2015_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20151225T051116_20151225T051141_009194_00D3ED_597E"))).clip(region)
var p22dic2015= ee.ImageCollection ([p22dic2015_1, p22dic2015_2]).mean()
var p22ago2016_1 = tN.corr(filter.filterFunction(ee.Image('COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20160827T170543_20160827T170608_012789_014270_EEA8'))).clip(region)
var p22ago2016_2 = tN.corr(filter.filterFunction(ee.Image('COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20160827T170608_20160827T170633_012789_014270_8531'))).clip(region)
var p22ago2016 = ee.ImageCollection ([p22ago2016_1, p22ago2016_2]).mean()
var p22dic2016 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20161231T051117_20161231T051142_014619_017C44_4ECF"))).clip(region)
var p22ago2017_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20170822T051026_20170822T051051_007048_00C6A3_8FAC"))).clip(region)
var p22ago2017_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20170822T051051_20170822T051116_007048_00C6A3_7AD8"))).clip(region)
var p22ago2017= ee.ImageCollection ([p22ago2017_1, p22ago2017_2]).mean()
var p22dic2017_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20171226T051103_20171226T051128_019869_021CED_853F"))).clip(region)
var p22dic2017_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20171226T051128_20171226T051153_019869_021CED_2937"))).clip(region)
var p22dic2017= ee.ImageCollection ([p22dic2017_1, p22dic2017_2]).mean()
var p22set2018_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20180928T051111_20180928T051136_023894_029BAF_8D78"))).clip(region)
var p22set2018_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20180928T051136_20180928T051201_023894_029BAF_BE30"))).clip(region)
var p22set2018= ee.ImageCollection ([p22set2018_1, p22set2018_2]).mean()
var p22dic2018_1 = tN.corr (filter.filterFunction (ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20181227T051034_20181227T051059_014223_01A70C_3BFC"))).clip(region)
var p22dic2018_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20181227T051059_20181227T051124_014223_01A70C_1AEF"))).clip(region)
var p22dic2018 = ee.ImageCollection ([p22dic2018_1, p22dic2018_2]).mean()
var p22set2019_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20190911T051117_20190911T051142_028969_034910_6442"))).clip(region)
var p22set2019_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20190911T051142_20190911T051207_028969_034910_C4E2"))).clip(region)
var p22set2019= ee.ImageCollection ([p22set2019_1, p22set2019_2]).mean()
var p22gen2020 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20200103T051051_20200103T051116_019648_02521F_3D0A"))).clip(region)
var p22set2020_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20200917T051123_20200917T051148_034394_03FFFA_122D"))).clip(region)
var p22set2020_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20200917T051148_20200917T051213_034394_03FFFA_0BBC"))).clip(region)
var p22set2020= ee.ImageCollection ([p22set2020_1, p22set2020_2]).mean()
var p22dic2020_1 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20201222T051122_20201222T051147_035794_04309F_1365"))).clip(region)
var p22dic2020_2 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20201222T051147_20201222T051212_035794_04309F_8284"))).clip (region)
var p22dic2020= ee.ImageCollection ([p22dic2020_1, p22dic2020_2]).mean()


var desc2014ott = sr.span_ratioGEE(ee.ImageCollection ([p95ott2014, p22ott2014]).mean())
var desc2014dic = sr.span_ratioGEE(ee.ImageCollection([p95dic2014, p22dic2014]).mean())
var desc2015set = sr.span_ratioGEE(ee.ImageCollection([p95set2015,p22ago2015]).mean())
var desc2015dic = sr.span_ratioGEE(ee.ImageCollection([p95dic2015,p22dic2015]).mean())
var desc2016ago = sr.span_ratioGEE(ee.ImageCollection([p95ago2016,p22ago2016]).mean())
var desc2016dic = sr.span_ratioGEE(ee.ImageCollection([p95dic2016,p22dic2016]).mean())
var desc2017ago = sr.span_ratioGEE(ee.ImageCollection([p95ago2017,p22ago2017]).mean())
var desc2017dic = sr.span_ratioGEE(ee.ImageCollection([p95dic2017,p22dic2017]).mean())
var desc2018set = sr.span_ratioGEE(ee.ImageCollection([p95set2018,p22set2018]).mean())
var desc2018dic = sr.span_ratioGEE(ee.ImageCollection([p95dic2018, p22dic2018]).mean())
var desc2019set = sr.span_ratioGEE(ee.ImageCollection([p95set2019,p22set2019]).mean())
var desc2020gen = sr.span_ratioGEE(ee.ImageCollection([p95gen2020,p22gen2020]).mean())
var desc2020set = sr.span_ratioGEE(ee.ImageCollection([p95set2020,p22set2020]).mean())
var desc2020dic = sr.span_ratioGEE(ee.ImageCollection([p95dic2020,p22dic2020]).mean())


//Export
Export.image.toAsset ({
  image:desc2014ott,
  description: 'desc201410',
  assetId: 'desc201410',
  scale:10,
  region: region,
  maxPixels:10e10,
  crs: 'EPSG:4326'})
 
 //...

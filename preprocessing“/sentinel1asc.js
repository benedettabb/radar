//GRD di Google Earth Engine
//ORBITE ASCENDENTI

//importo l'area d'interesse (cambiare path)
var region = require("users/bene96detta/radar:preprocessing/area");
region = region.addRegion();

//funzione per convertire to/from dB
var from_to_dB = require("users/bene96detta/radar:preprocessing/from_to_dB")

//refined lee filter
var lee = require ("users/bene96detta/radar:preprocessing/refinedLeeFilter");

//filter function: funzione per applicare il filtro ad entrambe le bande
var filter = require ("users/bene96detta/radar:preprocessing/filterFunction");

//richiamo la funzione per aggiungere le bande SPAN e RATIO
var sr = require("users/bene96detta/radar:preprocessing/span_ratio")

//richiamo la funzione per normalizzare l'immagine
var tN = require("users/bene96detta/radar:preprocessing/terrainNorm")

//clip collection
var cc = function(image){return image.clip(region)}


//normalizzazione di ogni immagine + filtro per lo speckle
  
//PATH 44
var p44ott2014 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141020T165729_20141020T165754_002916_0034E5_CDA3"))).clip(region)
var p44dic2014 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141207T165728_20141207T165753_003616_00446E_DF07"))).clip(region)
var p44ago2015 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20150828T165735_20150828T165800_007466_00A4B1_68AF"))).clip(region)
var p44dic2015 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20151226T165734_20151226T165759_009216_00D488_D463"))).clip(region)
var p44set2016 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20160903T165742_20160903T165807_012891_0145DC_196E"))).clip(region)
var p44dic2016 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20161226T165655_20161226T165720_003570_0061B4_2004"))).clip(region)
var p44ago2017 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20170823T165658_20170823T165723_007070_00C745_C2B1"))).clip(region)
var p44dic2017 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20171227T165741_20171227T165806_019891_021DA3_FF61"))).clip(region)
var p44set2018 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20180923T165705_20180923T165730_012845_017B73_C650"))).clip(region)
var p44dic2018 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20181228T165704_20181228T165729_014245_01A7C8_5290"))).clip(region)
var p44set2019 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20190912T165755_20190912T165820_028991_0349D0_CD5B"))).clip(region)
var p44gen2020 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20200104T165710_20200104T165735_019670_0252D8_2401"))).clip(region)
var p44set2020 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20200918T165802_20200918T165827_034416_0400BC_3A60"))).clip(region)
var p44dic2020 = tN.corr(filter.filterFunction(ee.Image("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20201223T165800_20201223T165825_035816_043152_F2BF"))).clip(region)

exports.p44dic2017 = function(){
  return p44dic2017}

//PATH 117
var p117ott2014 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141013T170552_20141013T170611_002814_0032B1_A706"))).clip(region)
var p117dic2014 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20141212T170551_20141212T170610_003689_004602_3F98"))).clip(region)
var p117sett2015_1 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20150902T170538_20150902T170603_007539_00A6B8_FAB8"))).clip(region)
var p117sett2015_2 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20150902T170603_20150902T170628_007539_00A6B8_A08A"))).clip(region)
var p117sett2015 = ee.ImageCollection ([p117sett2015_1, p117sett2015_2]).mean()
var p117dic2015_1 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20151219T170538_20151219T170603_009114_00D199_7200"))).clip(region)
var p117dic2015_2 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20151219T170603_20151219T170628_009114_00D199_2DB9"))).clip(region)
var p117dic2015 = ee.ImageCollection ([p117dic2015_1, p117dic2015_2]).mean()
var p117sett2016 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20160908T170553_20160908T170618_012964_014825_71D4"))).clip(region)
var p117dic2016 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20161213T170553_20161213T170618_014364_01745F_641C"))).clip(region)
var p117ago2017 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20170822T170558_20170822T170623_018039_01E48A_29F6"))).clip(region)
var p117dic2017 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20171226T170515_20171226T170540_008893_00FDA5_A268"))).clip(region)
var p117set2018 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20180922T170606_20180922T170631_023814_02992C_82D0"))).clip(region)
var p117dic2018 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20181227T170605_20181227T170630_025214_02C978_F003"))).clip(region)
var p117sett2019 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20190911T170529_20190911T170554_017993_021DF8_2036"))).clip(region)
var p117gen2020 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1A_IW_GRDH_1SDV_20200103T170611_20200103T170636_030639_0382D5_CD98"))).clip(region)
var p117sett2020 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20200917T170536_20200917T170601_023418_02C7BE_A6D3"))).clip(region)
var p117dic2020 = tN.corr(filter.filterFunction(ee.Image ("COPERNICUS/S1_GRD_FLOAT/S1B_IW_GRDH_1SDV_20201222T170535_20201222T170600_024818_02F3DF_F219"))).clip(region)


//faccio i mosaici
var asc2014ott = sr.span_ratioGEE(ee.ImageCollection ([p44ott2014,p117ott2014]).mean())
var asc2014dic = sr.span_ratioGEE(ee.ImageCollection ([p44dic2014,p117dic2014]).mean())
var asc2015set = sr.span_ratioGEE(ee.ImageCollection ([p44ago2015,p117sett2015]).mean())
var asc2015dic = sr.span_ratioGEE(ee.ImageCollection ([p44dic2015,p117dic2015]).mean())
var asc2016set = sr.span_ratioGEE(ee.ImageCollection ([p44set2016,p117sett2016]).mean())
var asc2016dic = sr.span_ratioGEE(ee.ImageCollection ([p44dic2016,p117dic2016]).mean())
var asc2017ago = sr.span_ratioGEE(ee.ImageCollection ([p44ago2017,p117ago2017]).mean())
var asc2017dic = sr.span_ratioGEE(ee.ImageCollection ([p44dic2017,p117dic2017]).mean())
var asc2018set = sr.span_ratioGEE(ee.ImageCollection ([p44set2018,p117set2018]).mean())
var asc2018dic = sr.span_ratioGEE(ee.ImageCollection ([p44dic2018,p117dic2018]).mean())
var asc2019set = sr.span_ratioGEE(ee.ImageCollection ([p44set2019,p117sett2019]).mean())
var asc2020gen = sr.span_ratioGEE(ee.ImageCollection ([p44gen2020,p117gen2020]).mean())
var asc2020set = sr.span_ratioGEE(ee.ImageCollection ([p44set2020,p117sett2020]).mean())
var asc2020dic = sr.span_ratioGEE(ee.ImageCollection ([p44dic2020, p117dic2020]).mean())

//unisco in una image collection 
var ascGEE = ee.ImageCollection ([asc2014ott, asc2014dic, asc2015set, asc2015dic, asc2016set, asc2016dic, asc2017ago , asc2017dic , asc2018set, asc2018dic, asc2019set, asc2020gen, asc2020set, asc2020dic])

//ARD dataset

//import area of interest
var roi = require("users/bene96detta/AnalysisReadyData:preprocessing/area");
roi = roi.addRegion();

//import intervals
var intervals = require("users/bene96detta/AnalysisReadyData:preprocessing/intervals");

//import function to convert to/from dB
var from_to_dB = require("users/bene96detta/AnalysisReadyData:preprocessing/from_to_dB")

//import terrain correction
var tC = require ("users/bene96detta/AnalysisReadyData:preprocessing/terrainCorrection");

//import refined lee filter
var lee = require ("users/bene96detta/AnalysisReadyData:preprocessing/refinedLeeFilter");

//import multi temp function
var mTF = require ("users/bene96detta/AnalysisReadyData:preprocessing/multiTempFilter");

//dataset
var s1 = ee.ImageCollection ("COPERNICUS/S1_GRD")
  .filterBounds(roi)
  .filterDate ('2020-01-01', '2021-01-01')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .map(function(image){return image.clip(roi)})

//orbite ascendenti e discendenti
var s1asc = s1.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
var s1desc = s1.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))

//Map.addLayer (s1asc, {}, 's1 asc')
//Map.addLayer (s1desc, {}, 's1 desc')


//intervals over the year
//INTERVAL 1 = a
var a_asc = s1asc.mean()
var a_desc = s1desc.mean()

//INTERVAL 2 = b
var ba_asc = s1asc.filterDate(intervals.primaMeta()).mean()
var ba_desc = s1desc.filterDate(intervals.primaMeta()).mean()
var bb_asc = s1asc.filterDate(intervals.secondaMeta()).mean()
var bb_desc = s1desc.filterDate(intervals.secondaMeta()).mean()

//INTERVAL 3 = c
var ca_asc = s1asc.filterDate(intervals.un_terzo()).mean()
var ca_desc = s1asc.filterDate(intervals.un_terzo()).mean()
var cb_asc = s1asc.filterDate(intervals.due_terzi()).mean()
var cb_desc = s1asc.filterDate(intervals.due_terzi()).mean()
var cc_asc = s1asc.filterDate(intervals.tre_terzi()).mean()
var cc_desc = s1asc.filterDate(intervals.tre_terzi()).mean()

//INTERVAL 4 = d
var da_asc = s1asc.filterDate(intervals.un_quarto()).mean()
var da_desc = s1asc.filterDate(intervals.un_quarto()).mean()
var db_asc = s1asc.filterDate(intervals.due_quarti()).mean()
var db_desc = s1asc.filterDate(intervals.due_quarti()).mean()
var dc_asc = s1asc.filterDate(intervals.tre_quarti()).mean()
var dc_desc = s1asc.filterDate(intervals.tre_quarti()).mean()
var dd_asc = s1asc.filterDate(intervals.quattro_quarti()).mean()
var dd_desc = s1asc.filterDate(intervals.quattro_quarti()).mean()

//INTERVAL 6 = e
var ea_asc =s1asc.filterDate(intervals.bimestre1()).mean()
var ea_desc = s1asc.filterDate(intervals.bimestre1()).mean()
var eb_asc = s1asc.filterDate(intervals.bimestre2()).mean()
var eb_desc = s1asc.filterDate(intervals.bimestre2()).mean()
var ec_asc = s1asc.filterDate(intervals.bimestre3()).mean()
var ec_desc = s1asc.filterDate(intervals.bimestre3()).mean()
var ed_asc = s1asc.filterDate(intervals.bimestre4()).mean()
var ed_desc = s1asc.filterDate(intervals.bimestre4()).mean()
var ee_asc = s1asc.filterDate(intervals.bimestre5()).mean()
var ee_desc = s1asc.filterDate(intervals.bimestre5()).mean()
var ef_asc = s1asc.filterDate(intervals.bimestre6()).mean()
var ef_desc = s1asc.filterDate(intervals.bimestre6()).mean()

//INTERVAL 12 = f
var fa_asc = s1asc.filterDate(intervals.gennaio()).mean()
var fa_desc = s1desc.filterDate(intervals.gennaio()).mean()
var fb_asc = s1asc.filterDate(intervals.febbraio()).mean()
var fb_desc = s1asc.filterDate(intervals.febbraio()).mean()
var fc_asc = s1asc.filterDate(intervals.marzo()).mean()
var fc_desc = s1desc.filterDate(intervals.marzo()).mean() 
var fd_asc = s1asc.filterDate(intervals.aprile()).mean()
var fd_desc = s1desc.filterDate(intervals.aprile()).mean()
var fe_asc = s1asc.filterDate(intervals.maggio()).mean()
var fe_desc = s1desc.filterDate(intervals.maggio()).mean() 
var ff_asc = s1asc.filterDate(intervals.giugno()).mean()
var ff_desc = s1desc.filterDate(intervals.giugno()).mean()
var fg_asc = s1asc.filterDate(intervals.luglio()).mean()
var fg_desc = s1desc.filterDate(intervals.luglio()).mean()
var fh_asc = s1asc.filterDate(intervals.agosto()).mean()
var fh_desc = s1desc.filterDate(intervals.agosto()).mean()
var fi_asc = s1asc.filterDate(intervals.settembre()).mean()
var fi_desc = s1desc.filterDate(intervals.settembre()).mean()
var fj_asc = s1asc.filterDate(intervals.ottobre()).mean()
var fj_desc  = s1desc.filterDate(intervals.ottobre()).mean()
var fk_asc = s1asc.filterDate(intervals.novembre()).mean()
var fk_desc = s1desc.filterDate(intervals.novembre()).mean()
var fl_asc = s1asc.filterDate(intervals.dicembre()).mean()
var fl_desc = s1desc.filterDate(intervals.dicembre()).mean() 


//apply terrainCorrection to image collection
//per ogni intervallo (solo orbite ascendenti) è stata creata una collezione di immagini
//la funzione terrainCorrection viene applicata ad ogni immagine nella collezione 
var COLLECTION2_asc = ee.ImageCollection ([ba_asc, bb_asc]).map(tC.terrainCorrection);
var COLLECTION3_asc = ee.ImageCollection ([ca_asc, cb_asc, cc_asc]).map(tC.terrainCorrection);
var COLLECTION4_asc = ee.ImageCollection ([ca_asc, cb_asc, cc_asc]).map(tC.terrainCorrection);
var COLLECTION6_asc = ee.ImageCollection ([ea_asc, eb_asc, ec_asc, ed_asc, ee_asc, ef_asc]).map(tC.terrainCorrection);
var COLLECTION12_asc = ee.ImageCollection ([fa_asc, fb_asc, fc_asc, fd_asc, fe_asc, ff_asc, fg_asc, fh_asc, 
  fi_asc, fj_asc, fk_asc, fl_asc]).map(tC.terrainCorrection)
  

//apply refinedLeeFilter
var COLLECTION2_asc_filtered = COLLECTION2_asc.map(mTF.MultiTempFilter)
var COLLECTION3_asc_filtered = COLLECTION2_asc.map(mTF.MultiTempFilter)
var COLLECTION4_asc_filtered = COLLECTION2_asc.map(mTF.MultiTempFilter)
var COLLECTION6_asc_filtered = COLLECTION2_asc.map(mTF.MultiTempFilter)
var COLLECTION12_asc_filtered = COLLECTION2_asc.map(mTF.MultiTempFilter)


//ATTIVARE per vedere la prima immagine della COLLECTION2 non corretta, corretta e filtrata
//prima immagine NON CORRETTA
var img_NOcorr = ee.Image (ba_asc)
print(img_NOcorr, 'immagine aggragata media della prima metà del 2020')
//prima immagine CORRETTA
var img_corr = COLLECTION2_asc.first()
print(img_corr, 'immagine corretta con SRTM') 
//prima immagine FILTRATA
var img_filtered = COLLECTION2_asc_filtered.first()
print(img_filtered, 'immagine filtrata')
//LE INSERISCO NELLA MAPPA PER VEDERE LA DIFFERENZA
Map.addLayer(img_NOcorr, {min: -20, max: 0, bands: ['VV','VH', 'angle']}, 'media')
Map.addLayer (img_corr, {min:-20, max:0, bands:['VV','VH','angle']}, 'corretta')
Map.addLayer (img_filtered, {min:-20, max:0, bands: ['VV_filtered', 'VH_filtered','angle']}, 'filtrata')

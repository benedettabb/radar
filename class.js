
Map.addLayer(pu)
var s2 = require("users/bene96detta/radar:data/s2")
var s2201509 = s2.s2201509_ndvi()
var s2201512 = s2.s2201512_ndvi()
var s2201609 = s2.s2201609_ndvi()
var s2201612 = s2.s2201612_ndvi()
var s2201709 = s2.s2201709_ndvi()
var s2201712 = s2.s2201712_ndvi()
var s2201809 = s2.s2201809_ndvi()
var s2201812 = s2.s2201812_ndvi()
var s2201909 = s2.s2201909_ndvi()
var s2201912 = s2.s2201912_ndvi()
var s2202009 = s2.s2202009_ndvi()
var s2202012 = s2.s2202012_ndvi()

var dem = ee.Image("CGIAR/SRTM90_V4")
Map.addLayer(dem.select('elevation'),{},'dem')
var usoSuolo = usoDelSuolo1.merge(usoDelSuolo2).merge(usoDelSuolo3).merge(usoDelSuolo4)
var urb2007 = usoSuolo.filter(ee.Filter.lte("LIV_2", '12'))
Map.setOptions('SATELLITE')
Map.centerObject(fano,12.3)
//Map.centerObject(table,18) //zoom elevato per evitare l'errore reproject output is too large

//Funzione che converte l'immagine lineare in immagine in dB. 
//dB= 10* log (DN)
var toDB = function (img) {
  return ee.Image(img).log10().multiply(10.0);
};

  
//sentinel-1 orbite ascendenti, preprocessate (Refined Lee filter, terrain normalization) 
//convertite in dB
var asc201410 = toDB(asc201410)
var asc201412 = toDB(asc201412)
var asc201509 = toDB(asc201509)
var asc201512 = toDB(asc201512)
var asc201609 = toDB(asc201609)
var asc201612 = toDB(asc201612)
var asc201708 = toDB(asc201708)
var asc201712 = toDB(asc201712)
var asc201809 = toDB(asc201809)
var asc201812 = toDB(asc201812)
var asc201909 = toDB(asc201909)
var asc202001 = toDB(asc202001)
var asc202009 = toDB(asc202009)
var asc202012 = toDB(asc202012)

//discendenti
var desc201712 = toDB(desc201712)
var s201712 = ee.Image.cat([desc201712, asc201712])

//risultato della decomposizione polarimetrica (caricate da SNAP) -> Refinel Lee Filter su GEE
var asc201410dec = asc201410dec.select(['Entropy','Alpha','Anisotropy'])
var asc201412dec = asc201412dec.select(['Entropy','Alpha','Anisotropy'])
var asc201512dec = asc201512dec.select(['Entropy','Alpha','Anisotropy'])
var asc201609dec = asc201609dec.select(['Entropy','Alpha','Anisotropy'])
var asc201612dec = asc201612dec.select(['Entropy','Alpha','Anisotropy'])
var asc201708dec = asc201708dec.select(['Entropy','Alpha','Anisotropy'])
var asc201712dec = asc201712dec.select(['Entropy','Alpha','Anisotropy'])
var asc201809dec = asc201809dec.select(['Entropy','Alpha','Anisotropy'])
var asc201812dec = asc201812dec.select(['Entropy','Alpha','Anisotropy'])
var asc201909dec = asc201909dec.select(['Entropy','Alpha','Anisotropy'])
var asc202009dec = asc202009dec.select(['Entropy','Alpha','Anisotropy'])
var asc202012dec = asc202012dec.select(['Entropy','Alpha','Anisotropy'])

var desc201712dec = desc201712dec.select(['Entropy','Alpha','Anisotropy'])
var dec201712 = ee.Image.cat([asc201712dec, desc201712dec])

//Sentiel -2, mosaici dal settembre al dicembre dei rispettivi anni, nuvole mascherate e calcolato ndvi
var s2201509 = s2201509.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201512 = s2201512.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12']) 
var s2201609 = s2201609.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201612 = s2201612.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201709 = s2201709.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201712 = s2201712.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201809 = s2201809.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201812 = s2201812.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201909 = s2201809.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2201912 = s2201912.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2202009 = s2202009.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])
var s2202012 = s2202012.select(['B2','B3','B4','B5','B6','B7','B8','NDVI','NDBI','B11','B12'])



//totale immagini da classificare
var tot201410 = ee.Image.cat ([asc201410, asc201410dec, s2201509]).clip(pu)
var tot201412 = ee.Image.cat ([asc201412, asc201412dec, s2201512]).clip(pu)
var tot201509 = ee.Image.cat ([asc201509, asc201509dec, s2201509]).clip(pu)
var tot201512 = ee.Image.cat ([asc201512, asc201512dec, s2201512]).clip(pu)
var tot201609 = ee.Image.cat ([asc201609, asc201609dec, s2201609]).clip(pu)
var tot201612 = ee.Image.cat ([asc201612, asc201612dec, s2201612]).clip(pu)
var tot201708 = ee.Image.cat ([asc201708, asc201708dec, s2201709]).clip(pu)
var tot201712 = ee.Image.cat ([asc201712, asc201712dec, s2201712]).clip(pu)
var tot201809 = ee.Image.cat ([asc201809, asc201809dec, s2201809]).clip(pu)
var tot201812 = ee.Image.cat ([asc201812, asc201812dec, s2201812]).clip(pu)
var tot201909 = ee.Image.cat ([asc201909, asc201909dec, s2201909]).clip(pu)
var tot201912 = ee.Image.cat ([asc202001, asc202001dec, s2201912]).clip(pu)
var tot202009 = ee.Image.cat ([asc202009, asc202009dec, s2202009]).clip(pu)
var tot202012 = ee.Image.cat ([asc202012, asc202012dec, s2202012]).clip(pu)


//AGGIUNGO LE IMMAGINI NELLA MAPPA
Map.addLayer(tot201410,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201410',0)
Map.addLayer(tot201412,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201412',0)
Map.addLayer(tot201509,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201509',0)
Map.addLayer(tot201512,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201512',0)
Map.addLayer(tot201609,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201609',0)
Map.addLayer(tot201612,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201612',0)
Map.addLayer(tot201708,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201709',0)
Map.addLayer(tot201712,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201712',0)
Map.addLayer(tot201809,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201809',0)
Map.addLayer(tot201812,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201812',0)
Map.addLayer(tot201909,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201909',0)
Map.addLayer(tot201912,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '201912',0)
Map.addLayer(tot202009,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '202009',0)
Map.addLayer(tot202012,{min:0.05, max:0.25, bands: ['B4','B3','B2']}, '202012',0)

var asc = ee.ImageCollection ([tot201410,tot201412,tot201509,
tot201512,
tot201609,
tot201612,
tot201708,
tot201712,
tot201809,
tot201812,
tot201909,
tot201912,
tot202009,
tot202012])
//------------------------------------------------------------------------------------------

//CLASSIFICAZIONE PIU' DETTAGLIATA CON LE CLASSI DI CORINE LAND COVER
var bandsRAD = ['VV','VH','Entropy','Alpha']
//var newfc = boscato.merge(suolo).merge(acqua).merge(coltivato).merge(URBAN) //merge(arbusti)
var bandsOPT = ['B2','B3','B4','B8','B11','B12','NDVI','NDBI']
var bands = ['VV','VH','Entropy','Alpha','B2','B3','B8','B4','B5','B6','span','ratio','NDVI','B11','B12','NDBI']
var newfc2016 = boscato2016.merge(suolo2016).merge(acqua2016).merge(coltivato2016).merge(urbano2016).merge(arbusti2016)
var newfc2020 = boscato2020.merge(suolo2020).merge(acqua2020).merge(coltivato2020).merge(urbano2020).merge(arbusti2020)
Export.table.toAsset({
  collection: newfc2020,
  assetId: 'newfcFANO2020',
  description: 'newfcFANO2020'})
  
//TRAINING
var train201512 = tot201512.select(bands).sampleRegions ({
  collection: newfc2015,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201612 = tot201612.select(bands).sampleRegions ({
  collection: newfc2016,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201712 = tot201712.select(bands).sampleRegions ({
  collection: newfc2017,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201812 = tot201812.select(bands).sampleRegions ({
  collection: newfc2018,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201912 = tot201912.select(bands).sampleRegions ({
  collection: newfc2019,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train202012 = tot202012.select(bands).sampleRegions ({
  collection: newfc2020,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train = train201512.merge(train201712).merge(train201812).merge(train201912)
var trainingData = train.randomColumn()
var training1 =trainingData.filter (ee.Filter.lessThan('random',0.9))
var valData = trainingData.filter (ee.Filter.greaterThanOrEquals('random',0.9))

var classifier = function (img){
  var classifier = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 3,
  bagFraction: 0.3,
  seed: 0}).train ({
  features: training1,
  classProperty: 'landcover',
  inputProperties: bands})
  var classified = img.select(bands).classify(classifier)
  return classified}

//ACCURACY OF CLASSIFIER 
// Classify the input imagery.
var accuracyClass = function (img) {
  var classifier = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 3,
  bagFraction: 0.3,
  seed: 0}).train ({
  features: training1,
  classProperty: 'landcover',
  inputProperties: bands})
  var classified = img.select(bands).classify(classifier)
  // Get a confusion matrix representing resubstitution accuracy.
  var trainAccuracy = classifier.confusionMatrix();
  var kappa = trainAccuracy.kappa()
  return img.set('kappa', kappa)};


//VALIDATION
var validation = function (img){
  var classifier = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 3,
  bagFraction: 0.3,
  seed: 0}).train ({
  features: valData,
  classProperty: 'landcover',
  inputProperties: bands})
  var classified = img.select(bands).classify(classifier)
  var confusionMatrix = ee.ConfusionMatrix(valData.classify(classifier)
    .errorMatrix ({
      actual: 'landcover',
      predicted: 'classification'}))
  var accuracy = confusionMatrix.accuracy()
  var kappa = confusionMatrix.kappa()
  return img.set('kappa', kappa)}
    
var asc_class = asc.map(classifier)
var asc_val = asc.map(validation)
var asc_trainingAcc = asc.map(accuracyClass)
print(asc_val,'kappa sul validation set')
print(asc_trainingAcc,'kappa sul training set')


var params = {min:0,max:5, palette: ['256706','orange','blue','green','white','brown']}
Map.addLayer(ee.Image(asc_class.toList(15).get(0)),params, '201410',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(1)),params, '201412',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(2)),params, '201509',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(3)),params, '201512',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(4)),params, '201609',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(5)),params, '201612',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(6)),params, '201709',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(7)),params, '201712',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(8)),params, '201809',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(9)),params, '201812',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(9)),params, '201909',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(10)),params, '202002',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(11)),params, '202009',0)
Map.addLayer(ee.Image(asc_class.toList(15).get(12)),params, '202012',0)

Map.addLayer(urbano2007)

/*

//____________________________________________________________________-----
//CLASSIFY
var classifier = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 3,
  bagFraction: 0.3,
  seed: 0}).train ({
  features: training1,
  classProperty: 'landcover',
  inputProperties: bands})
var class201712 = tot201712.select(bands).classify(classifier)

//VALIDATION     
var confusionMatrix = ee.ConfusionMatrix(valData.classify(classifier)
    .errorMatrix ({
      actual: 'landcover',
      predicted: 'classification'}))
print(confusionMatrix)
print(confusionMatrix.accuracy())
var kappa = confusionMatrix.kappa()
print(kappa)
    
var dict = classifier.explain();
print('Explain:',dict);
 
var variable_importance = ee.Feature(null, ee.Dictionary(dict).get('importance'));
 
var chart =
ui.Chart.feature.byProperty(variable_importance)
.setChartType('ColumnChart')
.setOptions({
title: 'Random Forest Variable Importance',
legend: {position: 'none'},
hAxis: {title: 'Bands'},
vAxis: {title: 'Importance'}
});
 
print(chart);    
    
//--------------------------------------------------------------------------------------------   
//TRAINING
var trainRAD = tot201712.select(bandsRAD).sampleRegions ({
  collection: newfc,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var trainingDataRAD = trainRAD.randomColumn()
var trainingRAD =trainingDataRAD.filter (ee.Filter.lessThan('random',0.8))
var valDataRAD = trainingDataRAD.filter (ee.Filter.greaterThanOrEquals('random',0.8))

//CLASSIFY
var classifierRAD = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 3,
  bagFraction: 0.3,
  seed: 0}).train ({
  features: trainingRAD,
  classProperty: 'landcover',
  inputProperties: bandsRAD})
var classifiedRAD = tot201712.select(bandsRAD).classify(classifierRAD)

 
//VALIDATION     
var confusionMatrixRAD = ee.ConfusionMatrix(valDataRAD.classify(classifierRAD)
    .errorMatrix ({
    actual: 'landcover',
    predicted: 'classification'}))
print(confusionMatrixRAD, 'radar')
print(confusionMatrixRAD.accuracy(),'radar')
var kappaRAD = confusionMatrixRAD.kappa()
print(kappaRAD,'kappa radar')


//RADAR NO ENTROPY ALPHA
//TRAINING
var bandsNO = ['VV','VH']
var trainRAD = tot201712.select(bandsNO).sampleRegions ({
  collection: newfc,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var trainingDataRAD = trainRAD.randomColumn()
var trainingRAD =trainingDataRAD.filter (ee.Filter.lessThan('random',0.8))
var valDataRAD = trainingDataRAD.filter (ee.Filter.greaterThanOrEquals('random',0.8))

//CLASSIFY
var classifierRAD = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 2,
  bagFraction: 0.3,
  seed: 0}).train ({
  features: trainingRAD,
  classProperty: 'landcover',
  inputProperties: bandsNO})
var classifiedRAD_no = tot201712.select(bandsNO).classify(classifierRAD)

 
//VALIDATION     
var confusionMatrixRAD = ee.ConfusionMatrix(valDataRAD.classify(classifierRAD)
    .errorMatrix ({
    actual: 'landcover',
    predicted: 'classification'}))
print(confusionMatrixRAD, 'radar no')
print(confusionMatrixRAD.accuracy(),'radar no')
var kappaRAD = confusionMatrixRAD.kappa()
print(kappaRAD,'kappa radar no')
 
 //----------------------------------------------------------------------------------------------       
//TRAINING
var trainOPT = tot201712.select(bandsOPT).sampleRegions ({
  collection: newfc,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var trainingDataOPT = trainOPT.randomColumn()
var trainingOPT =trainingDataOPT.filter (ee.Filter.lessThan('random',0.8))
var valDataOPT = trainingDataOPT.filter (ee.Filter.greaterThanOrEquals('random',0.8))

//CLASSIFY
var classifierOPT = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 3,
  bagFraction: 0.3,
  seed: 1}).train ({
  features: trainingOPT,
  classProperty: 'landcover',
  inputProperties: bandsOPT})
var classifiedOPT = tot201712.select(bandsOPT).classify(classifierOPT)


//VALIDATION     
var confusionMatrixOPT = ee.ConfusionMatrix(valDataOPT.classify(classifierOPT)
    .errorMatrix ({
    actual: 'landcover',
    predicted: 'classification'}))
print(confusionMatrixOPT, 'ottico')
print(confusionMatrixOPT.accuracy(),'ottico')
var kappaOPT = confusionMatrixOPT.kappa()
print(kappaOPT,'kappa ottico')


Map.addLayer(class201712, {min:0, max:6, palette: ['256706','yellow','yellow','blue','green','white']},  'class dettagliata')
Map.addLayer(classifiedRAD, {min:0, max:4, palette: ['256706','yellow','yellow','blue','green','white']},  'class dettagliata radar')
Map.addLayer(classifiedRAD, {min:0, max:4, palette: ['256706','yellow','blue','yellow','green','white']},  'class dettagliata radar')
Map.addLayer(classifiedRAD_no, {min:0, max:4, palette: ['256706','yellow','yellow','blue','green','white']},  'class dettagliata radar no')


Map.addLayer(urb2007, {},'urbano 2007')
//-----------------------------------------------------------------------------------------



*/

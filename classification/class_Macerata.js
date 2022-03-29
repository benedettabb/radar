//import GRD SLC e Sentinel2 preprocessed
//pick your training data
//import shapefile of Macerata


//to db
var toDB = require("users/bene96detta/radar:preprocessing/from_to_dB")

//angle normalization
var norm= require("users/bene96detta/radar:preprocessing/angleNormalization")


  

//ASCENDING  
//GRD
var asc201509 = norm.normASC(toDB.toDB(asc201509))
var asc201512 = norm.normASC(toDB.toDB(asc201512))
var asc201609 = norm.normASC(toDB.toDB(asc201609))
var asc201612 = norm.normASC(toDB.toDB(asc201612))
var asc201708 = norm.normASC(toDB.toDB(asc201708))
var asc201712 = norm.normASC(toDB.toDB(asc201712))
var asc201809 = norm.normASC(toDB.toDB(asc201809))
var asc201812 = norm.normASC(toDB.toDB(asc201812))
var asc201909 = norm.normASC(toDB.toDB(asc201909))
var asc202001 = norm.normASC(toDB.toDB(asc202001))
var asc202009 = norm.normASC(toDB.toDB(asc202009))
var asc202012 = norm.normASC(toDB.toDB(asc202012))


//combine GRD SLC e Sentienel2 //shape file Macerata
var tot201509 = ee.Image.cat ([asc201509, asc201509dec, s2201509]).clip(mc)
var tot201512 = ee.Image.cat ([asc201512, asc201512dec, s2201512]).clip(mc)
var tot201609 = ee.Image.cat ([asc201609, asc201609dec, s2201609]).clip(mc)
var tot201612 = ee.Image.cat ([asc201612, asc201612dec, s2201612]).clip(mc)
var tot201708 = ee.Image.cat ([asc201708, asc201708dec, s2201709]).clip(mc)
var tot201712 = ee.Image.cat ([asc201712, asc201712dec, s2201712]).clip(mc)
var tot201809 = ee.Image.cat ([asc201809, asc201809dec, s2201809]).clip(mc)
var tot201812 = ee.Image.cat ([asc201812, asc201812dec, s2201812]).clip(mc)
var tot201909 = ee.Image.cat ([asc201909, asc201909dec, s2201909]).clip(mc)
var tot201912 = ee.Image.cat ([asc202001, asc202001dec, s2201912]).clip(mc)
var tot202009 = ee.Image.cat ([asc202009, asc202009dec, s2202009]).clip(mc)
var tot202012 = ee.Image.cat ([asc202012, asc202012dec, s2202012]).clip(mc)


var asc = ee.ImageCollection ([tot201509,
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

var bands = ['B2','B3','B8','B4','B5','B6','NDVI','B11','B12','NDBI','Entropy','Alpha','span','ratio']
  
  
//TRAINING
var train201509 = tot201509.select(bands).sampleRegions ({
  collection:newfc201509,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201512 = tot201512.select(bands).sampleRegions ({
  collection:newfc2015,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201609 = tot201609.select(bands).sampleRegions ({
  collection: newfc201609,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201612 = tot201612.select(bands).sampleRegions ({
  collection: newfc2016,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201709 = tot201708.select(bands).sampleRegions ({
  collection: newfc201709,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201712 = tot201712.select(bands).sampleRegions ({
  collection: newfc2017,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201809 = tot201809.select(bands).sampleRegions ({
  collection: newfc201809,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201812 = tot201812.select(bands).sampleRegions ({
  collection: newfc2018,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201909 = tot201909.select(bands).sampleRegions ({
  collection: newfc201909,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train201912 = tot201912.select(bands).sampleRegions ({
  collection: newfc2019,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train202009 = tot202009.select(bands).sampleRegions ({
  collection: newfc202009,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})
var train202012 = tot202012.select(bands).sampleRegions ({
  collection: newfc2020,
  properties: ['landcover'],
  scale: 200,
  tileScale: 16})

var train = train201512.merge(train201509)
     .merge(train201612).merge(train201609)
     .merge(train201712).merge(train201709)
     .merge(train201812).merge(train201809)
     .merge(train201912).merge(train201909)
     .merge(train202012).merge(train202009)
var trainingData = train.randomColumn()
var training1 =trainingData.filter (ee.Filter.lessThan('random',0.8))
var valData = trainingData.filter (ee.Filter.greaterThanOrEquals('random',0.8))

var countTrain = function (img) {
  var count = img.reduceRegion({
    geometry: newfc2017,
    reducer: ee.Reducer.count(),
    scale: 90,
    tileScale: 16})
    return img.set ('n:pixel:training',count)}; 
var countTot = function (img) {
  var count = img.reduceRegion({
    geometry: mc,
    reducer: ee.Reducer.count(), 
    maxPixels: 10e9,
    scale: 90,
    tileScale: 16,
    bestEffort: true})
    return img.set ('n:pixel',count)}; 
    
//CLASSIFICATION
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

//ACCURACY OF CLASSIFIER - TRAININ SET
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
  var img = img.set('confusion:matrix',trainAccuracy)
  return img.set('kappa', kappa)};


//ACCURACY OF CLASSIFIER - VALIDATION SET
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
  var img = img.set('confusion:matrix',confusionMatrix)
  return img.set('kappa', kappa)}


//VARIABLE IMPORTANCE
var classi = ee.Classifier.smileRandomForest({
  numberOfTrees: 500,
  minLeafPopulation: 1,
  variablesPerSplit: 3,
  bagFraction: 0.3,
  seed: 0}).train ({
  features: training1,
  classProperty: 'landcover',
  inputProperties: bands})
var classified = tot201512.select(bands).classify(classi)
var dict = classi.explain();
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
print(chart)



var asc_class = asc.map(classifier)
var asc_val = asc.map(validation)
var asc_trainingAcc = asc.map(accuracyClass)
var asc_countTrain = asc.map(countTrain)
var asc_countTot = asc.map(countTot)


print(asc_countTot,'number of pixel for image')
print(asc_countTrain,'number of pixel for training set')
print(asc_val,'kappa sul validation set')
print(asc_trainingAcc,'kappa sul training set')


var params = {min:0,max:6, palette: ['256706','orange','blue','green','white','brown','6ee6e9']}
Map.addLayer(ee.Image(asc_class.toList(12).get(0)),params, '201509',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(1)),params, '201512',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(2)),params, '201609',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(3)),params, '201612',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(4)),params, '201709',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(5)),params, '201712',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(6)),params, '201809',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(7)),params, '201812',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(8)),params, '201909',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(9)),params, '202002',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(10)),params, '202009',0)
Map.addLayer(ee.Image(asc_class.toList(12).get(11)),params, '202012',0)


///////////////////////////////////////////////////////////////////////////////////////////
//DESCENDING


var desc201509 = norm.normDESC(toDB.toDB(desc201509))
var desc201512 = norm.normDESC(toDB.toDB(desc201512))
var desc201609 = norm.normDESC(toDB.toDB(desc201609))
var desc201612 = norm.normDESC(toDB.toDB(desc201612))
var desc201708 = norm.normDESC(toDB.toDB(desc201708))
var desc201712 = norm.normDESC(toDB.toDB(desc201712))
var desc201809 = norm.normDESC(toDB.toDB(desc201809))
var desc201812 = norm.normDESC(toDB.toDB(desc201812))
var desc201909 = norm.normDESC(toDB.toDB(desc201909))
var desc202001 = norm.normDESC(toDB.toDB(desc202001))
var desc202009 = norm.normDESC(toDB.toDB(desc202009))
var desc202012 = norm.normDESC(toDB.toDB(desc202012))


var tot201509desc = ee.Image.cat ([desc201509, desc201509dec, s2201509]).clip(mc)
var tot201512desc = ee.Image.cat ([desc201512, desc201512dec, s2201512]).clip(mc)
var tot201609desc = ee.Image.cat ([desc201609, desc201609dec, s2201609]).clip(mc)
var tot201612desc = ee.Image.cat ([desc201612, desc201612dec, s2201612]).clip(mc)
var tot201708desc = ee.Image.cat ([desc201708, desc201708dec, s2201709]).clip(mc)
var tot201712desc = ee.Image.cat ([desc201712, desc201712dec, s2201712]).clip(mc)
var tot201809desc = ee.Image.cat ([desc201809, desc201809dec, s2201809]).clip(mc)
var tot201812desc = ee.Image.cat ([desc201812, desc201812dec, s2201812]).clip(mc)
var tot201909desc = ee.Image.cat ([desc201909, desc201909dec, s2201909]).clip(mc)
var tot201912desc = ee.Image.cat ([desc202001, desc202001dec, s2201912]).clip(mc)
var tot202009desc = ee.Image.cat ([desc202009, desc202009dec, s2202009]).clip(mc)
var tot202012desc = ee.Image.cat ([desc202012, desc202012dec, s2202012]).clip(mc)

var desc = ee.ImageCollection ([tot201509desc,
tot201512desc,
tot201609desc,
tot201612desc,
tot201708desc,
tot201712desc,
tot201809desc,
tot201812desc,
tot201909desc,
tot201912desc,
tot202009desc,
tot202012desc])



   
var desc_class = desc.map(classifier)
var desc_val = desc.map(validation)
var desc_trainingAcc = desc.map(accuracyClass)
var desc_countTrain = desc.map(countTrain)
var desc_countTot = desc.map(countTot)

print(desc_countTot,'number of pixel for image')
print(desc_countTrain,'number of pixel for training set')
print(desc_val,'kappa sul validation set')
print(desc_trainingAcc,'kappa sul training set')

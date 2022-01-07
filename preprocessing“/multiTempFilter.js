//funzione che applica il refinedLeeFilter alle due bande di un'immagine radar
//l'outpu è un'immagine con bande "VV filtrata", "VH filtrata", "angle"

//richiede la funzione refinedLeeFilter (cambiare path)
var lee = require ("users/bene96detta/AnalysisReadyData:preprocessing/refinedLeeFilter")

//richiede le funzioni toNatural e toDB (cambiare path)
var from_to_dB = require ("users/bene96detta/AnalysisReadyData:preprocessing/from_to_dB")


//esporta la funzione
exports.MultiTempFilter = function (img){
  //filtra la banda VV
  var filteredVV = (from_to_dB.toDB(lee.refinedLee (from_to_dB.toNatural(img.select (['VV'])))))
  //filtra la banda VH
  var filteredVH = (from_to_dB.toDB(lee.refinedLee (from_to_dB.toNatural(img.select (['VH'])))))
  //compone l'immagine
  var img_filtered = ee.Image.cat ([
    (filteredVV.select('sum').rename('VV_filtered')), 
    (filteredVH.select('sum').rename('VH_filtered')),
    (img.select('angle'))
    ]);
  return img_filtered
  };

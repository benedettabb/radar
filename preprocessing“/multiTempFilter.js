//funzione che applica il refinedLeeFilter alle due bande di un'immagine radar
//l'outpu è un'immagine con bande "VV filtrata", "VH filtrata", "angle"
//iterando la funzione con .map() si può applicare il filtro ad ogni immagine di una collezione

//richiede la funzione refinedLeeFilter (cambiare path se necessario!)
var lee = require ("users/bene96detta/AnalysisReadyData:preprocessing/refinedLeeFilter")

//richiede le funzioni toNatural e toDB (cambiare path se necessario!)
//il filtro va applicato all'immagine lineare e non a quella in dB (un'altra possibilità sarebbe quella di usare la nuova collezione "S1...GRD_FLOAT")
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

//funzione che applica il refined Lee filter ad un'immagine
//(con map la si applica ad ogni immagine di una collezione)

var lee = require ("users/bene96detta/AnalysisReadyData:preprocessing/refinedLeeFilter")

var from_to_dB = require ("users/bene96detta/AnalysisReadyData:preprocessing/from_to_dB")


//funzione che a partire da una immagine restituisce come output la stessa immagine filtrata con refinedLeeFilter
exports.MultiTempFilter = function (img){
  //filtro la banda VV
  var filteredVV = (from_to_dB.toDB(lee.refinedLee (from_to_dB.toNatural(img.select (['VV'])))))
  //filtro la banda VH
  var filteredVH = (from_to_dB.toDB(lee.refinedLee (from_to_dB.toNatural(img.select (['VH'])))))
  //compongo l'immagine
  var img_filtered = ee.Image.cat ([
    (filteredVV.select('sum').rename('VV_filtered')), 
    (filteredVH.select('sum').rename('VH_filtered')),
    (img.select('angle'))
    ]);
  return img_filtered
  };

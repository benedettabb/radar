//funzione che calcola SPAN e RATIO e le aggiunge come bande all'immagine di input (le bande vengono rinominate)
//SPAN = vv+vh
//RATIO = vh/vv


exports.span_ratioGEE = function (img){
  var angle = img.select('angle')
  var vv = img.select('VV_filtered')
  var vh = img.select('VH_filtered')
  var span = vv.add(vh)
  var ratio = vh.divide(vv)
  return (img.addBands([span, ratio]).rename(["VV", "VH","angle","span","ratio"]))
};

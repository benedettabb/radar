//Sentinel-1-Imagery-Based High-ResolutionWater Cover Detection on Wetlands, Aided by Google Earth Engine, András Gulácsi and Ferenc Kovács
//https://github.com/SalsaBoy990/gee_s1_sar_wetlands

// Funzione che converte l'immagine S1 GRD in sigma naught dB in un'immagine lineare
exports.toNatural = function (img) {
  return ee.Image(10.0).pow(img.select(0).divide(10.0));
};

//Funzione che converte l'immagine lineare in immagine in dB. 
//dB= 10* log (DN)
exports.toDB = function (img) {
  return ee.Image(img).log10().multiply(10.0);
};

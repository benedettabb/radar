// Functions to convert from/to dB
exports.toNatural = function (img) {
  return ee.Image(10.0).pow(img.select(0).divide(10.0));
};

exports.toDB = function (img) {
  return ee.Image(img).log10().multiply(10.0);
};


//importo l'area di interesse
var roi = require("users/bene96detta/AnalysisReadyData:preprocessing/area");
roi = roi.addRegion();

// Implementation by Andreas Vollrath (ESA), inspired by Johannes Reiche (Wageningen)
exports.terrainCorrection = function (image) { 
  var srtm = ee.Image('USGS/SRTMGL1_003').clip(roi); // 30m srtm 
  //sigma0Pow = NORMALIZER RADAR CROSS SECTION
  var sigma0Pow = ee.Image.constant(10).pow(image.divide(10.0));

  /*RADAR GEOMETRY
  θi = INCIDENT ANGLE:
  angolo tra la normale alla superficie e la direzione del backscatter*/
  var theta_i = image.select('angle');
  // ϕi = RANGE DIRECTION: angolo orizzontale piano rispetto al nord
  var phi_i = ee.Terrain.aspect(theta_i)
    .reduceRegion(ee.Reducer.mean(), roi, 1000)
    .get('aspect');

  //TERRAIN GEOMETRY
  //αs = SLOPE: pendenza della superficie 
  var alpha_s = ee.Terrain.slope(srtm).select('slope');
  /*ϕs = ASPECT: orientamento della pendenza, misurata in senso orario, in gradi, dove
  lo zero corrisponde al nord geografico, 90 gradi est, ecc*/
  var phi_s = ee.Terrain.aspect(srtm).select('aspect');

  // MODEL GEOMETRY
  // questi 4 angoli vengono ridotti a 3: θi, αs, ϕr = direzione della pendenza rispetto alla range direction
  var phi_r = ee.Image.constant(phi_i).subtract(phi_s);

  // conversione in radianti
  var phi_rRad = phi_r.multiply(Math.PI / 180);
  var alpha_sRad = alpha_s.multiply(Math.PI / 180);
  var theta_iRad = theta_i.multiply(Math.PI / 180);
  var ninetyRad = ee.Image.constant(90).multiply(Math.PI / 180);

  // αr = pendenza nella range direction --------- αr =arctan(tan(αs)cos(ϕr));
  var alpha_r = (alpha_sRad.tan().multiply(phi_rRad.cos())).atan();

  // αaz = pendenza nella azimut direction ---------- αaz =arctan(tan(αs)sin(ϕr));
  var alpha_az = (alpha_sRad.tan().multiply(phi_rRad.sin())).atan();

  // quindi l'angolo d'incidenza -----cos(θΔ)=cos(αaz)cos(θi-αr)
  var theta_lia = (alpha_az.cos().multiply((theta_iRad.subtract(alpha_r)).cos())).acos();
  var theta_liaDeg = theta_lia.multiply(180 / Math.PI);


  // Gamma_nought_flat = coefficiente di backscattering con terreno piatto
  //sigma0Pow = NORMALIZER RADAR CROSS SECTION
  var gamma0 = sigma0Pow.divide(theta_iRad.cos());
  var gamma0dB = ee.Image.constant(10).multiply(gamma0.log10());
  var ratio_1 = gamma0dB.select('VV').subtract(gamma0dB.select('VH'));

  // Volumetric Model
  var nominator = (ninetyRad.subtract(theta_iRad).add(alpha_r)).tan();
  var denominator = (ninetyRad.subtract(theta_iRad)).tan();
  /*rapporto tra il volume osservato in un terreno inclinato e il volume che 
  sarebbe osservato se il terreno fosse piatto*/
  var volModel = (nominator.divide(denominator)).abs();

  // apply model
  var gamma0_Volume = gamma0.divide(volModel);
  var gamma0_VolumeDB = ee.Image.constant(10).multiply(gamma0_Volume.log10());

  // maschera per layover/shadow 
  // LAYOVER =  slope > θi
  var alpha_rDeg = alpha_r.multiply(180 / Math.PI);
  var layover = alpha_rDeg.lt(theta_i);

  // SHADOWS = LIA > 90
  var shadow = theta_liaDeg.lt(85);

  // calculate the ratio for RGB vis
  var ratio = gamma0_VolumeDB.select('VV').subtract(gamma0_VolumeDB.select('VH'));

  var output = gamma0_VolumeDB.addBands(ratio).addBands(alpha_r).addBands(phi_s).addBands(theta_iRad)
    .addBands(layover).addBands(shadow).addBands(gamma0dB).addBands(ratio_1);

  return image.addBands(
    output.select(['VV', 'VH'], ['VV', 'VH']),
    null,
    true
  );
}


  
  

  

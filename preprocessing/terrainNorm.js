//https://code.earthengine.google.com/44a1d10e3dbe1731f30d4e2ab70e8d5d//
//Angular-Based Radiometric Slope Correction for Sentinel-1 on Google Earth Engine, Andreas Vollrath, Adugna Mullissa and Johannes Reiche

var table = ee.FeatureCollection("users/bene96detta/shp_file/Marche")

var geometry = 
    ee.Geometry.MultiPolygon(
        [[[[12.24830013833157, 43.197653078520815],
           [12.24830013833157, 43.19314785163673],
           [12.24830013833157, 43.19314785163673],
           [12.24830013833157, 43.197653078520815]]],
         [[[12.222894254542508, 43.201657445410525],
           [12.222894254542508, 43.05532780720125],
           [12.49274593911282, 43.05532780720125],
           [12.49274593911282, 43.201657445410525]]]], null, false);       
             
exports.corr = function (img) {
  var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation')
  var ninetyRad = ee.Image.constant(90).multiply(Math.PI/180);
  //RADAR GEOMETRY
  var heading = (ee.Terrain.aspect(img.select('angle')).reduceRegion(ee.Reducer.mean(), table, 1000).get('aspect'));
  var theta_iRad = img.select('angle').multiply(Math.PI/180)
  var phi_iRad = ee.Image.constant(heading).multiply(Math.PI/180);
  //TERRAIN GEOMETRY
  var alpha_sRad = ee.Terrain.slope(elevation).select('slope').multiply(Math.PI/180);
  var phi_sRad = ee.Terrain.aspect(elevation).select('aspect').multiply(Math.PI/180);
    
  //MODEL GEOMETRY
  //reduce to 3 angle
  var phi_rRad = phi_iRad.subtract(phi_sRad);
  // slope steepness in range
  var alpha_rRad = (alpha_sRad.tan().multiply(phi_rRad.cos())).atan();
  // slope steepness in azimuth
  var alpha_azRad = (alpha_sRad.tan().multiply(phi_rRad.sin())).atan();
    
  //FROM SIGMA 0 TO gamma 0
  var vv = img.select('VV_filtered')
  var vh = img.select('VH_filtered')
  var gamma0vv = vv.divide(theta_iRad.cos());
  var gamma0vh = vh.divide(theta_iRad.cos());
  
  //MODEL
  var nominator = (ninetyRad.subtract(theta_iRad)).cos();
  var denominator = alpha_azRad.cos().multiply((ninetyRad.subtract(theta_iRad).add(alpha_rRad)).cos());
  var result = nominator.divide(denominator);
  
  //GAMMA FLAT
  var gammafvv = gamma0vv.divide(result)
  var gammafvh = gamma0vh.divide(result)
  
  
  //MASK LAYOVER AND SHADOW
  var layover = alpha_rRad.lt(theta_iRad).rename('layover');
  var shadow = alpha_rRad.gt(ee.Image.constant(-1).multiply(ninetyRad.subtract(theta_iRad))).rename('shadow');
  var mask = layover.and(shadow);
  
  var norm =  ee.Image.cat(gammafvv, gammafvh).addBands(img.select('angle'))
  return norm.updateMask(mask)
};






exports.corrDEC = function (img) {	  
  var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation')	  
  var ninetyRad = ee.Image.constant(90).multiply(Math.PI/180);	  
  //RADAR GEOMETRY	  
  var heading = (ee.Terrain.aspect(img.select('angle'))
  .reduceRegion(ee.Reducer.mean(), table, 1000).get('aspect'));	  
  var theta_iRad = img.select('angle').multiply(Math.PI/180)	 
  var phi_iRad = ee.Image.constant(heading).multiply(Math.PI/180);	  
  //TERRAIN GEOMETRY	  
  var alpha_sRad = ee.Terrain.slope(elevation).select('slope').multiply(Math.PI/180);	 
  var phi_sRad = ee.Terrain.aspect(elevation).select('aspect').multiply(Math.PI/180);	    	  
  //MODEL GEOMETRY	 
  //reduce to 3 angle	  
  var phi_rRad = phi_iRad.subtract(phi_sRad);	  
  // slope steepness in range	  
  var alpha_rRad = (alpha_sRad.tan().multiply(phi_rRad.cos())).atan();	  
  // slope steepness in azimuth	 
  var alpha_azRad = (alpha_sRad.tan().multiply(phi_rRad.sin())).atan();	     	  	  
  //MASK LAYOVER AND SHADOW	  
  var layover = alpha_rRad.lt(theta_iRad).rename('layover');	
  var shadow = alpha_rRad.gt(ee.Image.constant(-1).multiply(ninetyRad.subtract(theta_iRad))).rename('shadow');	 
  var mask = layover.and(shadow);		 
  return img.updateMask(mask)	
  };
    
  
exports.corr2 = function (img) {
  var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation')
  var ninetyRad = ee.Image.constant(90).multiply(Math.PI/180);
  //RADAR GEOMETRY
  var heading = (ee.Terrain.aspect(img.select('angle')).reduceRegion(ee.Reducer.mean(), geometry, 1000).get('aspect'));
  var theta_iRad = img.select('angle').multiply(Math.PI/180)
  var phi_iRad = ee.Image.constant(heading).multiply(Math.PI/180);
  //TERRAIN GEOMETRY
  var alpha_sRad = ee.Terrain.slope(elevation).select('slope').multiply(Math.PI/180);
  var phi_sRad = ee.Terrain.aspect(elevation).select('aspect').multiply(Math.PI/180);
    
  //MODEL GEOMETRY
  //reduce to 3 angle
  var phi_rRad = phi_iRad.subtract(phi_sRad);
  // slope steepness in range
  var alpha_rRad = (alpha_sRad.tan().multiply(phi_rRad.cos())).atan();
  // slope steepness in azimuth
  var alpha_azRad = (alpha_sRad.tan().multiply(phi_rRad.sin())).atan();
    
  //FROM SIGMA 0 TO gamma 0
  var vv = img.select('VV')
  var vh = img.select('VH')
  var gamma0vv = vv.divide(theta_iRad.cos());
  var gamma0vh = vh.divide(theta_iRad.cos());
  
  //MODEL
  var nominator = (ninetyRad.subtract(theta_iRad)).cos();
  var denominator = alpha_azRad.cos().multiply((ninetyRad.subtract(theta_iRad).add(alpha_rRad)).cos());
  var result = nominator.divide(denominator);
  
  //GAMMA FLAT
  var gammafvv = gamma0vv.divide(result)
  var gammafvh = gamma0vh.divide(result)
  
  
  //MASK LAYOVER AND SHADOW
  var layover = alpha_rRad.lt(theta_iRad).rename('layover');
  var shadow = alpha_rRad.gt(ee.Image.constant(-1).multiply(ninetyRad.subtract(theta_iRad))).rename('shadow');
  var mask = layover.and(shadow);
  
  var norm =  ee.Image.cat(gammafvv, gammafvh).addBands(img.select('angle'))
  return norm.updateMask(mask)
};


        

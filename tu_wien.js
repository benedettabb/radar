//Disegna un'area di interesse
//var marche = "la tua area di interesse"
var marche = table
Map.centerObject(marche, 9);


// Titolo
var titolo = ui.Label('Tu Wien Change Detection');
titolo.style().set({
  fontSize: '24px',
  fontWeight: 500,
  padding: '0px'
});

// User inputs: year and month
var year = '2018';
var month = '08';


var annoTitolo = ui.Label('L\'anno su cui effetturare la stima (dal 2015 al 2020)');
var annoInput = ui.Textbox({
  placeholder: 'Anno dal 2015 al 2020',
  value: '2018',
  onChange: function(text) {
    year = text;
  }
});


var meseTitolo = ui.Label('Il mese su cui effettuare la stima (da agosto a gennaio)');
var meseInput = ui.Textbox({
  placeholder: 'Mese da agosto a gennaio',
  value: '08',
  onChange: function(text) {
    month = text;
  }
});


// Which path you want to process?
var path;
var pathList = {
  ASCENDING: 1,
  DESCENDING: 2
};

var orbita = ui.Select({
  items: Object.keys(pathList),
  placeholder: 'Seleziona la direzione dell\'orbita',
  onChange: function (key) {
    path = parseInt(key, 10);
  }
});
orbita.style().set({
  maxWidth: '250px'
});

var band;
var bands = {
  VV: 1,
  VH: 2
};


var banda = ui.Select({
  items: Object.keys(bands),
  placeholder: 'Seleziona la banda (consigliata VV)',
  onChange: function (key) {
    band = parseInt(key, 10);
  }
});
banda.style().set({
  maxWidth: '250px'
});


var calcolo = ui.Button({
  label: 'Elaborazione',
  onClick: function() {
    var anno = ee.Number.parse(annoInput.getValue());
    var mese = ee.Number.parse(meseInput.getValue());
    var start = ee.Date.fromYMD (anno, mese, 01)
    var end = ee.Date.fromYMD (anno, mese, 29)
    // Filtering based on metadata properties
    var coll = ee.ImageCollection('COPERNICUS/S1_GRD_FLOAT') 
      .filter(ee.Filter.eq('instrumentMode', 'IW'))
      .filter(ee.Filter.or(
        (ee.Filter.eq('relativeOrbitNumber_start',44)),   //ascending
        (ee.Filter.eq('relativeOrbitNumber_start',117)),  //ascending
        (ee.Filter.eq('relativeOrbitNumber_start',95)),   //descending
        (ee.Filter.eq('relativeOrbitNumber_start',22))    //descending
        ))
      .filterBounds(marche) 
      .filterDate(start, end)
    ;
    
    var path = orbita.getValue();
    var pathString;
    if(path === 'ASCENDING') {
      coll = coll.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
    } else if (path === 'DESCENDING') {
      coll =  coll.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));
    } else {
      pathString = null;
      throw new Error('Scegli la direzione dell\'orbita per procedere');
    }
    
    
    //Funzione per normalizzare 
    var corr = function (img) {
      var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation')
      var ninetyRad = ee.Image.constant(90).multiply(Math.PI/180);
      //RADAR GEOMETRY
      var heading = (ee.Terrain.aspect(img.select('angle')).reduceRegion(ee.Reducer.mean(), marche, 1000).get('aspect'));
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
    
    var collNorm = coll.map(corr)
    var collNorm = collNorm.map(function(img){return img.clip(marche)})
    var minMax = collNorm.reduce(ee.Reducer.minMax())
    
    var bandString;
    var band= banda.getValue();
    if(band === 'VV') {
      var collNorm = collNorm.select('VV');
      var driest = minMax.select('VV_min');
      var wettest = minMax.select ('VV_max');
    } else if (band === 'VH') {
      var collNorm = collNorm.select('VH');
      var driest = minMax.select('VV_min');
      var wettest = minMax.select ('VV_max')
    } else {
      bandString = null;
      throw new Error('Scegli la polarizzazione');
    }
    
    var tu_wien = function (img){
    var sensitivity = wettest.subtract(driest); 
    var SMmax=0.32; 
    var SMmin=0.05;
    var calculateSSM = function (image){ 
      return image.addBands(((image.subtract(driest)).divide(sensitivity))
      .multiply(SMmax-SMmin).add(SMmin)); 
      }; 
    var ssm = calculateSSM(img) 
    return ssm}
    
    
    var moisture = collNorm.map(tu_wien)
    
    var rename = function (img) {
      if(band === 'VV') {
      return img.select(['VV','VV_1']).rename(['VV','moisture'])
    } else if (band == 'VH') {
      return img.select(['VH','VH_1']).rename(['VH','moisture'])
    }};
    
    var name = function (img) {
     var date = ee.String(img.get('system:index'))
     var dateSplit = date.split('_').get(4)
     var img_set = img.set('name', dateSplit)
     return img_set}
     
     
    var moisture = moisture.map(rename)
    var moisture = moisture.map(name)
    print('Collezione di dati Sentinel-1', coll);
    print('Collezione delle immagini con stima dell\'umidità', moisture)
    
    var size = moisture.size().getInfo()
    var list = moisture.toList(size);
    // client side loop!
    for(var i = 0; i < size; i++){
    var image = ee.Image(list.get(i));
    var name = image.get('name');
    print(name)
    Map.addLayer(image, {bands:'moisture'}, i.toString(), 0)
    }
  

}});

calcolo.style().set({
  fontSize: '24px',
  fontWeight: 700,
  color: '#000000',
  padding: '10px',
  margin: '30px 10px 10px 10px',
  minHeight: '60px',
  maxWidth: '200px'
});






print(titolo);

print(annoTitolo);
print(annoInput);

print(meseTitolo);
print(meseInput);

print(orbita);
print(banda);

print(calcolo);





//MAP SETTING
Map.setOptions('SATELLITE')
var marche = table                                                                    //area d'interesse                                                       //centro la mappa sull'area d'interesse
Map.centerObject(marche,9)
var  point = ee.Geometry.Point([13.175884885428433 ,43.388269749078034]);

/////////////////////////////////////////////////////////////////////////////////////////////////////
//CONFINI REGIONE MARCHE
var empty = ee.Image().byte();
var colors = {'gray': '#d6f5f5'};
var outline = empty.paint({
  featureCollection: table,
  color: 1,
  width: 3
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
//CHART PANEL
var chartPanel = ui.Panel({
  style:
      {height: '235px', width: '600px', position: 'bottom-right', shown: false}
});

Map.add(chartPanel);     
       
//////////////////////////////////////////////////////////////////////////////////////////////////////
//DRAWING TOOL
var drawingTools = Map.drawingTools();
drawingTools.setShown(false);

while (drawingTools.layers().length() > 0) {
  var layer = drawingTools.layers().get(0);
  drawingTools.layers().remove(layer);
}

var dummyGeometry =
    ui.Map.GeometryLayer({geometries: null, name: 'AOI', color:'#0099ff'});
drawingTools.layers().add(dummyGeometry);

function clearGeometry() {
  var layers = drawingTools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}

function drawPolygon() {
  clearGeometry();
  drawingTools.setShape('polygon');
  drawingTools.draw()
  Map.clear().add(legend);
  Map.addLayer(outline, {palette: 'FF0000'}, 'regione Marche');
  chartPanel.style().set('shown', false);
  Map.add(chartPanel)
}

var symbol = {
  polygon: '🔷'
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//ROOT PANEL
var l1 = ui.Label('1. Draw your interest area:')
l1.style().set({
  fontSize:'12px',
  fontWeight: '700'
});
var l2 = ui.Label('2. Choose an year and month:')
l2.style().set({                                                                  
  fontSize:'12px',
  fontWeight: '700'
});
var l3 = ui.Label('3. Select the orbit direction:')
l3.style().set({                                                                  
  fontSize:'12px',
  fontWeight: '700'
});
var l4 = ui.Label('4. Select the normalization method:')
l4.style().set({                                                                  
  fontSize:'12px',
  fontWeight: '700'
});
var l5 = ui.Label('5. Select the esimation method:')
l5.style().set({                                                                  
  fontSize:'12px',
  fontWeight: '700'
});
var l6 = ui.Label('6. Start the processing:')
l6.style().set({                                                                  
  fontSize:'12px',
  fontWeight: '700'
});
var l7 = ui.Label('7. Wait for the graph to load and \nopen Layers to visualize moisture images. \nOtherwise:')
l7.style().set({     
  whiteSpace: 'pre',
  fontSize:'12px',
  fontWeight: '700'
});

var controlPanel = ui.Panel({
  widgets: [
    ui.Button({
      label: symbol.polygon + ' Click here to draw a poligon',
      onClick: drawPolygon,
      style: {stretch: 'horizontal',backgroundColor: colors.gray, maxWidth: '250px'}
    })
  ],
  style: {position: 'top-center'},
  layout: null,
});

var titolo = ui.Label('Soil moisture retrieval \nin Marche region \nusing Sentinel-1 data');                                   
titolo.style().set({  
  whiteSpace: 'pre',
  fontWeight: 'bold',
  fontSize: '20px',
  padding: '10px',
  color: '#0099ff'
});

var annoInput = ui.Textbox({
  placeholder: 'Anno dal 2015 al 2020',                                               
  value: 'Year',
  onChange: function(text) {                                                          
    var year = text;
    return year;
  }
});

var meseInput = ui.Textbox({                                            
  value: 'Month',
  onChange: function(text) {                                                          
    var month = text
    return month ;
  }
});

var method;
var methodList = {
  TuWien: 1,
  WaterCloudModel:2
};

var metodo = ui.Select({  
  items: Object.keys(methodList),
  placeholder: '...',     
  onChange: function (key) {
    method = parseInt(key, 10); 
  }
});
metodo.style().set({ 
  maxWidth: '250px',
  backgroundColor: colors.gray,
  stretch: 'horizontal'
});


var tuWien = ui.Label('Tu Wien Change Detection →  RMSD 6.5%',{whiteSpace: 'pre',color: '#616161', fontSize: '13px'})
var wcm = ui.Label('Water Cloud Model → RMSD 7.6%',{whiteSpace: 'pre',color: '#616161', fontSize: '13px'});
var link = ui.Label('GitHub Repository', {fontSize: '11px'},"https://github.com/benedettabb/agricolture-moisture-Marche.git")
var linkPanel = ui.Panel(
    [ui.Label('For more informations:', {fontWeight: 'bold', fontSize: '11px'}), link], 'flow', {width: '500px'});
    
    
var path;
var pathList = {                                                                     
  ASCENDING: 1,
  DESCENDING: 2,
  BOTH: 3
};

var orbita = ui.Select({                                                               
  items: Object.keys(pathList),
  placeholder: '...',                                  
  onChange: function (key) {
    path = parseInt(key, 10);                                                          //scelta direzione dell'orbita
  }
});
orbita.style().set({                                                                  
  maxWidth: '250px',
  backgroundColor: colors.gray,
  stretch: 'horizontal'
});

var norm;
var norm_method = {
  Angle_based: 1,
  Linear_based:2
};

var norm_m = ui.Select({                                                               
  items: Object.keys(norm_method),
  placeholder: '...',                              
  onChange: function (key) {                                                           
    norm = parseInt(key, 10);
  }
});
norm_m.style().set({                                                                  
  maxWidth: '250px',
  backgroundColor: colors.gray,
  stretch: 'horizontal'
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
//RESTART 
  var close = ui.Button({
  label: 'RESTART',
  onClick: function() {
    chartPanel.style().set('shown', false);
    annoInput.setValue('Year');
    meseInput.setValue('Month');
    metodo.setValue(null, false);
    orbita.setValue(null, false);
    norm_m.setValue(null, false);
    dummyGeometry.set({shown: false});
    Map.clear().add(legend);
    Map.add(chartPanel)
    }
    })
  close.style().set({                                                                      
    fontSize: '8px',
    stretch: 'horizontal',
    fontWeight: 100,
    maxWidth: '250px'
  });
  
//////////////////////////////////////////////////////////////////////////////////////////////
//CALCOLO
var calcolo = ui.Button({                                                               
  label: 'PROCESSING',
  onClick: function() {
////////////////////////////////////////////////////////////////////////////////////////////
//VISUALIZZA SOLO I BORDI DELL'AOI
    dummyGeometry.setShown(false);
    drawingTools.setShown(false);
    var feat = drawingTools.toFeatureCollection('AOI');
    var empty2 = ee.Image().byte();
    var outline = empty2.paint({
          featureCollection: feat,
          color: 1,
          width: 3
        });
    Map.addLayer(outline, {palette: '#0099ff'}, 'AOI');
/////////////////////////////////////////////////////////////////////////////////////////////////////
//ERROR PANEL
    var errorPanel = ui.Panel({style:{shown: false}});
    errorPanel.remove()
    Map.add(errorPanel);
      
///////////////////////////////////////////////////////////////////////////////////////////
//DATE IN INPUT
    var anno = ee.Number.parse(annoInput.getValue());         
    if (annoInput.getValue() == 'Year'){
      var error4 = ui.Label(' ⛔  insert a year to proceed')
       errorPanel.clear().add(error4).style().set('shown', true);
       } 
    var mese = ee.Number.parse(meseInput.getValue());      
    if (meseInput.getValue() == 'Month'){
      var error5 = ui.Label(' ⛔  insert a month to proceed')
      errorPanel.clear().add(error5).style().set('shown', true);
       }
    var start = ee.Date.fromYMD (anno, mese, 01);                                     
    var end = ee.Date.fromYMD (anno, mese, 30); 
/////////////////////////////////////////////////////////////////////////////////////////////////////
//AREA DI INTERESSE
     var aoi = drawingTools.layers().get(0).getEeObject();
     var coord = aoi.coordinates().getInfo()
     if (coord == false){
       var error = ui.Label(' ⛔  please draw an poligon to proceed')
       errorPanel.clear().add(error).style().set('shown', true);
       }    
     var area = aoi.area().divide(1000 * 1000).getInfo()
     var string_area = area.toString()
     if (area < 100){
       aoi = null
       var error6 = ui.Label(' ⚠️ your AOI is too small (min 100km2)')
       errorPanel.clear().add(error6).style().set('shown', true);
     } else if (area >900){
       aoi = null
       var error7 = ui.Label(' ⚠️ your AOI is too big (max 900km2)')
       errorPanel.clear().add(error7).style().set('shown', true);
     }
       
      
///////////////////////////////////////////////////////////////////////////////////////////
//COLLEZIONE SENTINEL-1
    var coll = ee.ImageCollection('COPERNICUS/S1_GRD')                          
      .filter(ee.Filter.eq('instrumentMode', 'IW'))                                   //- modalità IW
      .filter(ee.Filter.or(                                                           //- numero relativo dell'orbita:
        (ee.Filter.eq('relativeOrbitNumber_start',44)),                               //44 ascending
        (ee.Filter.eq('relativeOrbitNumber_start',117)),                              //117 ascending
        (ee.Filter.eq('relativeOrbitNumber_start',95)),                               //95 descending
        (ee.Filter.eq('relativeOrbitNumber_start',22))                                //22 descending
        ))
      .filterBounds(aoi)                                                           //- regione d'interesse
      .filterDate(start, end)        
      .select(['VV','angle']);  
      
    var path = orbita.getValue();                                                     //Direzione dell'orbita inserita
    var pathString;
    if(path === 'ASCENDING') {                                                        //se è ASCENDING 
      coll = coll.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));          //filtra la collezione per le orbite ascendenti
    } else if (path === 'DESCENDING') {                                               //se è DESCENDING 
      coll =  coll.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));        //filtra la collezione per le orbite discendenti
    } 
////////////////////////////////////////////////////////////////////////////////////////////////
//NORMALIZZAZIONE ANGLE BASED
    var corrAngle = function (img) {                                                   //Prima funzione per normalizzare ad un'angolo d'incidenza di riferimento 
        var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation')               //Metodo basato sulla relazione angolare tra la geometria del sensore e quella del terreno
        var ninetyRad = ee.Image.constant(90).multiply(Math.PI/180);
        var heading = (ee.Terrain.aspect(img.select('angle'))                           //RADAR GEOMETRY: theta_i e phi_i
        .reduceRegion(ee.Reducer.mean(), marche, 1000).get('aspect'));  
        var theta_iRad = img.select('angle').multiply(Math.PI/180)
        var phi_iRad = ee.Image.constant(heading).multiply(Math.PI/180);
        var alpha_sRad = ee.Terrain.slope(elevation)                                    //TERRAIN GEOMETRY: alpha_s e phi_s
        .select('slope').multiply(Math.PI/180); 
        var phi_sRad = ee.Terrain.aspect(elevation)
        .select('aspect').multiply(Math.PI/180);
          
        var phi_rRad = phi_iRad.subtract(phi_sRad);                                     //MODEL GEOMETRY: phi_r, alpha_r, alpha_az
        var alpha_rRad = (alpha_sRad.tan().multiply(phi_rRad.cos())).atan();            // alpha_r: pendenza del pendio nella direzione del range
        var alpha_azRad = (alpha_sRad.tan().multiply(phi_rRad.sin())).atan();           // alpha_az: pendenza del pendio nella direzione azimutale
          
        var vv = img.select('VV')
        var gamma0vv = vv.divide(theta_iRad.cos());                                     //Da sigma 0 a gamma 0 per la banda VV
                                    //Da sigma 0 a gamma 0 per la banda VH
        
        var nominator = (ninetyRad.subtract(theta_iRad)).cos();                         //Modello: nominatore
        var denominator = alpha_azRad.cos().multiply((ninetyRad.subtract(theta_iRad)    //Modello: denominatore
        .add(alpha_rRad)).cos());
        var result = nominator.divide(denominator);                                     //nominatore/denominatore
        
        var gammafvv = gamma0vv.divide(result)                                                                                   //Applicazione del modello a gamma VH
        
        var layover = alpha_rRad.lt(theta_iRad).rename('layover');                      //Layover
        var shadow = alpha_rRad.gt(ee.Image.constant(-1)                                //Shadow
        .multiply(ninetyRad.subtract(theta_iRad))).rename('shadow');
        var mask = layover.and(shadow);                                                 //Maschera per layover e shadow
        
        var norm =  ee.Image.cat(gammafvv).addBands(img.select('angle')).rename(['VV_norm','angle']);      //Immagine normalizzata
        var norm_img = norm.updateMask(mask).copyProperties(img); 
        return norm_img.set({'system:time_start': norm_img.get('segmentStartTime')})
      };
////////////////////////////////////////////////////////////////////////////////////////////    
//NORMALIZZAZIONE LINEAR BASED
    var corrLinear = function (img) {                                                   //Prima funzione per normalizzare ad un'angolo d'incidenza di riferimento. Metodo basato sulla realzione lineare tra sigma_0 e theta_i
        var startYear = ee.Date.fromYMD (anno, 01, 01);                                 //Primo giorno dell'anno scelto
        var endYear = ee.Date.fromYMD (anno, 12, 31);                                   //Ultimo giorno dell'anno scelto
        var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')                          //Filtro la collezione in base ai metadati
          .filter(ee.Filter.eq('instrumentMode', 'IW'))                                 //- modalità IW
          .filter(ee.Filter.or(                                                         //- numero relativo dell'orbita:
            (ee.Filter.eq('relativeOrbitNumber_start',44)),                             //44 ascending
            (ee.Filter.eq('relativeOrbitNumber_start',117)),                            //117 ascending
            (ee.Filter.eq('relativeOrbitNumber_start',95)),                             //95 descending
            (ee.Filter.eq('relativeOrbitNumber_start',22))                              //22 descending
            ))
          .filterBounds(aoi)                                                         //- regione d'interesse
          .filterDate(startYear, endYear)                                               //- anno definito dall'utente
        var linearfit = s1.select(['angle', 'VV'])                                     //Regressione lineare tra valori di sigma_0 (VV) e theta_i per l'anno di riferimento
             .reduce(ee.Reducer.linearFit());      
        var beta = linearfit.select('scale');                                          //seleziono beta: pendenza della retta di regrssione lineare
        var norm_calc = function(img){                                                 //Modello per la normalizzazione di VV
          return img.addBands(img.select('VV').subtract(beta.multiply(img.select('angle').subtract(40))).rename('VV_norm'))};
        return norm_calc(img);                                               //Applico il modello all'immagine
    };  
//////////////////////////////////////////////////////////////////////////////////////////////////    
//NORMALIZZAZIONE
    var normString;
    var norm = norm_m.getValue();
    if(norm === 'Angle_based') {                                                      //Se il metodo di nomalizzazione scelto è "Angle_based"
    var collNorm = coll.map(corrAngle)                                                //Applico la corrispondente funzione di normalizzazione a tutte le immagini della collezione
    } else if (norm == 'Linear_based') {                                              //Se il metodo di nomalizzazione scelto è "Linear_based"
    collNorm = coll.map(corrLinear)                                               //Applico la corrispondente funzione di normalizzazione a tutte le immagini della collezione
    } else {
    var error2 = ui.Label(' ⛔ choose a normalization method')
    errorPanel.clear().add(error2).style().set('shown', true);                  
    }  
      
    collNorm = collNorm.map(function(img){return img.clip(marche)}).select('VV_norm')
/////////////////////////////////////////////////////////////////////////////////////////////
//STIMA DELL'UMIDITA' DEL SUOLO
    var method = metodo.getValue();                                                     //Direzione dell'orbita inserita
    var methodString;
/////////////////////////////////////////////////////////////////////////////////////////
//TU WIEN
    if(method === 'TuWien') {  
                                                
    var  driest = collNorm.min();
    var  wettest = collNorm.max();
    
    var tu_wien = function (img){                                                      //Funzione con Tu Wien Change Detection method
    var sensitivity = wettest.subtract(driest);                                        //sensibilità: valori massimi-valori minimi
    var SMmax=0.32;                                                                    //condizioni di saturazione 
    var SMmin=0.05;                                                                    //Condizioni di avvizzimento
    var moisture = img.subtract(driest).divide(sensitivity)
      .multiply(SMmax-SMmin).add(SMmin).multiply(100);
    var moisture_img = img.addBands(moisture).rename(['VV_norm','moisture']);
    return moisture_img.select('moisture');
    }

    var moisture = collNorm.map(tu_wien)                                               //Applico la funzione stima dell'umidità ad ogni immagine della collezione
    
    var size = moisture.size().getInfo()                                                //estraggo il numero di immagini nella collezione e trasferisco su lato client (necessario per applicare poi al ciclo for)
    var list = moisture.toList(size);                                                   //trasformo la collezione di immaigni in una lista della lunghezza individuata prima   
///////////////////////////////////////////////////////////////////////////////////////////
//WATER CLOUD MODEL
    } else if (method === 'WaterCloudModel') {
    var s1 = collNorm;
    var s2 = ee.ImageCollection("COPERNICUS/S2") //s2
    .filterBounds(aoi) 
    .filterDate(start, end)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .map (function (img) { 
      var ndvi = img.normalizedDifference(['B8','B4']).rename('ndvi');
      return img.addBands(ndvi)}) 
      
    //Filtro maxDifference
    var maxDiffFilter = ee.Filter.maxDifference({ 
      difference: 10 * 24 * 60 * 60 * 1000,  //differenza massima
      leftField: "system:time_start", //operatore 1 
      rightField: "system:time_start" //operatore 2
    });
    
    //Definizione del join
    var saveBestJoin = ee.Join.saveBest({ 
      matchKey: "bestImage",
      measureKey: "timeDiff"
    });
    
    //Applicazione del join alle due collezioni, secondo la condizione definita dal filtro
    var join = saveBestJoin.apply(s1, s2, maxDiffFilter); 
    
    //unione di ciascuna immagine
    var plot = join.map(function(img) {
      var cat = ee.Image.cat([img, img.get("bestImage")]);
      var image = ee.Image(img)  //explicit cast
      var mask0 = ee.Image(image.get("bestImage"));
      var mask = mask0.select("B1") 
      return cat.updateMask(mask)  
    }).filterBounds(point)
    
     //preparazione del dataset con l'aggiunta delle bande necessarie
    var dataset = plot.map(function(img){
        var normAngle = ee.Image.constant(40); 
        var cos = normAngle.cos().rename("cos"); 
        var Avv = ee.Image.constant(0.0950).toFloat().rename("Avv");  
        var Bvv = ee.Image.constant(0.5513).toFloat().rename("Bvv");  
        var add = ee.Image.cat([img, cos, Avv, Bvv]).select(["VV_norm","cos","Avv","Bvv","ndvi"]); 
        var vv_norm = add.select("VV_norm")
        var mask = vv_norm.gt(-40)
        return add.updateMask(mask)
      });
      
    //calcolo di tau^2 = exp (-2*Bvv*V*sec(theta_i)) 
    var tau = dataset.map(function (image) {
        var img = ee.Image(image) 
        var num = ee.Image.constant(-2).multiply(img.select("Bvv")).multiply(img.select("ndvi")) 
        var den = img.select("cos") 
        var t = num.divide(den) 
        var tau = t.exp().rename("tau") 
        return img.addBands(tau) //tau è aggiunto come banda
        })
        
    //calcolo di sigma_veg = A*V*cos(theta_i)(1-tau^2)
    var sigma_veg = tau.map(function(image){
        var img = ee.Image(image)
        var fin = ee.Image.constant(1).subtract(img.select("tau"))
        var v = img.select("Avv").multiply(img.select("ndvi")).multiply(img.select("cos")).multiply(fin)
        var veg = v.rename("sigma_veg")
        return img.addBands(veg) //sigma_veg è aggiunto come banda
      })
      
    //calcolo di sigma_soil a partire da:
    //sigma tot = sigma_veg + tau^2*sigma_soil 
    var sigma_soil = sigma_veg.map(function(image){
        var img = ee.Image(image)
        var num = img.select("VV_norm").subtract(img.select("sigma_veg"))
        var den = img.select("tau")
        var soil = num.divide(den).rename("sigma_soil")
        return img.addBands(soil)
    });
    
    var Cvv = ee.Image.constant(37.23).toFloat(); 
    var Dvv = ee.Image.constant(2.39).toFloat(); 

    
      //umidità calcolata con il modello [%]
    var moisture =sigma_soil.map(function (img){
        var image = ee.Image(img)
        var hum = Cvv.add(Dvv.multiply(image.select("sigma_soil"))).rename("moisture")
        return image.addBands(hum).select("moisture")
    }) 
//////////////////////////////////////////////////////////////////////////////////////////      
    } else {
      var error3 = ui.Label(' ⛔ choose a soil moisture retrieval method!')
      errorPanel.add(error3).style().set('shown', true);
    }
/////////////////////////////////////////////////////////////////////////////////////////////////
//MASCHERA AREE NON AGRICOLE
    var mosaico = ee.ImageCollection([an, ap, fe, mc, pu]).mosaic()
    var mask = mosaico.eq(1).or(mosaico.eq(3)).or(mosaico.eq(5))
    var mask_function = function(image){
          var img = ee.Image(image)
          return img.updateMask(mask)
        }
    var moisture_mask = moisture.map(mask_function).map(function(img){return img.clip(aoi)})

//////////////////////////////////////////////////////////////////////////////////////////////    
//MOSTRA I RISULTATI
  var sld_intervals =
    '<RasterSymbolizer>' +
      '<ColorMap type="intervals" extended="false" >' +
        '<ColorMapEntry color="#ff0000" quantity="5" label="0-5" />' +
        '<ColorMapEntry color="#ffb714" quantity="10" label="10-15" />' +
        '<ColorMapEntry color="#f0ff0a" quantity="15" label="15-20" />' +
        '<ColorMapEntry color="#ccff66" quantity="20" label="20-25" />' +
        '<ColorMapEntry color="#4dff4d" quantity="25" label="25-30" />' +
        '<ColorMapEntry color="#02ff7f" quantity="30" label="30-40" />' +
        '<ColorMapEntry color="#0a83ff" quantity="35" label="40-100" />' +
        '<ColorMapEntry color="#0423ff" quantity="50" label="40-100" />' +
      '</ColorMap>' +
    '</RasterSymbolizer>';
    
    
    var size = moisture_mask.size().getInfo() 
    var list = moisture_mask.toList(size)
    print(moisture_mask)
    for(var i = 0; i < size; i++){                                                      
    var image = ee.Image(list.get(i));
    var date = ee.Image(list.get(i)).get('system:index')
    var name = date.getInfo().slice(17, 31)
    Map.addLayer(ee.Image(list.get(i)).sldStyle(sld_intervals), {}, name, 0)                          
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //AREE URBANE, BOSCO E NEVE, ESTRATTE TRAMITE CLASSIFICAZIONE
    var img_mask = ee.Image.constant(1)
    var bosco = img_mask.updateMask(mosaico.eq(0));
    var urbano = img_mask.updateMask(mosaico.eq(4))
    Map.addLayer(bosco,{palette:'#3b3b3b'},'Bosco',0)
    Map.addLayer(urbano,{palette:'#3b3b3b'},'Urbano',0)
    
//////////////////////////////////////////////////////////////////////////////////////////////////////
//GRAFICO
  // Make the chart panel visible the first time a geometry is drawn.
  if (!chartPanel.style().get('shown')) {
    chartPanel.style().set('shown', true);
  }
   //Centra in aoi
  Map.centerObject(aoi,11.5)

  // Set the drawing mode back to null; turns drawing off.
  drawingTools.setShape(null);

  // Reduction scale is based on map scale to avoid memory/timeout errors.
  var mapScale = Map.getScale();
  var scale = mapScale > 5000 ? mapScale * 2 : 5000;
  var property;
  if(norm === 'Angle_based') {                                                    
    property = 'segmentStartTime'
    } else if (norm == 'Linear_based') {                                              //Se il metodo di nomalizzazione scelto è "Linear_based"
    property = 'system:time_start'                                              //Applico la corrispondente funzione di normalizzazione a tutte le immagini della collezione
    }
  var chart = ui.Chart.image
                  .series({
                    imageCollection: moisture_mask,
                    region: aoi,
                    reducer: ee.Reducer.mean(),
                    //band: 'moisture',
                    scale: scale,
                    xProperty: 'system:time_start'
                  })
                  .setOptions({
                    title: 'Mean moisture values [%]',
                    legend: {position: 'none'},
                    pointSize: 3,
                    hAxis: {title: 'Date'},
                    vAxis: {title: 'Moisture [%]'},
                    interpolateNulls: true,
                    series: {0: {color: '#0099ff'}},
                    //vAxis: {viewWindow: {min: 0, max: 40}},
                   chartArea: {backgroundColor: 'EBEBEB'}

                  });  
  // Replace the existing chart in the chart panel with the new chart.
  chartPanel.widgets().reset([chart]);
}});


calcolo.style().set({                                                                      
  fontSize: '24px',
  stretch: 'horizontal',
  fontWeight: 700,
  color: '#0099ff',
  maxWidth: '250px'
});





//LEGEND////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// set position of panel
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Create legend title
var legendTitle = ui.Label({
  value: 'Soil moisture [%]',
  style: {
    fontSize: '12px',
    margin: '0 0 3px 0',
    padding: '0'
    }
});

// Add the title to the panel
legend.add(legendTitle);
    
// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
      
      // Create the label that is actually the colored box.
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 0 0'
        }
      });
      
      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px', fontSize: '9.5px',}
      });
      
      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};


//  Palette with the colors
var palette =["ff0000","ffb714","f0ff0a","ccff66","4dff4d","02ff7f","0a83ff","0423ff"];

// name of the legend
var names = ['<5','5-10','10-15','15-20','20-25','25-30','30-35','>35'];

// Add color and and names
for (var i = 0; i < 8; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  

// add legend to map (alternatively you can also print the legend to the console)  
Map.add(legend); 



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var toolPanel = ui.Panel([titolo,tuWien, wcm, linkPanel, l1, controlPanel, l2, annoInput, meseInput, l3, orbita, l4, norm_m, l5, metodo, l6, calcolo,l7,close], 'flow', {width: '300px'});
toolPanel.style().set({
  maxWidth:500})

ui.root.add(toolPanel)


var marche = table                                                                    //area d'interesse
Map.centerObject(marche, 9);                                                          //centro la mappa sull'area d'interesse
 
var titolo = ui.Label('Tu Wien Change Detection');                                    //Pannello: titolo
titolo.style().set({                                                                  //stile pannello 'Tu Wien Change Detection'
  fontSize: '24px',
  fontWeight: 500,
  padding: '0px'
});

var annoTitolo = ui.Label('L\'anno su cui effetturare la stima (dal 2015 al 2020)');  //Pannello: anno
var annoInput = ui.Textbox({
  placeholder: 'Anno dal 2015 al 2020',                                               //testo
  value: '2015',
  onChange: function(text) {                                                          //testo da inserire
    var year = text;
    return year;
  }
});


var meseTitolo = ui.Label('Il mese su cui effettuare la stima (da agosto a gennaio)'); //Pannello: mese
var meseInput = ui.Textbox({
  placeholder: 'Mese da agosto a gennaio',                                             //testo
  value: '08',
  onChange: function(text) {                                                           //testo da inserire
    var month = text
    return month ;
  }
});


var path;
var pathList = {                                                                     
  ASCENDING: 1,
  DESCENDING: 2
};

var orbita = ui.Select({                                                               //Pannello: seleziona direzione dell'orbita
  items: Object.keys(pathList),
  placeholder: 'Seleziona la direzione dell\'orbita',                                  //testo
  onChange: function (key) {
    path = parseInt(key, 10);                                                          //scelta direzione dell'orbita
  }
});
orbita.style().set({                                                                    //stile pannello "Seleziona la direzione dell'orbita"
  maxWidth: '250px'
});

var band;
var bands = {
  VV: 1,
  VH: 2
};

var banda = ui.Select({                                                                //Pannello: seleziona la banda
  items: Object.keys(bands),
  placeholder: 'Seleziona la banda (consigliata VV)',                                  //testo
  onChange: function (key) {                                                          //scelta banda
    band = parseInt(key, 10);
  }
});
banda.style().set({                                                                    //stile pannello 'Seleziona la banda'
  maxWidth: '250px'
});


var norm;
var norm_method = {
  Angle_based: 1,
  Linear_based:2
};

var norm_m = ui.Select({                                                                //Pannello: seleziona il metodo di normalizzazione
  items: Object.keys(norm_method),
  placeholder: 'Seleziona il metodo di normalizzazione',                                //testo
  onChange: function (key) {                                                            //scelta banda
    norm = parseInt(key, 10);
  }
});
norm_m.style().set({                                                                    //stile pannello 'Seleziona la banda'
  maxWidth: '250px'
});

var calcolo = ui.Button({                                                               //Pannello: Elaborazione
  label: 'ELABORAZIONE',
  onClick: function() {
    var anno = ee.Number.parse(annoInput.getValue());                                 //valore inserito in anno 
    var mese = ee.Number.parse(meseInput.getValue());                                 //valore inserito in anno 
    var start = ee.Date.fromYMD (anno, mese, 01)                                      //trasformo in data di inizio (dal 1 del mese)
    var end = ee.Date.fromYMD (anno, mese, 30)                                        //trasformo in data di fine (fino al 30 del mese)
    
    var coll = ee.ImageCollection('COPERNICUS/S1_GRD_FLOAT')                          //Filtro la collezione in base ai metadati
      .filter(ee.Filter.eq('instrumentMode', 'IW'))                                   //- modalità IW
      .filter(ee.Filter.or(                                                           //- numero relativo dell'orbita:
        (ee.Filter.eq('relativeOrbitNumber_start',44)),                               //44 ascending
        (ee.Filter.eq('relativeOrbitNumber_start',117)),                              //117 ascending
        (ee.Filter.eq('relativeOrbitNumber_start',95)),                               //95 descending
        (ee.Filter.eq('relativeOrbitNumber_start',22))                                //22 descending
        ))
      .filterBounds(marche)                                                           //- regione d'interesse
      .filterDate(start, end)                                                         //- mese definito dall'utente
    ;
    
    var path = orbita.getValue();                                                     //Direzione dell'orbita inserita
    var pathString;
    if(path === 'ASCENDING') {                                                        //se è ASCENDING 
      coll = coll.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));          //filtra la collezione per le orbite ascendenti
    } else if (path === 'DESCENDING') {                                               //se è DESCENDING 
      coll =  coll.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));        //filtra la collezione per le orbite discendenti
    } else {
      pathString = null;
      throw new Error('Scegli la direzione dell\'orbita per procedere');              //Altrimenti, se la direzione dell'orbita non è né ascendente né discendente, errore: "Scegli la direzione dellìorbita per procedere"
    }
    
    
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
        var vh = img.select('VH')
        var gamma0vv = vv.divide(theta_iRad.cos());                                     //Da sigma 0 a gamma 0 per la banda VV
        var gamma0vh = vh.divide(theta_iRad.cos());                                     //Da sigma 0 a gamma 0 per la banda VH
        
        var nominator = (ninetyRad.subtract(theta_iRad)).cos();                         //Modello: nominatore
        var denominator = alpha_azRad.cos().multiply((ninetyRad.subtract(theta_iRad)    //Modello: denominatore
        .add(alpha_rRad)).cos());
        var result = nominator.divide(denominator);                                     //nominatore/denominatore
        
        var gammafvv = gamma0vv.divide(result)                                          //Applicazione del modello a gamma VV
        var gammafvh = gamma0vh.divide(result)                                          //Applicazione del modello a gamma VH
        
        var layover = alpha_rRad.lt(theta_iRad).rename('layover');                      //Layover
        var shadow = alpha_rRad.gt(ee.Image.constant(-1)                                //Shadow
        .multiply(ninetyRad.subtract(theta_iRad))).rename('shadow');
        var mask = layover.and(shadow);                                                 //Maschera per layover e shadow
        
        var norm =  ee.Image.cat(gammafvv, gammafvh).addBands(img.select('angle'))      //Immagine normalizzata
        return norm.updateMask(mask)                                                    //Applicazione della maschera all'immagine normalizzata
      };
    
    var corrLinear = function (img) {                                                   //Prima funzione per normalizzare ad un'angolo d'incidenza di riferimento. Metodo basato sulla realzione lineare tra sigma_0 e theta_i
        var startYear = ee.Date.fromYMD (anno, 01, 01);                                 //Primo giorno dell'anno scelto
        var endYear = ee.Date.fromYMD (anno, 12, 31);                                   //Ultimo giorno dell'anno scelto
        var s1 = ee.ImageCollection('COPERNICUS/S1_GRD_FLOAT')                          //Filtro la collezione in base ai metadati
          .filter(ee.Filter.eq('instrumentMode', 'IW'))                                 //- modalità IW
          .filter(ee.Filter.or(                                                         //- numero relativo dell'orbita:
            (ee.Filter.eq('relativeOrbitNumber_start',44)),                             //44 ascending
            (ee.Filter.eq('relativeOrbitNumber_start',117)),                            //117 ascending
            (ee.Filter.eq('relativeOrbitNumber_start',95)),                             //95 descending
            (ee.Filter.eq('relativeOrbitNumber_start',22))                              //22 descending
            ))
          .filterBounds(marche)                                                         //- regione d'interesse
          .filterDate(startYear, endYear)                                               //- anno definito dall'utente
        ;
        var bandString;
        var band= banda.getValue();
        if(band === 'VV') {                                                             //Se la banda scelta è VV:
         var linearfit = s1.select(['angle', 'VV'])                                     //Regressione lineare tra valori di sigma_0 (VV) e theta_i per l'anno di riferimento
         .reduce(ee.Reducer.linearFit());      
         var beta = linearfit.select('scale');                                          //seleziono beta: pendenza della retta di regrssione lineare
         var norm_calc = function(img){                                                 //Modello per la normalizzazione di VV
          return img.addBands(img.select('VV')                                  
          .subtract(beta.multiply(img.select('angle').subtract(40))))
          };
         var normalized = norm_calc(img);                                               //Applico il modello all'immagine
        } else if (band === 'VH') {                                                     //Se la banda scelta è VV:
          var linearfit = s1.select(['angle', 'VH'])                                    //Regressione lineare tra valori di sigma_0 (VH) e theta_i per l'anno di riferimento
         .reduce(ee.Reducer.linearFit());                                     
         var beta = linearfit.select('scale');                                          //seleziono beta: pendenza della retta di regrssione lineare
         var norm_calc = function(img){                                                 //Modello per la normalizzazione di VV
          return img.addBands(img.select('VH')
          .subtract(beta.multiply(img.select('angle').subtract(40))))
          };
         var normalized = norm_calc(img);                                                //Applico il modello all'immagine
        } else {                                                                         //Altrimenti, se la banda non è né VV né VH, errore: "Scegli la polarizzazione per procedere"
          bandString = null;                                                                
          throw new Error('Scegli la polarizzazione per procedere');
        }
       return normalized                                                                 //La funzione corrLinear ritorna l'immagine normalizzata
    };
        

    
    var normString;
    var norm = norm_m.getValue();
    if(norm === 'Angle_based') {                                                      //Se il metodo di nomalizzazione scelto è "Angle_based"
    var collNorm = coll.map(corrAngle)                                                //Applico la corrispondente funzione di normalizzazione a tutte le immagini della collezione
    } else if (norm == 'Linear_based') {                                              //Se il metodo di nomalizzazione scelto è "Linear_based"
    var collNorm = coll.map(corrLinear)                                               //Applico la corrispondente funzione di normalizzazione a tutte le immagini della collezione
    } else {
    normString = null;                                                                //Altrimenti errore: "Scegli un metodo di normalizzazione"
    throw new Error('Scegli il metodo di normalizzazione');
    }  
      
    var collNorm = collNorm.map(function(img){return img.clip(marche)})                //Ritaglio le immagini 
    var minMax = collNorm.reduce(ee.Reducer.minMax())                                  //Creo una nuova immagine contentente due bande: 
                                                                                       //-valori minimi per ciascun pixel -valori massimi per ciascun pixel
    var bandString;
    var band= banda.getValue();
    if(band === 'VV') {                                                                //Se la banda selezionata è VV:
      var collNorm = collNorm.select('VV');                                            //-seleziona dalla collezione sono la banda VV
      var driest = minMax.select('VV_min');                                            //-seleziona VVmin: condizioni secche
      var wettest = minMax.select ('VV_max');                                          //-seleziona VVmax: condizioni umide
    } else if (band === 'VH') {                                                        //Se la banda selezionata è VH:
      var collNorm = collNorm.select('VH');                                            //-seleziona dalla collezione sono la banda VVH
      var driest = minMax.select('VV_min');                                            //-seleziona VHmin: condizioni secche
      var wettest = minMax.select ('VV_max')                                           //-seleziona VHmax: condizioni umide
    } else {
      bandString = null;                                                               //Altrimenti errore 
      throw new Error('Scegli la polarizzazione');
    }
    
    var tu_wien = function (img){                                                      //Funzione con Tu Wien Change Detection method
    var sensitivity = wettest.subtract(driest);                                        //sensibilità: valori massimi-valori minimi
    var SMmax=0.32;                                                                    //condizioni di saturazione 
    var SMmin=0.05;                                                                    //Condizioni di avvizzimento
    var calculateSSM = function (image){                                               //Funzione per il calcolo umidità volumetrica
      return image.addBands(((image.subtract(driest)).divide(sensitivity))
      .multiply(SMmax-SMmin).add(SMmin)); 
      }; 
    var ssm = calculateSSM(img)                                                        //Applico la funzione all'immagine
    return ssm}
    
    
    var moisture = collNorm.map(tu_wien)                                               //Applico la funzione stima dell'umidità ad ogni immagine della collezione
    
    var rename = function (img) {                                                      //funzione per rinominare le bande
      if(band === 'VV') {                                                              //Se la banda scelta è VV 
      return img.select(['VV','VV_1']).rename(['VV','moisture'])                       //nuovi nomi: VV e moisture
    } else if (band == 'VH') {                                                         //Se la banda scelta è VH
      return img.select(['VH','VH_1']).rename(['VH','moisture'])                       //nuovi nomi: VH e moisture
    }}; 
    
     
    var moisture = moisture.map(rename)                                                 //applico la funzione per rinominare a tutte le immagini della collezione
    print('Collezione di dati Sentinel-1', coll);
    
    var size = moisture.size().getInfo()                                                //estraggo il numero di immagini nella collezione e trasferisco su lato client (necessario per applicare poi al ciclo for)
    var list = moisture.toList(size);                                                   //trasformo la collezione di immaigni in una lista della lunghezza individuata prima
    
    for(var i = 0; i < size; i++){                                                      // client side loop per visualizzare le immagini nella mappa
    var image = ee.Image(list.get(i));
    var name = image.get('name');
    Map.addLayer(image, {bands:'moisture'}, i.toString(), 1)                            //cambiare nome delle immagini!
    }
    
    var roi_moisture = moisture.map(function(img){return img.clip(roi)});               //Ritaglio le immagini all'area intorno alla stazione ASSAM Agugliano
    var mean = function (img){                                                          //Funzione per calcolare i valori di umidità medi dell'area per ogni immagine nella collezione
       var date = ee.String(img.get('system:index'))
      //var dateSplit = date.split('_').get(4)                                            //nomino le immagini utilizzando la data in system:index
      var dateSlice = date.slice(17,25)
      var img_set = img.set('name', dateSlice)                                          //imposto il nome come proprietà dell'immagine
      var mean = img_set.select('moisture').reduceRegion({
        reducer: ee.Reducer.mean(),                                                     //applico il reducer per calcolare la media
        geometry: roi,
        scale: 10})
        var img_out = img_set.set('moisture',mean)                                     //imposto il valore medio come proprietà dell'immagine
        return img_out
      };
    var moisture_mean = roi_moisture.map(mean)                                          //applico la funzione a tutte le immagini della collezione
    var add = ['moisture', 'name'];                                            //creo una lista di nome e valore medio
    var augmented = moisture_mean.map(function (image) {
        return image.set('dict', image.toDictionary(add));                              //e le imposto sotto forma di dizionario
    });
    var moisture_list = augmented.aggregate_array('dict');                              //estraggo le proprietà come un array
    
                                      
      var start = start.format (null, 'GMT')                                           //trasformo la data di inizio in stringa
      var start = start.replace('-', "").replace('-', "")                              //tolgo -
      var start = start.slice(0,8)                                                     //prendo solo l'anno il mese e il giorno
      var start_numb = ee.Number.parse(start).getInfo()                                //trasformo in numero e trasferisco sul client
      var end = end.format (null, 'GMT')                                               //trasformo la data di fine in stringa
      var end = end.replace('-', "").replace('-', "")                                  //tolgo -
      var end = end.slice(0,8)                                                         //prendo solo l'anno il mese e il giorno
      var end_numb = ee.Number.parse(end).getInfo()                                    //trasformo in numero e trasferisco sul client
      
      var prec = [	                                                                   //dati ASSAM di precipitazione per la stazione di Agugliano, 
          {data:20150801, prec_mm:11.2},	                                             //dal 01/08 al 31/01, dal 2015/2016 al 2020/2021
          {data:20150802, prec_mm:0},	
          {data:20150803, prec_mm:0},	
          {data:20150804, prec_mm:0},	
          {data:20150805, prec_mm:0},	
          {data:20150806, prec_mm:0},	
          {data:20150807, prec_mm:0},	
          {data:20150808, prec_mm:0},	
          {data:20150809, prec_mm:0},	
          {data:20150810, prec_mm:0},
          {data:20150811, prec_mm:2.2},
          {data:20150812, prec_mm:0},
          {data:20150813, prec_mm:0},
          {data:20150814, prec_mm:0.6},
          {data:20150815, prec_mm:11.2},
          {data:20150816, prec_mm:3.4},
          {data:20150817, prec_mm:0},
          {data:20150818, prec_mm:0},
          {data:20150819, prec_mm:3.2},
          {data:20150820, prec_mm:1.8},
          {data:20150821, prec_mm:0},
          {data:20150822, prec_mm:0},
          {data:20150823, prec_mm:0},
          {data:20150824, prec_mm:2.2},
          {data:20150825, prec_mm:1.4},
          {data:20150826, prec_mm:0},
          {data:20150827, prec_mm:0},
          {data:20150828, prec_mm:0},
          {data:20150829, prec_mm:0},
          {data:20150830, prec_mm:0},
          {data:20150831, prec_mm:0},
          {data:20150901, prec_mm:0},
          {data:20150902, prec_mm:0},
          {data:20150903, prec_mm:3.8},
          {data:20150904, prec_mm:0},
          {data:20150905, prec_mm:0.8},
          {data:20150906, prec_mm:0},
          {data:20150907, prec_mm:0},
          {data:20150908, prec_mm:0},
          {data:20150909, prec_mm:0},
          {data:20150910, prec_mm:0},
          {data:20150911, prec_mm:0},
          {data:20150912, prec_mm:0},
          {data:20150913, prec_mm:0},
          {data:20150914, prec_mm:0},
          {data:20150915, prec_mm:0},
          {data:20150916, prec_mm:0},
          {data:20150917, prec_mm:0},
          {data:20150918, prec_mm:0},
          {data:20150919, prec_mm:0},
          {data:20150920, prec_mm:0},
          {data:20150921, prec_mm:0},
          {data:20150922, prec_mm:0},
          {data:20150923, prec_mm:0},
          {data:20150924, prec_mm:18.2},
          {data:20150925, prec_mm:10.4},
          {data:20150926, prec_mm:1.6},
          {data:20150927, prec_mm:0},
          {data:20150928, prec_mm:0},
          {data:20150929, prec_mm:0},
          {data:20150930, prec_mm:0},
          {data:20151001, prec_mm:10.4},
          {data:20151002, prec_mm:4.2},
          {data:20151003, prec_mm:0},
          {data:20151004, prec_mm:0},
          {data:20151005, prec_mm:10.6},
          {data:20151006, prec_mm:1.2},
          {data:20151007, prec_mm:36.2},
          {data:20151008, prec_mm:2.6},
          {data:20151009, prec_mm:0},
          {data:20151010, prec_mm:47},
          {data:20151011, prec_mm:10.4},
          {data:20151012, prec_mm:0},
          {data:20151013, prec_mm:1},
          {data:20151014, prec_mm:30.6},
          {data:20151015, prec_mm:0.8},
          {data:20151016, prec_mm:0.2},
          {data:20151017, prec_mm:0},
          {data:20151018, prec_mm:3.4},
          {data:20151019, prec_mm:25.4},
          {data:20151020, prec_mm:0},
          {data:20151021, prec_mm:0},
          {data:20151022, prec_mm:0},
          {data:20151023, prec_mm:0},
          {data:20151024, prec_mm:0},
          {data:20151025, prec_mm:0},
          {data:20151026, prec_mm:0},
          {data:20151027, prec_mm:0.2},
          {data:20151028, prec_mm:0.2},
          {data:20151029, prec_mm:8.2},
          {data:20151030, prec_mm:7},
          {data:20151031, prec_mm:0.2},
          {data:20151101, prec_mm:0.2},
          {data:20151102, prec_mm:0},
          {data:20151103, prec_mm:0.2},
          {data:20151104, prec_mm:0.2},
          {data:20151105, prec_mm:0},
          {data:20151106, prec_mm:0},
          {data:20151107, prec_mm:0},
          {data:20151108, prec_mm:0},
          {data:20151109, prec_mm:0},
          {data:20151110, prec_mm:0},
          {data:20151111, prec_mm:0},
          {data:20151112, prec_mm:0.4},
          {data:20151113, prec_mm:0.2},
          {data:20151114, prec_mm:0},
          {data:20151115, prec_mm:0},
          {data:20151116, prec_mm:0},
          {data:20151117, prec_mm:0},
          {data:20151118, prec_mm:0},
          {data:20151119, prec_mm:0.2},
          {data:20151120, prec_mm:0},
          {data:20151121, prec_mm:6.6},
          {data:20151122, prec_mm:5.2},
          {data:20151123, prec_mm:2},
          {data:20151124, prec_mm:0},
          {data:20151125, prec_mm:0},
          {data:20151126, prec_mm:15.4},
          {data:20151127, prec_mm:10.2},
          {data:20151128, prec_mm:0},
          {data:20151129, prec_mm:0},
          {data:20151130, prec_mm:0},
          {data:20151201, prec_mm:0},
          {data:20151202, prec_mm:0},
          {data:20151203, prec_mm:0.2},
          {data:20151204, prec_mm:0},
          {data:20151205, prec_mm:0},
          {data:20151206, prec_mm:0},
          {data:20151207, prec_mm:0.2},
          {data:20151208, prec_mm:0},
          {data:20151209, prec_mm:0},
          {data:20151210, prec_mm:0.4},
          {data:20151211, prec_mm:0},
          {data:20151212, prec_mm:0.2},
          {data:20151213, prec_mm:0},
          {data:20151214, prec_mm:0},
          {data:20151215, prec_mm:0},
          {data:20151216, prec_mm:0},
          {data:20151217, prec_mm:0.2},
          {data:20151218, prec_mm:0},
          {data:20151219, prec_mm:0},
          {data:20151220, prec_mm:0.2},
          {data:20151221, prec_mm:0.2},
          {data:20151222, prec_mm:0},
          {data:20151223, prec_mm:0.2},
          {data:20151224, prec_mm:0},
          {data:20151225, prec_mm:0.2},
          {data:20151226, prec_mm:0},
          {data:20151227, prec_mm:0.2},
          {data:20151228, prec_mm:0.2},
          {data:20151229, prec_mm:0.2},
          {data:20151230, prec_mm:0.2},
          {data:20151231, prec_mm:0},
          {data:20160101, prec_mm:0},
          {data:20160102, prec_mm:9.6},
          {data:20160103, prec_mm:14.2},
          {data:20160104, prec_mm:2.2},
          {data:20160105, prec_mm:0},
          {data:20160106, prec_mm:14.8},
          {data:20160107, prec_mm:0.4},
          {data:20160108, prec_mm:0},
          {data:20160109, prec_mm:0},
          {data:20160110, prec_mm:1.6},
          {data:20160111, prec_mm:1.6},
          {data:20160112, prec_mm:0},
          {data:20160113, prec_mm:0.2},
          {data:20160114, prec_mm:0.2},
          {data:20160115, prec_mm:3.2},
          {data:20160116, prec_mm:1.4},
          {data:20160117, prec_mm:2},
          {data:20160118, prec_mm:0},
          {data:20160119, prec_mm:0},
          {data:20160120, prec_mm:0},
          {data:20160121, prec_mm:0},
          {data:20160122, prec_mm:0},
          {data:20160123, prec_mm:0},
          {data:20160124, prec_mm:0},
          {data:20160125, prec_mm:0},
          {data:20160126, prec_mm:0},
          {data:20160127, prec_mm:0},
          {data:20160128, prec_mm:0},
          {data:20160129, prec_mm:0},
          {data:20160130, prec_mm:0},
          {data:20160131, prec_mm:0},
          {data:20160801, prec_mm:0},
          {data:20160802, prec_mm:0},
          {data:20160803, prec_mm:0},
          {data:20160804, prec_mm:0},
          {data:20160805, prec_mm:25},
          {data:20160806, prec_mm:8.2},
          {data:20160807, prec_mm:0},
          {data:20160808, prec_mm:0},
          {data:20160809, prec_mm:0},
          {data:20160810, prec_mm:38.2},
          {data:20160811, prec_mm:2},
          {data:20160812, prec_mm:0},
          {data:20160813, prec_mm:0},
          {data:20160814, prec_mm:0},
          {data:20160815, prec_mm:0},
          {data:20160816, prec_mm:0},
          {data:20160817, prec_mm:0},
          {data:20160818, prec_mm:0},
          {data:20160819, prec_mm:6.4},
          {data:20160820, prec_mm:0},
          {data:20160821, prec_mm:0},
          {data:20160822, prec_mm:1.8},
          {data:20160823, prec_mm:0},
          {data:20160824, prec_mm:0},
          {data:20160825, prec_mm:0},
          {data:20160826, prec_mm:0},
          {data:20160827, prec_mm:0},
          {data:20160828, prec_mm:0},
          {data:20160829, prec_mm:0},
          {data:20160830, prec_mm:0},
          {data:20160831, prec_mm:0},
          {data:20160901, prec_mm:0},
          {data:20160902, prec_mm:0},
          {data:20160903, prec_mm:0},
          {data:20160904, prec_mm:0},
          {data:20160905, prec_mm:0},
          {data:20160906, prec_mm:0},
          {data:20160907, prec_mm:0.6},
          {data:20160908, prec_mm:0},
          {data:20160909, prec_mm:0},
          {data:20160910, prec_mm:0},
          {data:20160911, prec_mm:1.4},
          {data:20160912, prec_mm:0.2},
          {data:20160913, prec_mm:0},
          {data:20160914, prec_mm:0},
          {data:20160915, prec_mm:0},
          {data:20160916, prec_mm:0.4},
          {data:20160917, prec_mm:0},
          {data:20160918, prec_mm:5.4},
          {data:20160919, prec_mm:14.6},
          {data:20160920, prec_mm:0},
          {data:20160921, prec_mm:0.2},
          {data:20160922, prec_mm:0},
          {data:20160923, prec_mm:0},
          {data:20160924, prec_mm:0},
          {data:20160925, prec_mm:0},
          {data:20160926, prec_mm:0},
          {data:20160927, prec_mm:0},
          {data:20160928, prec_mm:0},
          {data:20160929, prec_mm:0},
          {data:20160930, prec_mm:0},
          {data:20161001, prec_mm:1.2},
          {data:20161002, prec_mm:5},
          {data:20161003, prec_mm:3.4},
          {data:20161004, prec_mm:0},
          {data:20161005, prec_mm:1},
          {data:20161006, prec_mm:4},
          {data:20161007, prec_mm:8.8},
          {data:20161008, prec_mm:5.2},
          {data:20161009, prec_mm:8.6},
          {data:20161010, prec_mm:37.6},
          {data:20161011, prec_mm:7},
          {data:20161012, prec_mm:0},
          {data:20161013, prec_mm:7.2},
          {data:20161014, prec_mm:2.4},
          {data:20161015, prec_mm:1.2},
          {data:20161016, prec_mm:0},
          {data:20161017, prec_mm:0},
          {data:20161018, prec_mm:0.8},
          {data:20161019, prec_mm:0.2},
          {data:20161020, prec_mm:0},
          {data:20161021, prec_mm:0},
          {data:20161022, prec_mm:0.2},
          {data:20161023, prec_mm:0},
          {data:20161024, prec_mm:0},
          {data:20161025, prec_mm:0},
          {data:20161026, prec_mm:0.6},
          {data:20161027, prec_mm:0.2},
          {data:20161028, prec_mm:0},
          {data:20161029, prec_mm:0},
          {data:20161030, prec_mm:0},
          {data:20161031, prec_mm:0},
          {data:20161101, prec_mm:0},
          {data:20161102, prec_mm:0},
          {data:20161103, prec_mm:1},
          {data:20161104, prec_mm:0},
          {data:20161105, prec_mm:0.6},
          {data:20161106, prec_mm:0.4},
          {data:20161107, prec_mm:0},
          {data:20161108, prec_mm:1.4},
          {data:20161109, prec_mm:1},
          {data:20161110, prec_mm:1},
          {data:20161111, prec_mm:10.2},
          {data:20161112, prec_mm:11.8},
          {data:20161113, prec_mm:0},
          {data:20161114, prec_mm:0.2},
          {data:20161115, prec_mm:0},
          {data:20161116, prec_mm:0},
          {data:20161117, prec_mm:0.2},
          {data:20161118, prec_mm:1.2},
          {data:20161119, prec_mm:0.2},
          {data:20161120, prec_mm:0},
          {data:20161121, prec_mm:0},
          {data:20161122, prec_mm:0.2},
          {data:20161123, prec_mm:0},
          {data:20161124, prec_mm:0.2},
          {data:20161125, prec_mm:0.8},
          {data:20161126, prec_mm:2.8},
          {data:20161127, prec_mm:0.4},
          {data:20161128, prec_mm:2.2},
          {data:20161129, prec_mm:0},
          {data:20161130, prec_mm:0},
          {data:20161201, prec_mm:0},
          {data:20161202, prec_mm:0},
          {data:20161203, prec_mm:0.2},
          {data:20161204, prec_mm:0},
          {data:20161205, prec_mm:0},
          {data:20161206, prec_mm:0},
          {data:20161207, prec_mm:0},
          {data:20161208, prec_mm:0},
          {data:20161209, prec_mm:0},
          {data:20161210, prec_mm:0},
          {data:20161211, prec_mm:0},
          {data:20161212, prec_mm:0.2},
          {data:20161213, prec_mm:0.2},
          {data:20161214, prec_mm:0.2},
          {data:20161215, prec_mm:0.2},
          {data:20161216, prec_mm:0},
          {data:20161217, prec_mm:0},
          {data:20161218, prec_mm:0},
          {data:20161219, prec_mm:0},
          {data:20161220, prec_mm:3.6},
          {data:20161221, prec_mm:0},
          {data:20161222, prec_mm:0},
          {data:20161223, prec_mm:0},
          {data:20161224, prec_mm:0},
          {data:20161225, prec_mm:0},
          {data:20161226, prec_mm:0},
          {data:20161227, prec_mm:0},
          {data:20161228, prec_mm:0},
          {data:20161229, prec_mm:0},
          {data:20161230, prec_mm:0},
          {data:20161231, prec_mm:0},
          {data:20170101, prec_mm:0},
          {data:20170102, prec_mm:0},
          {data:20170103, prec_mm:18.2},
          {data:20170104, prec_mm:0},
          {data:20170105, prec_mm:14},
          {data:20170106, prec_mm:0},
          {data:20170107, prec_mm:0},
          {data:20170108, prec_mm:0},
          {data:20170109, prec_mm:0},
          {data:20170110, prec_mm:0.2},
          {data:20170111, prec_mm:0},
          {data:20170112, prec_mm:0},
          {data:20170113, prec_mm:10.8},
          {data:20170114, prec_mm:0.6},
          {data:20170115, prec_mm:2.4},
          {data:20170116, prec_mm:12.6},
          {data:20170117, prec_mm:29.6},
          {data:20170118, prec_mm:8.6},
          {data:20170119, prec_mm:1},
          {data:20170120, prec_mm:0},
          {data:20170121, prec_mm:0},
          {data:20170122, prec_mm:0},
          {data:20170123, prec_mm:0.8},
          {data:20170124, prec_mm:0},
          {data:20170125, prec_mm:0},
          {data:20170126, prec_mm:0},
          {data:20170127, prec_mm:0},
          {data:20170128, prec_mm:0},
          {data:20170129, prec_mm:0},
          {data:20170130, prec_mm:0},
          {data:20170131, prec_mm:0},
          {data:20170801, prec_mm:0},
          {data:20170802, prec_mm:0},
          {data:20170803, prec_mm:0},
          {data:20170804, prec_mm:0},
          {data:20170805, prec_mm:0},
          {data:20170806, prec_mm:0},
          {data:20170807, prec_mm:0},
          {data:20170808, prec_mm:0},
          {data:20170809, prec_mm:0},
          {data:20170810, prec_mm:0},
          {data:20170811, prec_mm:0},
          {data:20170812, prec_mm:0},
          {data:20170813, prec_mm:0},
          {data:20170814, prec_mm:0},
          {data:20170815, prec_mm:0},
          {data:20170816, prec_mm:0},
          {data:20170817, prec_mm:0},
          {data:20170818, prec_mm:0},
          {data:20170819, prec_mm:0},
          {data:20170820, prec_mm:0},
          {data:20170821, prec_mm:0},
          {data:20170822, prec_mm:0},
          {data:20170823, prec_mm:0},
          {data:20170824, prec_mm:0},
          {data:20170825, prec_mm:0},
          {data:20170826, prec_mm:0},
          {data:20170827, prec_mm:0},
          {data:20170828, prec_mm:0},
          {data:20170829, prec_mm:0},
          {data:20170830, prec_mm:0},
          {data:20170831, prec_mm:0},
          {data:20170901, prec_mm:8},
          {data:20170902, prec_mm:0},
          {data:20170903, prec_mm:6.6},
          {data:20170904, prec_mm:0},
          {data:20170905, prec_mm:0},
          {data:20170906, prec_mm:0},
          {data:20170907, prec_mm:10.6},
          {data:20170908, prec_mm:0},
          {data:20170909, prec_mm:0},
          {data:20170910, prec_mm:27.6},
          {data:20170911, prec_mm:38.2},
          {data:20170912, prec_mm:0},
          {data:20170913, prec_mm:0},
          {data:20170914, prec_mm:0},
          {data:20170915, prec_mm:0},
          {data:20170916, prec_mm:38.2},
          {data:20170917, prec_mm:0.2},
          {data:20170918, prec_mm:3.4},
          {data:20170919, prec_mm:11.8},
          {data:20170920, prec_mm:33},
          {data:20170921, prec_mm:0},
          {data:20170922, prec_mm:0},
          {data:20170923, prec_mm:0},
          {data:20170924, prec_mm:29.4},
          {data:20170925, prec_mm:12.8},
          {data:20170926, prec_mm:6},
          {data:20170927, prec_mm:0},
          {data:20170928, prec_mm:0},
          {data:20170929, prec_mm:0},
          {data:20170930, prec_mm:0},
          {data:20171001, prec_mm:0},
          {data:20171002, prec_mm:0},
          {data:20171003, prec_mm:0},
          {data:20171004, prec_mm:0},
          {data:20171005, prec_mm:0},
          {data:20171006, prec_mm:6.6},
          {data:20171007, prec_mm:0},
          {data:20171008, prec_mm:0},
          {data:20171009, prec_mm:0},
          {data:20171010, prec_mm:0},
          {data:20171011, prec_mm:0},
          {data:20171012, prec_mm:0},
          {data:20171013, prec_mm:0},
          {data:20171014, prec_mm:0},
          {data:20171015, prec_mm:0.2},
          {data:20171016, prec_mm:0},
          {data:20171017, prec_mm:0},
          {data:20171018, prec_mm:0},
          {data:20171019, prec_mm:0},
          {data:20171020, prec_mm:0.4},
          {data:20171021, prec_mm:0.2},
          {data:20171022, prec_mm:8.2},
          {data:20171023, prec_mm:21},
          {data:20171024, prec_mm:0},
          {data:20171025, prec_mm:0},
          {data:20171026, prec_mm:0},
          {data:20171027, prec_mm:0},
          {data:20171028, prec_mm:0},
          {data:20171029, prec_mm:0},
          {data:20171030, prec_mm:0},
          {data:20171031, prec_mm:0},
          {data:20171101, prec_mm:0},
          {data:20171102, prec_mm:0},
          {data:20171103, prec_mm:1.6},
          {data:20171104, prec_mm:0.2},
          {data:20171105, prec_mm:7},
          {data:20171106, prec_mm:2.4},
          {data:20171107, prec_mm:3},
          {data:20171108, prec_mm:0},
          {data:20171109, prec_mm:0},
          {data:20171110, prec_mm:1},
          {data:20171111, prec_mm:0},
          {data:20171112, prec_mm:0.2},
          {data:20171113, prec_mm:30.6},
          {data:20171114, prec_mm:16.8},
          {data:20171115, prec_mm:34.4},
          {data:20171116, prec_mm:2.2},
          {data:20171117, prec_mm:0},
          {data:20171118, prec_mm:0},
          {data:20171119, prec_mm:0},
          {data:20171120, prec_mm:0},
          {data:20171121, prec_mm:0},
          {data:20171122, prec_mm:0},
          {data:20171123, prec_mm:0},
          {data:20171124, prec_mm:0},
          {data:20171125, prec_mm:0},
          {data:20171126, prec_mm:12.6},
          {data:20171127, prec_mm:0},
          {data:20171128, prec_mm:0},
          {data:20171129, prec_mm:7},
          {data:20171130, prec_mm:4.6},
          {data:20171201, prec_mm:0},
          {data:20171202, prec_mm:0.8},
          {data:20171203, prec_mm:9},
          {data:20171204, prec_mm:0},
          {data:20171205, prec_mm:0},
          {data:20171206, prec_mm:0},
          {data:20171207, prec_mm:0},
          {data:20171208, prec_mm:0},
          {data:20171209, prec_mm:10.6},
          {data:20171210, prec_mm:0},
          {data:20171211, prec_mm:0},
          {data:20171212, prec_mm:9.6},
          {data:20171213, prec_mm:6.2},
          {data:20171214, prec_mm:0},
          {data:20171215, prec_mm:9.6},
          {data:20171216, prec_mm:20.8},
          {data:20171217, prec_mm:6.4},
          {data:20171218, prec_mm:0.2},
          {data:20171219, prec_mm:0},
          {data:20171220, prec_mm:1.2},
          {data:20171221, prec_mm:0.2},
          {data:20171222, prec_mm:0},
          {data:20171223, prec_mm:0},
          {data:20171224, prec_mm:0},
          {data:20171225, prec_mm:0},
          {data:20171226, prec_mm:0},
          {data:20171227, prec_mm:1.4},
          {data:20171228, prec_mm:7.2},
          {data:20171229, prec_mm:13},
          {data:20171230, prec_mm:0},
          {data:20171231, prec_mm:0},
          {data:20180101, prec_mm:5.4},
          {data:20180102, prec_mm:7.6},
          {data:20180103, prec_mm:0},
          {data:20180104, prec_mm:0},
          {data:20180105, prec_mm:0},
          {data:20180106, prec_mm:0},
          {data:20180107, prec_mm:0.4},
          {data:20180108, prec_mm:0},
          {data:20180109, prec_mm:5.8},
          {data:20180110, prec_mm:1.2},
          {data:20180111, prec_mm:0},
          {data:20180112, prec_mm:0.2},
          {data:20180113, prec_mm:2.6},
          {data:20180114, prec_mm:0},
          {data:20180115, prec_mm:0.2},
          {data:20180116, prec_mm:0},
          {data:20180117, prec_mm:3.6},
          {data:20180118, prec_mm:0},
          {data:20180119, prec_mm:0},
          {data:20180120, prec_mm:1.2},
          {data:20180121, prec_mm:0},
          {data:20180122, prec_mm:0},
          {data:20180123, prec_mm:0},
          {data:20180124, prec_mm:0},
          {data:20180125, prec_mm:0.2},
          {data:20180126, prec_mm:0},
          {data:20180127, prec_mm:0},
          {data:20180128, prec_mm:0},
          {data:20180129, prec_mm:0.2},
          {data:20180130, prec_mm:0.4},
          {data:20180131, prec_mm:0},
          {data:20180801, prec_mm:0},
          {data:20180802, prec_mm:0},
          {data:20180803, prec_mm:0},
          {data:20180804, prec_mm:0},
          {data:20180805, prec_mm:0},
          {data:20180806, prec_mm:0},
          {data:20180807, prec_mm:0},
          {data:20180808, prec_mm:0},
          {data:20180809, prec_mm:0},
          {data:20180810, prec_mm:2.2},
          {data:20180811, prec_mm:0},
          {data:20180812, prec_mm:0},
          {data:20180813, prec_mm:0},
          {data:20180814, prec_mm:2.8},
          {data:20180815, prec_mm:0},
          {data:20180816, prec_mm:0},
          {data:20180817, prec_mm:0},
          {data:20180818, prec_mm:0},
          {data:20180819, prec_mm:0},
          {data:20180820, prec_mm:0},
          {data:20180821, prec_mm:0},
          {data:20180822, prec_mm:0},
          {data:20180823, prec_mm:0},
          {data:20180824, prec_mm:0},
          {data:20180825, prec_mm:2.6},
          {data:20180826, prec_mm:17.8},
          {data:20180827, prec_mm:0},
          {data:20180828, prec_mm:0},
          {data:20180829, prec_mm:0},
          {data:20180830, prec_mm:0},
          {data:20180831, prec_mm:0},
          {data:20180901, prec_mm:11.6},
          {data:20180902, prec_mm:3.8},
          {data:20180903, prec_mm:0},
          {data:20180904, prec_mm:0},
          {data:20180905, prec_mm:0},
          {data:20180906, prec_mm:0},
          {data:20180907, prec_mm:1},
          {data:20180908, prec_mm:0.6},
          {data:20180909, prec_mm:0},
          {data:20180910, prec_mm:0},
          {data:20180911, prec_mm:0},
          {data:20180912, prec_mm:0},
          {data:20180913, prec_mm:0},
          {data:20180914, prec_mm:0},
          {data:20180915, prec_mm:0},
          {data:20180916, prec_mm:0},
          {data:20180917, prec_mm:0.2},
          {data:20180918, prec_mm:0},
          {data:20180919, prec_mm:0},
          {data:20180920, prec_mm:0},
          {data:20180921, prec_mm:0},
          {data:20180922, prec_mm:0},
          {data:20180923, prec_mm:0},
          {data:20180924, prec_mm:1.8},
          {data:20180925, prec_mm:0},
          {data:20180926, prec_mm:0},
          {data:20180927, prec_mm:0},
          {data:20180928, prec_mm:0},
          {data:20180929, prec_mm:0},
          {data:20180930, prec_mm:0},
          {data:20181001, prec_mm:13},
          {data:20181002, prec_mm:0},
          {data:20181003, prec_mm:0},
          {data:20181004, prec_mm:0},
          {data:20181005, prec_mm:0.4},
          {data:20181006, prec_mm:0.6},
          {data:20181007, prec_mm:0.4},
          {data:20181008, prec_mm:0},
          {data:20181009, prec_mm:0},
          {data:20181010, prec_mm:0.2},
          {data:20181011, prec_mm:0.2},
          {data:20181012, prec_mm:0},
          {data:20181013, prec_mm:0.2},
          {data:20181014, prec_mm:0},
          {data:20181015, prec_mm:0.4},
          {data:20181016, prec_mm:1.2},
          {data:20181017, prec_mm:9.6},
          {data:20181018, prec_mm:0},
          {data:20181019, prec_mm:0.2},
          {data:20181020, prec_mm:0},
          {data:20181021, prec_mm:20.6},
          {data:20181022, prec_mm:2},
          {data:20181023, prec_mm:0},
          {data:20181024, prec_mm:0},
          {data:20181025, prec_mm:0},
          {data:20181026, prec_mm:0},
          {data:20181027, prec_mm:0},
          {data:20181028, prec_mm:14.4},
          {data:20181029, prec_mm:4},
          {data:20181030, prec_mm:0},
          {data:20181031, prec_mm:0},
          {data:20181101, prec_mm:7.4},
          {data:20181102, prec_mm:1.4},
          {data:20181103, prec_mm:0.2},
          {data:20181104, prec_mm:0},
          {data:20181105, prec_mm:0},
          {data:20181106, prec_mm:0},
          {data:20181107, prec_mm:0.2},
          {data:20181108, prec_mm:0},
          {data:20181109, prec_mm:0},
          {data:20181110, prec_mm:0},
          {data:20181111, prec_mm:0.2},
          {data:20181112, prec_mm:0},
          {data:20181113, prec_mm:0.2},
          {data:20181114, prec_mm:0},
          {data:20181115, prec_mm:0},
          {data:20181116, prec_mm:0},
          {data:20181117, prec_mm:0},
          {data:20181118, prec_mm:1.4},
          {data:20181119, prec_mm:3.4},
          {data:20181120, prec_mm:3.2},
          {data:20181121, prec_mm:0.4},
          {data:20181122, prec_mm:1.6},
          {data:20181123, prec_mm:0},
          {data:20181124, prec_mm:4},
          {data:20181125, prec_mm:14.2},
          {data:20181126, prec_mm:0.8},
          {data:20181127, prec_mm:3.4},
          {data:20181128, prec_mm:0},
          {data:20181129, prec_mm:0},
          {data:20181130, prec_mm:0},
          {data:20181201, prec_mm:0},
          {data:20181202, prec_mm:0},
          {data:20181203, prec_mm:0},
          {data:20181204, prec_mm:0},
          {data:20181205, prec_mm:0},
          {data:20181206, prec_mm:0},
          {data:20181207, prec_mm:0},
          {data:20181208, prec_mm:0.6},
          {data:20181209, prec_mm:0},
          {data:20181210, prec_mm:0},
          {data:20181211, prec_mm:0},
          {data:20181212, prec_mm:0},
          {data:20181213, prec_mm:4.6},
          {data:20181214, prec_mm:16.6},
          {data:20181215, prec_mm:0.2},
          {data:20181216, prec_mm:5.2},
          {data:20181217, prec_mm:33.2},
          {data:20181218, prec_mm:0},
          {data:20181219, prec_mm:0},
          {data:20181220, prec_mm:0.4},
          {data:20181221, prec_mm:0},
          {data:20181222, prec_mm:0},
          {data:20181223, prec_mm:0},
          {data:20181224, prec_mm:0.2},
          {data:20181225, prec_mm:0},
          {data:20181226, prec_mm:0},
          {data:20181227, prec_mm:0},
          {data:20181228, prec_mm:0},
          {data:20181229, prec_mm:0},
          {data:20181230, prec_mm:0},
          {data:20181231, prec_mm:0},
          {data:20190101, prec_mm:0},
          {data:20190102, prec_mm:3.6},
          {data:20190103, prec_mm:0},
          {data:20190104, prec_mm:0.4},
          {data:20190105, prec_mm:0},
          {data:20190106, prec_mm:0},
          {data:20190107, prec_mm:0},
          {data:20190108, prec_mm:1.2},
          {data:20190109, prec_mm:1.6},
          {data:20190110, prec_mm:7.2},
          {data:20190111, prec_mm:1.2},
          {data:20190112, prec_mm:0},
          {data:20190113, prec_mm:0},
          {data:20190114, prec_mm:0},
          {data:20190115, prec_mm:0},
          {data:20190116, prec_mm:0},
          {data:20190117, prec_mm:0},
          {data:20190118, prec_mm:2},
          {data:20190119, prec_mm:1.8},
          {data:20190120, prec_mm:5.8},
          {data:20190121, prec_mm:16.6},
          {data:20190122, prec_mm:14.6},
          {data:20190123, prec_mm:3},
          {data:20190124, prec_mm:3.8},
          {data:20190125, prec_mm:0.6},
          {data:20190126, prec_mm:0},
          {data:20190127, prec_mm:0},
          {data:20190128, prec_mm:5},
          {data:20190129, prec_mm:0.8},
          {data:20190130, prec_mm:0},
          {data:20190131, prec_mm:0.4},
          {data:20190801, prec_mm:0},
          {data:20190802, prec_mm:2.6},
          {data:20190803, prec_mm:0},
          {data:20190804, prec_mm:0},
          {data:20190805, prec_mm:0},
          {data:20190806, prec_mm:0},
          {data:20190807, prec_mm:0},
          {data:20190808, prec_mm:0},
          {data:20190809, prec_mm:0},
          {data:20190810, prec_mm:0},
          {data:20190811, prec_mm:0},
          {data:20190812, prec_mm:0},
          {data:20190813, prec_mm:2.6},
          {data:20190814, prec_mm:5.6},
          {data:20190815, prec_mm:0},
          {data:20190816, prec_mm:0},
          {data:20190817, prec_mm:0},
          {data:20190818, prec_mm:0},
          {data:20190819, prec_mm:0},
          {data:20190820, prec_mm:0},
          {data:20190821, prec_mm:0},
          {data:20190822, prec_mm:0},
          {data:20190823, prec_mm:4.2},
          {data:20190824, prec_mm:0},
          {data:20190825, prec_mm:0},
          {data:20190826, prec_mm:0},
          {data:20190827, prec_mm:0},
          {data:20190828, prec_mm:0},
          {data:20190829, prec_mm:0},
          {data:20190830, prec_mm:0},
          {data:20190831, prec_mm:0},
          {data:20190901, prec_mm:0},
          {data:20190902, prec_mm:14.2},
          {data:20190903, prec_mm:44.8},
          {data:20190904, prec_mm:0},
          {data:20190905, prec_mm:0},
          {data:20190906, prec_mm:12.6},
          {data:20190907, prec_mm:2.6},
          {data:20190908, prec_mm:0},
          {data:20190909, prec_mm:0.2},
          {data:20190910, prec_mm:0},
          {data:20190911, prec_mm:0},
          {data:20190912, prec_mm:0},
          {data:20190913, prec_mm:0},
          {data:20190914, prec_mm:0},
          {data:20190915, prec_mm:0},
          {data:20190916, prec_mm:0},
          {data:20190917, prec_mm:0},
          {data:20190918, prec_mm:0},
          {data:20190919, prec_mm:10.8},
          {data:20190920, prec_mm:0},
          {data:20190921, prec_mm:0},
          {data:20190922, prec_mm:2.6},
          {data:20190923, prec_mm:22.4},
          {data:20190924, prec_mm:0},
          {data:20190925, prec_mm:2},
          {data:20190926, prec_mm:0},
          {data:20190927, prec_mm:0},
          {data:20190928, prec_mm:0},
          {data:20190929, prec_mm:0},
          {data:20190930, prec_mm:0},
          {data:20191001, prec_mm:0},
          {data:20191002, prec_mm:10.4},
          {data:20191003, prec_mm:16.6},
          {data:20191004, prec_mm:0},
          {data:20191005, prec_mm:9.6},
          {data:20191006, prec_mm:0.8},
          {data:20191007, prec_mm:0},
          {data:20191008, prec_mm:0},
          {data:20191009, prec_mm:0},
          {data:20191010, prec_mm:0.2},
          {data:20191011, prec_mm:0},
          {data:20191012, prec_mm:0.2},
          {data:20191013, prec_mm:0},
          {data:20191014, prec_mm:0.2},
          {data:20191015, prec_mm:0},
          {data:20191016, prec_mm:0},
          {data:20191017, prec_mm:0},
          {data:20191018, prec_mm:0},
          {data:20191019, prec_mm:0},
          {data:20191020, prec_mm:0},
          {data:20191021, prec_mm:0},
          {data:20191022, prec_mm:0.2},
          {data:20191023, prec_mm:0},
          {data:20191024, prec_mm:0.2},
          {data:20191025, prec_mm:0},
          {data:20191026, prec_mm:0.2},
          {data:20191027, prec_mm:0.2},
          {data:20191028, prec_mm:0.2},
          {data:20191029, prec_mm:0},
          {data:20191030, prec_mm:18.2},
          {data:20191031, prec_mm:4.4},
          {data:20191101, prec_mm:0.6},
          {data:20191102, prec_mm:4.4},
          {data:20191103, prec_mm:4.6},
          {data:20191104, prec_mm:0.2},
          {data:20191105, prec_mm:0},
          {data:20191106, prec_mm:1.6},
          {data:20191107, prec_mm:0.8},
          {data:20191108, prec_mm:2.2},
          {data:20191109, prec_mm:0},
          {data:20191110, prec_mm:0},
          {data:20191111, prec_mm:0.2},
          {data:20191112, prec_mm:18.2},
          {data:20191113, prec_mm:0},
          {data:20191114, prec_mm:0},
          {data:20191115, prec_mm:10.8},
          {data:20191116, prec_mm:9.6},
          {data:20191117, prec_mm:0.8},
          {data:20191118, prec_mm:0},
          {data:20191119, prec_mm:0},
          {data:20191120, prec_mm:4.2},
          {data:20191121, prec_mm:0},
          {data:20191122, prec_mm:0},
          {data:20191123, prec_mm:0},
          {data:20191124, prec_mm:2.6},
          {data:20191125, prec_mm:4.8},
          {data:20191126, prec_mm:0},
          {data:20191127, prec_mm:0},
          {data:20191128, prec_mm:0},
          {data:20191129, prec_mm:0},
          {data:20191130, prec_mm:0},
          {data:20191201, prec_mm:0},
          {data:20191202, prec_mm:26.2},
          {data:20191203, prec_mm:0.4},
          {data:20191204, prec_mm:0},
          {data:20191205, prec_mm:0},
          {data:20191206, prec_mm:0.6},
          {data:20191207, prec_mm:0},
          {data:20191208, prec_mm:0.2},
          {data:20191209, prec_mm:0.8},
          {data:20191210, prec_mm:4.8},
          {data:20191211, prec_mm:0},
          {data:20191212, prec_mm:0.4},
          {data:20191213, prec_mm:6.4},
          {data:20191214, prec_mm:3.6},
          {data:20191215, prec_mm:0},
          {data:20191216, prec_mm:0},
          {data:20191217, prec_mm:0.2},
          {data:20191218, prec_mm:0},
          {data:20191219, prec_mm:0.8},
          {data:20191220, prec_mm:0},
          {data:20191221, prec_mm:4},
          {data:20191222, prec_mm:4.6},
          {data:20191223, prec_mm:0},
          {data:20191224, prec_mm:0},
          {data:20191225, prec_mm:0},
          {data:20191226, prec_mm:0},
          {data:20191227, prec_mm:0},
          {data:20191228, prec_mm:0},
          {data:20191229, prec_mm:0},
          {data:20191230, prec_mm:0},
          {data:20191231, prec_mm:0},
          {data:20200101, prec_mm:0},
          {data:20200102, prec_mm:0},
          {data:20200103, prec_mm:0},
          {data:20200104, prec_mm:0},
          {data:20200105, prec_mm:0},
          {data:20200106, prec_mm:0},
          {data:20200107, prec_mm:0},
          {data:20200108, prec_mm:0},
          {data:20200109, prec_mm:0},
          {data:20200110, prec_mm:0},
          {data:20200111, prec_mm:0},
          {data:20200112, prec_mm:0},
          {data:20200113, prec_mm:0},
          {data:20200114, prec_mm:0},
          {data:20200115, prec_mm:0},
          {data:20200116, prec_mm:0},
          {data:20200117, prec_mm:0},
          {data:20200118, prec_mm:2.6},
          {data:20200119, prec_mm:1},
          {data:20200120, prec_mm:0},
          {data:20200121, prec_mm:0},
          {data:20200122, prec_mm:0},
          {data:20200123, prec_mm:0},
          {data:20200124, prec_mm:0.2},
          {data:20200125, prec_mm:0.4},
          {data:20200126, prec_mm:0},
          {data:20200127, prec_mm:0},
          {data:20200128, prec_mm:0},
          {data:20200129, prec_mm:0},
          {data:20200130, prec_mm:0},
          {data:20200131, prec_mm:0},
          {data:20200801, prec_mm:0},
          {data:20200802, prec_mm:0.8},
          {data:20200803, prec_mm:37},
          {data:20200804, prec_mm:42.2},
          {data:20200805, prec_mm:43.4},
          {data:20200806, prec_mm:0},
          {data:20200807, prec_mm:0},
          {data:20200808, prec_mm:0},
          {data:20200809, prec_mm:0},
          {data:20200810, prec_mm:0},
          {data:20200811, prec_mm:0},
          {data:20200812, prec_mm:0},
          {data:20200813, prec_mm:0},
          {data:20200814, prec_mm:0},
          {data:20200815, prec_mm:0},
          {data:20200816, prec_mm:0},
          {data:20200817, prec_mm:0},
          {data:20200818, prec_mm:0},
          {data:20200819, prec_mm:0},
          {data:20200820, prec_mm:0},
          {data:20200821, prec_mm:0},
          {data:20200822, prec_mm:0},
          {data:20200823, prec_mm:0},
          {data:20200824, prec_mm:0.6},
          {data:20200825, prec_mm:0},
          {data:20200826, prec_mm:0},
          {data:20200827, prec_mm:0},
          {data:20200828, prec_mm:0},
          {data:20200829, prec_mm:0},
          {data:20200830, prec_mm:15.2},
          {data:20200831, prec_mm:18.2},
          {data:20200901, prec_mm:0},
          {data:20200902, prec_mm:0},
          {data:20200903, prec_mm:0},
          {data:20200904, prec_mm:0},
          {data:20200905, prec_mm:0},
          {data:20200906, prec_mm:0},
          {data:20200907, prec_mm:0},
          {data:20200908, prec_mm:0},
          {data:20200909, prec_mm:0},
          {data:20200910, prec_mm:0},
          {data:20200911, prec_mm:0},
          {data:20200912, prec_mm:0},
          {data:20200913, prec_mm:0},
          {data:20200914, prec_mm:0},
          {data:20200915, prec_mm:0},
          {data:20200916, prec_mm:0},
          {data:20200917, prec_mm:0},
          {data:20200918, prec_mm:0},
          {data:20200919, prec_mm:0},
          {data:20200920, prec_mm:7},
          {data:20200921, prec_mm:11.8},
          {data:20200922, prec_mm:2.4},
          {data:20200923, prec_mm:7},
          {data:20200924, prec_mm:0},
          {data:20200925, prec_mm:28},
          {data:20200926, prec_mm:10.4},
          {data:20200927, prec_mm:19.2},
          {data:20200928, prec_mm:0.2},
          {data:20200929, prec_mm:0},
          {data:20200930, prec_mm:0},
          {data:20201001, prec_mm:0},
          {data:20201002, prec_mm:0},
          {data:20201003, prec_mm:2.2},
          {data:20201004, prec_mm:0},
          {data:20201005, prec_mm:0.4},
          {data:20201006, prec_mm:0},
          {data:20201007, prec_mm:0.4},
          {data:20201008, prec_mm:0},
          {data:20201009, prec_mm:0},
          {data:20201010, prec_mm:0},
          {data:20201011, prec_mm:1.4},
          {data:20201012, prec_mm:22.6},
          {data:20201013, prec_mm:0.8},
          {data:20201014, prec_mm:2.2},
          {data:20201015, prec_mm:16.6},
          {data:20201016, prec_mm:5.6},
          {data:20201017, prec_mm:0.2},
          {data:20201018, prec_mm:0},
          {data:20201019, prec_mm:0.2},
          {data:20201020, prec_mm:0},
          {data:20201021, prec_mm:0},
          {data:20201022, prec_mm:0},
          {data:20201023, prec_mm:0},
          {data:20201024, prec_mm:30.8},
          {data:20201025, prec_mm:0.4},
          {data:20201026, prec_mm:0},
          {data:20201027, prec_mm:0.8},
          {data:20201028, prec_mm:0},
          {data:20201029, prec_mm:0},
          {data:20201030, prec_mm:0},
          {data:20201031, prec_mm:0},
          {data:20201101, prec_mm:0.4},
          {data:20201102, prec_mm:0},
          {data:20201103, prec_mm:0},
          {data:20201104, prec_mm:0},
          {data:20201105, prec_mm:0},
          {data:20201106, prec_mm:0},
          {data:20201107, prec_mm:0},
          {data:20201108, prec_mm:0},
          {data:20201109, prec_mm:0.2},
          {data:20201110, prec_mm:0.2},
          {data:20201111, prec_mm:0},
          {data:20201112, prec_mm:0.4},
          {data:20201113, prec_mm:0},
          {data:20201114, prec_mm:0.2},
          {data:20201115, prec_mm:0},
          {data:20201116, prec_mm:21.6},
          {data:20201117, prec_mm:0.8},
          {data:20201118, prec_mm:0},
          {data:20201119, prec_mm:0.2},
          {data:20201120, prec_mm:15.6},
          {data:20201121, prec_mm:0},
          {data:20201122, prec_mm:0},
          {data:20201123, prec_mm:0},
          {data:20201124, prec_mm:0},
          {data:20201125, prec_mm:0},
          {data:20201126, prec_mm:0.2},
          {data:20201127, prec_mm:0},
          {data:20201128, prec_mm:0},
          {data:20201129, prec_mm:4.4},
          {data:20201130, prec_mm:0},
          {data:20201201, prec_mm:3.4},
          {data:20201202, prec_mm:13.8},
          {data:20201203, prec_mm:0},
          {data:20201204, prec_mm:0},
          {data:20201205, prec_mm:0},
          {data:20201206, prec_mm:18},
          {data:20201207, prec_mm:0.6},
          {data:20201208, prec_mm:4.6},
          {data:20201209, prec_mm:6.6},
          {data:20201210, prec_mm:0.2},
          {data:20201211, prec_mm:0},
          {data:20201212, prec_mm:0.8},
          {data:20201213, prec_mm:0},
          {data:20201214, prec_mm:0},
          {data:20201215, prec_mm:0},
          {data:20201216, prec_mm:0},
          {data:20201217, prec_mm:0},
          {data:20201218, prec_mm:0},
          {data:20201219, prec_mm:0},
          {data:20201220, prec_mm:0.2},
          {data:20201221, prec_mm:0},
          {data:20201222, prec_mm:0},
          {data:20201223, prec_mm:0},
          {data:20201224, prec_mm:1.2},
          {data:20201225, prec_mm:3.4},
          {data:20201226, prec_mm:28.8},
          {data:20201227, prec_mm:6},
          {data:20201228, prec_mm:12.8},
          {data:20201229, prec_mm:0.2},
          {data:20201230, prec_mm:1.6},
          {data:20201231, prec_mm:0},
          {data:20210101, prec_mm:0.2},
          {data:20210102, prec_mm:0},
          {data:20210103, prec_mm:10.6},
          {data:20210104, prec_mm:0},
          {data:20210105, prec_mm:0.4},
          {data:20210106, prec_mm:0},
          {data:20210107, prec_mm:0.2},
          {data:20210108, prec_mm:7.6},
          {data:20210109, prec_mm:1.4},
          {data:20210110, prec_mm:19.6},
          {data:20210111, prec_mm:0.6},
          {data:20210112, prec_mm:0},
          {data:20210113, prec_mm:0},
          {data:20210114, prec_mm:0},
          {data:20210115, prec_mm:0},
          {data:20210116, prec_mm:0},
          {data:20210117, prec_mm:1.8},
          {data:20210118, prec_mm:0.8},
          {data:20210119, prec_mm:0.2},
          {data:20210120, prec_mm:0},
          {data:20210121, prec_mm:0},
          {data:20210122, prec_mm:1.4},
          {data:20210123, prec_mm:0},
          {data:20210124, prec_mm:13},
          {data:20210125, prec_mm:5.8},
          {data:20210126, prec_mm:0.4},
          {data:20210127, prec_mm:0},
          {data:20210128, prec_mm:0},
          {data:20210129, prec_mm:0.2},
          {data:20210130, prec_mm:0.4},
          {data:20210131, prec_mm:14.2},
          {data:20210123, prec_mm:0},
          {data:20210124, prec_mm:13},
          {data:20210125, prec_mm:5.8},
          {data:20210126, prec_mm:0.4},
          {data:20210127, prec_mm:0},
          {data:20210128, prec_mm:0},
          {data:20210129, prec_mm:0.2},
          {data:20210130, prec_mm:0.4},
          {data:20210131, prec_mm:14.2}]
          
      
      var range = [];                                                                      //creo una lista vuota per i dati filtrati                   
      for (var i = 0; i < prec.length; i++) {
        if (prec[i].data >= start_numb && prec[i].data <= end_numb) {                     //filtro i dati in base al range di date definito dall'utente  
        range.push(prec[i]);                                                             //aggiungo i dati filtrati alla lista vuota
              }
        }
      print('Dati e precipitazioni in mm/d per il mese scelto',range)                      //stampo le date e i rispettivi valori di precipitazione per il mese scelto
     
      var hum = moisture_list.getInfo()
      for (var i = 0; i < moisture_list.length; i++) {
      parseInt(moisture_list[i].name)
      }
      
      print('Dati e valori di umidità [%] per il mese scelto', hum)
           
      for (var i = 0; i < range.length; i++){
      range[i].moisture = null;
      for (var j = 0; j < hum.length; j++){
       if (hum[j].name == range[i].data){
         range[i].moisture = hum[j].moisture;
          }
        }
      }

      print(range) //da sistemare
      
      //fare una lista di liste con [data,prec,moisture]
      //fare grafico combo
               
    
}});


calcolo.style().set({                                                                   //Stile pannello: Elaborazione
  fontSize: '24px',
  fontWeight: 700,
  color: '#000000',
  padding: '40px',
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
print(norm_m);

print(calcolo);
Map.addLayer(assam)



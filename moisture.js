
var point = ee.Geometry.Point([13.378546232269848, 43.54167759738692]);
var coll =ee.ImageCollection('COPERNICUS/S1_GRD') 
  .filterBounds(point) 
  .filterDate('2015-08-01','2021-02-01') 
  .select('VV','angle')
  .map(function(img){                //mask border noise
  var vv = img.select('VV')
  var mask = vv.gt(-40)
  return img.updateMask(mask)})

var linearfit=coll.select(['angle', 'VV'])
  .reduce(ee.Reducer.linearFit()); 
var beta=linearfit.select('scale');
 
var norm = function(image){ 
  var VVnorm = image.select('VV').subtract(beta.multiply(image.select('angle').subtract(40))).rename('VV_norm')
  return image.addBands(VVnorm); }; 

var VVnorm = coll.map(norm); 
var s1 = VVnorm.select(['VV_norm','angle']).map(
  function(img){return img.clip(marche)
  });

var s2 = ee.ImageCollection("COPERNICUS/S2") //s2
  .filterBounds(point) 
  .filterDate('2015-08-01','2021-02-01') 
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .map (function (img) { 
    var ndvi = img.normalizedDifference(['B5','B4']).rename('ndvi');
    return img.addBands(ndvi)})
      
var maxDiffFilter = ee.Filter.maxDifference({
  difference: 10 * 24 * 60 * 60 * 1000,  // 860,400,000ms / 86,400,000ms = 10 giorni
  leftField: 'system:time_start',
  rightField: 'system:time_start'
});

var saveBestJoin = ee.Join.saveBest({
  matchKey: 'bestImage',
  measureKey: 'timeDiff'
});

var join = saveBestJoin.apply(s1, s2, maxDiffFilter);


var plot = join.map(function(img) {
  var cat = ee.Image.cat([img, img.get('bestImage')]);
  var image = ee.Image(img)
  var mask0 = ee.Image(image.get('bestImage'));
  var mask = mask0.select('B1')
  return cat.updateMask(mask)
}).filterBounds(point)
 

var dataset = plot.map(function(img){
  var normAngle = ee.Image.constant(40);
  var cos = normAngle.cos().rename('cos');
  var Avv = ee.Image.constant(0.0950).toFloat().rename('Avv');  //baghdadi winter crop
  var Bvv = ee.Image.constant(0.5513).toFloat().rename('Bvv');  //baghdadi winter crop
  var add = ee.Image.cat([img, cos, Avv, Bvv]).select(['VV_norm','cos','Avv','Bvv','ndvi']);
  var vv_norm = add.select('VV_norm')
  var mask = vv_norm.gt(-40)
  return add.updateMask(mask)
});

//tau^2 = exp (-2*Bvv*V*sec(theta_i))
var tau = dataset.map(function (image) {
  var img = ee.Image(image)
  var num = ee.Image.constant(-2).multiply(img.select('Bvv')).multiply(img.select('ndvi'))
  var den = img.select('cos')
  var t = num.divide(den)
  var tau = t.exp().rename('tau')
  return img.addBands(tau)
  })
  
//sigma_veg = A*V*cos(theta_i)(1-tau^2)
var sigma_veg = tau.map(function(image){
  var img = ee.Image(image)
  var fin = ee.Image.constant(1).subtract(img.select('tau'))
  var v = img.select('Avv').multiply(img.select('ndvi')).multiply(img.select('cos')).multiply(fin)
  var veg = v.rename('sigma_veg')
  return img.addBands(veg)
})

//sigma tot = sigma_veg + tau^2*sigma_soil 
var sigma_soil = sigma_veg.map(function(image){
  var img = ee.Image(image)
  var num = img.select('VV_norm').subtract(img.select('sigma_veg'))
  var den = img.select('tau')
  var soil = num.divide(den).rename('sigma_soil')
  return img.addBands(soil)
});

    
var sigma_soil_tuWien = ee.ImageCollection(sigma_soil).select(['sigma_soil','VV_norm'])
var dry = sigma_soil_tuWien.select('sigma_soil').min(); 
var wett = sigma_soil_tuWien.select('sigma_soil').max(); 
var sensitivity = wett.subtract(dry); 
var SMmax=0.35; 
var SMmin=0.05;
 

var moisture =function (image){ 
  var mv = image.select('sigma_soil').subtract(dry)
           .divide(sensitivity)
  var ma = mv.multiply(SMmax-SMmin).add(SMmin)
  var max100 = ma.multiply(ee.Image.constant(100)).rename('hum_tuWien')
  return image.addBands(max100); 
  }; 
 
var ssm_tuWien = sigma_soil_tuWien.map(moisture) 
print(ssm_tuWien)

var list = ssm_tuWien.toList(20)
for(var i = 0; i < 5; i++){                                                      
var image = ee.Image(list.get(i));
Map.addLayer(image, {bands: 'hum_tuWien',min:5,max:35}, i.toString(), 0)                           
  }

var img = ee.Image(ssm_tuWien.first())

var values = img.sample({region: marche, scale: 500, numPixels:2000, geometries: true}) 

var chart_sigma_soil = ui.Chart.feature.byFeature(values,'sigma_soil','hum_tuWien')
  .setChartType('ScatterChart')
  .setOptions({ 
    pointSize: 2, 
    colors: ['black'], 
    dataOpacity: 0.5,
    width: 200, 
    height: 500, 
    titleX: 'σ soil [dB]', 
    titleY: 'Moisture [%]',
    hAxis: {viewWindow: {min: -20, max: 5}},
    vAxis: {viewWindow: {min: 0, max: 40}},
    trendlines: {
    0: {  
      type: 'linear',  
      color: 'black',
      lineDashStyle: [4, 4],
      lineWidth: 2,
      showR2: true,
      visibleInLegend: true,
    }
   },
    })

print(chart_sigma_soil)

var chart_vv = ui.Chart.feature.byFeature(values,'VV_norm','hum_tuWien')
  .setChartType('ScatterChart')
  .setOptions({ 
    pointSize: 2, 
    colors: ['black'], 
    dataOpacity: 0.5,
    width: 200, 
    height: 500, 
    titleX: 'σ norm [dB]', 
    titleY: 'Moisture [%]',
    hAxis: {viewWindow: {min: -20, max: 5}},
    vAxis: {viewWindow: {min: 0, max: 40}},
    trendlines: {
    0: {  
      type: 'linear',  
      color: 'black',
      lineDashStyle: [4, 4],
      lineWidth: 2,
      showR2: true,
      visibleInLegend: true,
    }
   },
    })

print(chart_vv)
 

var Cvv = ee.Image.constant(37.237).toFloat() //intercetta
var Dvv = ee.Image.constant(2.39).toFloat() //pendenza     


//umidità calcolata con il modello
var moisture = sigma_soil.map(function (img){
  var image = ee.Image(img)
  var hum = Cvv.add(Dvv.multiply(image.select('sigma_soil'))).rename('hum_wcm')
  return image.addBands(hum)
})


//VV calcolato con il modello
//VVwcm =sigma_veg + tau^2((sm-Cvv)/Dvv)
var VVwcm = moisture.map(function(img){
  var image = ee.Image(img)
  var moisture = image.select('hum_wcm')
  var num = moisture.subtract(Cvv)
  var den = Dvv
  var VVsoil = num.divide(den)
  var tau_soil = image.select('tau').multiply(VVsoil)
  var VVwcm = image.select('sigma_veg').add(tau_soil)
  var VVwcm = VVwcm.rename('VV_wcm')
  return image.addBands(VVwcm)
}) 

var list = moisture.toList(6);                                                   //trasformo la collezione di immaigni in una lista della lunghezza individuata prima
    
for(var i = 0; i < 5; i++){                                                      // client side loop per visualizzare le immagini nella mappa
var image = ee.Image(list.get(i));
var name = image.get('name');
Map.addLayer(image, {bands:'hum_wcm',min:5,max:35}, i.toString(), 1)                            //cambiare nome delle immagini!
}



var img2 = ee.Image(VVwcm.first())
// sample N points from the 2-band image
var values2 = img2.sample({region: marche, scale: 500, numPixels:2000, geometries: true}) 
// plot sampled features as a scatter chart
var chart_vv = ui.Chart.feature.byFeature(values2,'VV_norm','VV_wcm')
  .setChartType('ScatterChart')
  .setOptions({ 
    pointSize: 2, 
    colors: ['black'], 
    dataOpacity: 0.5,
    width: 200, 
    height: 500, 
    titleX: 'σ norm [dB]', 
    titleY: 'σ wcm [dB]',
    hAxis: {viewWindow: {min: -20, max: 5}},
    vAxis: {viewWindow: {min: -20, max: 5}},
    trendlines: {
    0: {  
      type: 'linear',  
      color: 'black',
      lineDashStyle: [4, 4],
      lineWidth: 2,
      showR2: true,
      visibleInLegend: true
    }
   },
    })

print(chart_vv)






      
/*            
var mean = function (img){                                                          //Funzione per calcolare i valori di umidità medi dell'area per ogni immagine nella collezione
  var date = ee.String(img.get('system:index'))                                          //nomino le immagini utilizzando la data in system:index
  var dateSlice = date.slice(17,32)
  var img_set = img.set('name', dateSlice)                                          //imposto il nome come proprietà dell'immagine
  var mean = img_set.select('moisture').reduceRegion({
  reducer: ee.Reducer.mean(),                                                     //applico il reducer per calcolare la media
  geometry: VEGETAZIONE2,
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
    
                                                                       //trasformo in numero e trasferisco sul client
var roi_moisture = roi_moisture.map(function (img){
  var cento = ee.Image.constant(100);
  return img.multiply(cento)})
  
  
var VVnorm = VVnorm.combine(roi_moisture)

*/

//definisco gli intervalli temporali

//intervallo 2
exports.primaMeta = function(){
  return ee.DateRange ('2020-01-01', '2020-07-02')};
exports.secondaMeta = function (){
  return ee.DateRange ('2020-07-02','2020-12-31')}; 
  
//intervallo 3
exports.un_terzo = function (){
  return ee.DateRange('2020-01-01', '2020-04-30')};
exports.due_terzi = function (){
  return ee.DateRange ('2020-04-30', '2020-08-29')};
exports.tre_terzi = function (){
  return ee.DateRange('2020-08-29', '2020-12-31')};

//intervallo 4
exports.un_quarto = function (){
  return ee.DateRange ('2020-01-01','2020-03-31')};
exports.due_quarti = function (){
  return ee.DateRange('2020-03-31','2020-06-30')};
exports.tre_quarti = function (){
  return ee.DateRange('2020-06-30','2020-09-30')};
exports.quattro_quarti = function (){
  return ee.DateRange ('2020-09-30','2020-12-31')};

//intervallo 6
exports.bimestre1 = function (){
  return ee.DateRange ('2020-01-01','2020-02-29')};
exports.bimestre2 = function (){
  return ee.DateRange ('2020-02-29','2020-04-30')};
exports.bimestre3 = function (){
  return ee.DateRange ('2020-04-30', '2020-06-30')};
exports.bimestre4 = function (){
  return ee.DateRange ('2020-06-30', '2020-08-31')};
exports.bimestre5 = function (){
  return ee.DateRange ('2020-08-31', '2020-10-31')};
exports.bimestre6 = function (){
  return ee.DateRange ('2020-10-31', '2020-12-31')};


//intervallo 12
exports.gennaio = function (){
  return ee.DateRange ('2020-01-01','2020-01-31')};
exports.febbraio = function (){
  return ee.DateRange ('2020-02-01','2020-02-29')};
exports.marzo = function (){
  return ee.DateRange ('2020-03-01','2020-03-31')};
exports.aprile = function (){
  return ee.DateRange ('2020-04-01','2020-04-30')};
exports.maggio = function (){
  return ee.DateRange ('2020-05-01','2020-05-31')};
exports.giugno = function (){
  return ee.DateRange ('2020-06-01','2020-06-30')};
exports.luglio = function (){
  return ee.DateRange ('2020-07-01','2020-07-31')};
exports.agosto = function (){
  return ee.DateRange ('2020-08-01','2020-08-31')};
exports.settembre = function (){
  return ee.DateRange ('2020-09-01','2020-09-30')};
exports.ottobre = function (){
  return ee.DateRange  ('2020-10-01','2020-10-31')};
exports.novembre = function (){
  return ee.DateRange ('2020-11-01','2020-11-30')};
exports.dicembre = function (){
  return ee.DateRange ('2020-12-01','2020-12-31')};




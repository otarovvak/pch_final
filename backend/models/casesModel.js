const mongoose = require('mongoose');


const caseSchema = new mongoose.Schema({
  case_number: { type: String, required: true },  
  дата_регистрации: { type: Date, required: true },  
  статья_ук_казахстана: { type: String, required: true },  
  решение_по_делу: { type: String, required: true },  
  краткая_фабула: { type: String, required: true },  
});


const Case = mongoose.model('Case', caseSchema, 'cases');

module.exports = Case;

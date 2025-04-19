const mongoose = require('mongoose');

const workplaceSchema = new mongoose.Schema({
  iin: { type: String, required: true },  
  workplace: { type: String, required: true },  
  bin: { type: String, required: true },  
});


const Workplace = mongoose.model('Workplace', workplaceSchema, 'work');

module.exports = Workplace;

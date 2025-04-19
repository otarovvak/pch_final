const mongoose = require('mongoose');

const iinSchema = new mongoose.Schema({
  iin: { type: String, required: true },  
  full_name: { type: String, required: true },  
});


const Iin = mongoose.models.Iin || mongoose.model('Iin', iinSchema, 'iin_fio');

module.exports = Iin;

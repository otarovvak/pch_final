const mongoose = require('mongoose');
const Counter = require('./counterModel');
const Cases = require('./casesModel');
const IinFio = require('./iinFioModel');
const Work = require('./workModel');
const Position = require('./position');  
const Region = require('./region');  


const CardSchema = new mongoose.Schema({
  registration_number: { type: String, required: true },
  creation_date: { type: Date, default: Date.now },
  case_number: { type: String, required: true },
  дата_регистрации: { type: String },  
  статья_ук_казахстана: { type: String },  
  решение_по_делу: { type: String},  
  краткая_фабула: { type: String},  
  ИИН_вызываемого: { type: String, required: true },
  ФИО_вызываемого: { type: String },
  должность_вызываемого: { type: String },
  БИН_ИИН: { type: String, required: true },
  место_работы: { type: String },
  регион: { type: String },
  планируемые_следственные_действия: { type: String, required: true },
  дата_и_время_проведения: { type: Date },
  время_ухода: { type: Date }, 
  место_проведения: { type: String },
  следователь: { type: String, required: true },
  статус_по_делу: { type: String },
  отношение_к_событию: { type: String },
  виды_следствия: { type: String },
  относится_ли_к_бизнесу: { type: String },
  ИИН_защитника: { type: String },
  ФИО_защитника: { type: String },
  БИН_ИИН_пенсионка: { type: String },
  место_работы_пенсионка: { type: String },
  обоснование: { type: String, required: true },
  результат: { type: String, required: true },
  ФИО_согласующего: { type: String },
  approval_path: [
    {
      position: { type: String, required: true },  
      name: { type: String, required: true },      
      approval_status: { type: String, required: true, enum: ['Согласовано', 'Отказано', 'Отправлено на доработку', 'Оставлено без рассмотрения'] },  
      approval_time: { type: Date, default: Date.now },  
      reason: { type: String, default: '' },
    },
  ],
  status: { type: String, enum: ['В работе', 'На согласовании', 'Согласовано', 'Отправлено на доработку', 'Оставлено без рассмотрения', 'Отказано' ], default: 'В работе' },
});

CardSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'registrationNumber' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      if (!counter || !counter.sequence_value) {
        throw new Error('Не удалось инкрементировать счетчик');
      }
      const seqNumber = String(counter.sequence_value).padStart(3, '0');
      this.registration_number = `Z-${seqNumber}`;

      const caseData = await Cases.findOne({ номер_дела: this.case_number });
      if (caseData) {
        this.дата_регистрации = caseData.дата_регистрации || '';  
        this.статья_ук_казахстана = caseData.статья_ук_казахстана || ''; 
        this.решение_по_делу = caseData.решение_по_делу || '';  
        this.краткая_фабула = caseData.краткая_фабула || '';  
      } else {
        console.log(`Данные для номера дела ${this.case_number} не найдены`);
      }

      const iinData = await IinFio.findOne({ iin: this.ИИН_вызываемого });
      if (iinData) {
        this.ФИО_вызываемого = iinData.full_name;
      }

      const searchQuery = { iin: this.БИН_ИИН }; 
      let workData = await Work.findOne(searchQuery);

      if (!workData && this.БИН_ИИН.length === 12) {
        workData = await Work.findOne({ bin: this.БИН_ИИН });
      }

      if (workData) {
        this.место_работы = workData.workplace;
      }

      next();
    } catch (error) {
      console.error('Ошибка автозаполнения данных:', error);
      next(error); 
    }
  } else {
    next();
  }
});


const Card = mongoose.model('Card', CardSchema);

module.exports = Card

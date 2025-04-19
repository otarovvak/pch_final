const cardService = require('../services/cardService');
const Counter = require('../models/counterModel');
const Card = require('../models/cardModel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');
const Cases = require('../models/casesModel');;
const fs = require('fs');
const doc = new PDFDocument();
const fontPath = path.resolve(__dirname, '../controllers/Roboto-Regular.ttf');

// Утилита для генерации корректного имени файла
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9-_\.]/g, '_');
}

// Создание карточки
const createCard = async (req, res) => {
  try {
    const investigatorName = req.user?.name;
    if (!investigatorName) {
      return res.status(400).json({ message: 'Имя следователя не найдено' });
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: 'registrationNumber' },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    const cardData = {
      ...req.body, 
      следователь: investigatorName,
      время_ухода: req.body.время_ухода || null,
    };

    const newCard = await cardService.createCard(cardData, req.user._id);
    res.status(201).json({ message: 'Карточка создана', card: newCard });
  } catch (error) {
    console.error('Ошибка создания карточки:', error);
    res.status(500).json({ message: 'Ошибка создания карточки', error: error.message });
  }
};


// Получение карточки по ID 
const getCardById = async (req, res) => {
  try {
      const card = await cardService.getCardById(req.params.id, req.user);
      res.status(200).json(card); 
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
};


// Обновление карточки
const updateCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const updatedData = req.body;
    const card = await cardService.getCardById(cardId, req.user);

    if (
      req.user.role === 'Сотрудник СУ' &&
      !['В работе', 'Отправлено на доработку'].includes(card.status)
    ) {
      return res.status(403).json({
        message: 'Редактирование разрешено только для карточек со статусами "В работе" или "Отправлено на доработку".',
      });
    }

    const updatedCard = await cardService.updateCard(cardId, updatedData);
    res.status(200).json({ message: 'Карточка успешно обновлена', card: updatedCard });
  } catch (error) {
    console.error('Ошибка обновления карточки:', error.message);
    res.status(400).json({ message: error.message });
  }
};


const approveCard = async (req, res) => {
  try {
    console.log('req.user:', req.user); 
    if (req.user.role !== 'Аналитик СД') {
      return res.status(403).json({ message: 'У вас нет доступа для согласования карточки' });
    }

    const card = await cardService.getCardById(req.params.id, req.user);
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    if (card.region !== req.user.region) {
      return res.status(403).json({ message: 'Вы не можете согласовать карточку из другого региона' });
    }
   
    const approvalData = {
      position: req.user.role,
      name: req.user.name,
      approval_status: 'Согласовано',
      reason: req.body.reason || '',  
    };

    card.approval_path.push(approvalData);
    card.status = 'Согласовано';  

    const updatedCard = await card.save();
    res.status(200).json({ message: 'Карточка успешно согласована', card: updatedCard });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Отказать карточке (меняем статус на "Отказано")
const rejectCard = async (req, res) => {
  try {
    console.log('req.user:', req.user); 
    if (req.user.role !== 'Аналитик СД') {
      return res.status(403).json({ message: 'Только Аналитик СД может отказать в карточке' });
    }

    const card = await cardService.getCardById(req.params.id, req.user);
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    const rejectionData = {
      position: req.user.role,
      name: req.user.name,
      approval_status: 'Отказано',
      reason: req.body.reason || 'Без указания причины', 
    };

    card.approval_path.push(rejectionData);
    card.status = 'Отказано';  

    const updatedCard = await card.save();
    res.status(200).json({ message: 'Карточка успешно отклонена', card: updatedCard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Отправить на доработку (меняем статус на "Отправлено на доработку")
const sendCardForRevision = async (req, res) => {
  try {
    console.log('req.user:', req.user); 
    if (req.user.role !== 'Аналитик СД') {
      return res.status(403).json({ message: 'Только Аналитик СД может отправить карточку на доработку' });
    }

    const card = await cardService.getCardById(req.params.id, req.user);
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    const revisionData = {
      position: req.user.role,
      name: req.user.name,
      approval_status: 'Отправлено на доработку',
      reason: req.body.reason || 'Без указания причины',  
    };

    card.approval_path.push(revisionData);
    card.status = 'Отправлено на доработку';  

    const updatedCard = await card.save();
    res.status(200).json({ message: 'Карточка успешно отправлена на доработку', card: updatedCard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Оставить без рассмотрения (меняем статус на "Оставлено без рассмотрения")
const leaveCardWithoutConsideration = async (req, res) => {
  try {
    console.log('req.user:', req.user); 
    if (req.user.role !== 'Аналитик СД') {
      return res.status(403).json({ message: 'Только Аналитик СД может оставить карточку без рассмотрения' });
    }

    const card = await cardService.getCardById(req.params.id, req.user);
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    const noConsiderationData = {
      position: req.user.role,
      name: req.user.name,
      approval_status: 'Оставлено без рассмотрения',
      reason: req.body.reason || 'Без указания причины', 
    };

   
    card.approval_path.push(noConsiderationData);
    card.status = 'Оставлено без рассмотрения';  

    const updatedCard = await card.save();
    res.status(200).json({ message: 'Карточка оставлена без рассмотрения', card: updatedCard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Получение всех карточек с фильтрами
const getCards = async (req, res) => {
  try {
    const { status, region, case_number } = req.query;

    const filters = {};
    if (req.user.role === 'Сотрудник СУ') {
      filters.следователь = req.user.name; 
    }

    if (status) filters.status = status;
    if (region) filters.region = region;
    if (case_number) filters.case_number = case_number;

    const cards = await cardService.getCards(filters);
    res.status(200).json(cards);
  } catch (error) {
    console.error('Ошибка получения карточек:', error.message);
    res.status(400).json({ message: error.message });
  }
};



// Создание карточки со статусом "На согласовании"
const createCardWithFixedStatus = async (req, res, cardData) => {
  try {
    const investigatorName = req.user?.name;
    if (!investigatorName) {
      return res.status(400).json({ message: 'Имя следователя не найдено' });
    }

    cardData = { ...cardData, следователь: investigatorName, status: 'На согласовании' };

    const newCard = await cardService.createCard(cardData);
    res.status(201).json({ message: 'Карточка создана со статусом "На согласовании"', card: newCard });
  } catch (error) {
    console.error('Ошибка создания карточки:', error);
    res.status(500).json({ message: 'Ошибка создания карточки', error: error.message });
  }
};

const checkCallHistory = async (req, res) => {
  try {
    const { iin } = req.params;
    const callHistory = await cardService.getCallHistoryByIin(iin);
    res.status(200).json({ callHistory });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


// Получаем данные для экспорта
async function getDataForExport(filters, user) {
  try {
    const query = {}; 
    if (filters.status) query.status = filters.status;
    if (filters.creation_date_from && filters.creation_date_to) {
      query.creation_date = {
        $gte: new Date(filters.creation_date_from),
        $lte: new Date(filters.creation_date_to),
      };
    }
    if (filters.iin) query.ИИН_вызываемого = filters.iin;
    if (filters.case_number) query.case_number = filters.case_number;
    if (filters.registration_number) query.registration_number = filters.registration_number;

    if (filters.approval_path?.[filters.approval_path.length - 1]?.name) {
      query.ФИО_согласующего = filters.approval_path[filters.approval_path.length - 1]?.name;
    }

    if (user.role === 'Сотрудник СУ') {
      query.следователь = user.name; 
    } else if (user.role === 'Аналитик СД') {
      query.регион = user.регион; 
    }

    const cards = await Card.find(query).select(
      'registration_number status регион creation_date ИИН_вызываемого case_number approval_path'
    );
    
    return cards.map((card) => ({
      registration_number: card.registration_number,
      status: card.status,
      регион: card.регион || 'Не указан', 
      creation_date: card.creation_date.toISOString().split('T')[0],
      ИИН_вызываемого: card.ИИН_вызываемого,
      case_number: card.case_number,
      ФИО_согласующего: card.approval_path?.[card.approval_path.length - 1]?.name || 'Не указано',  
    }));
  } catch (error) {
    console.error('Ошибка получения данных для экспорта:', error.message);
    throw error;
  }
}


const exportToExcel = async (req, res) => {
  try {
    const user = req.user; 
    const data = await getDataForExport(req.query, user); 

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Журнал Заключений');

    worksheet.columns = [
      { header: 'Регистрационный номер', key: 'registration_number', width: 25 },
      { header: 'Статус документа', key: 'status', width: 20 },
      { header: 'Регион', key: 'регион', width: 20 },
      { header: 'Дата создания', key: 'creation_date', width: 20 },
      { header: 'ИИН вызываемого', key: 'ИИН_вызываемого', width: 20 },
      { header: 'Номер УД', key: 'case_number', width: 20 },
      { header: 'ФИО согласующего', key: 'ФИО_согласующего', width: 25 }, 
    ];
    
    data.forEach(item => {
      worksheet.addRow(item);
    });

    const filename = sanitizeFilename('Отчет_Журнал_Заключений.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error.message);
    res.status(500).json({ message: 'Ошибка экспорта в Excel', error: error.message });
  }
};

const exportCardsToPDF = async (req, res) => {
  try {
    const user = req.user; 
    const data = await getDataForExport(req.query, user); 

    const doc = new PDFDocument();
    const fontPath = path.join(__dirname, 'Roboto-Regular.ttf');
    doc.font(fontPath);

    doc.fontSize(18).text('Журнал Заключений', { align: 'center' }).moveDown(1);

    data.forEach((card) => { 
      doc.fontSize(14).text(`Регистрационный номер: ${card.registration_number}`, { align: 'left' }).moveDown(0.5);
      doc.fontSize(12).text(`Статус документа: ${card.status}`, { align: 'left' }).moveDown(0.5);
      doc.text(`Регион: ${card.регион}`, { align: 'left' }).moveDown(0.5);
      doc.text(`Дата создания: ${card.creation_date}`, { align: 'left' }).moveDown(0.5); 
      doc.text(`ИИН вызываемого: ${card.ИИН_вызываемого}`, { align: 'left' }).moveDown(0.5);
      doc.text(`Номер УД: ${card.case_number}`, { align: 'left' }).moveDown(0.5);
      doc.text(`ФИО согласующего: ${card.ФИО_согласующего}`, { align: 'left' }).moveDown(1);
    });

    doc.end();

    const fileName = 'exported_cards.pdf';
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

  } catch (error) {
    console.error('Ошибка при экспорте в PDF:', error);
    res.status(500).json({ message: 'Не удалось экспортировать в PDF', error: error.message });
  }
};


module.exports = { 
  createCard, 
  createCardWithFixedStatus, 
  getCardById, 
  updateCard, 
  approveCard, 
  rejectCard,  
  sendCardForRevision, 
  leaveCardWithoutConsideration,
  getCards,
  checkCallHistory,
  exportToExcel,
  exportCardsToPDF
};



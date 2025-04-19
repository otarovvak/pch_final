const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cardRoutes = require("./routes/cardRoutes");
const Counter = require("./models/counterModel");

const app = express();
const PORT = process.env.PORT || 3350;

async function initializeDatabase() {
  try {
    await connectDB();
    console.log('База данных успешно подключена!');
  } catch (err) {
    console.error('Ошибка при подключении к базе данных:', err);
    process.exit(1); 
  }
}

initializeDatabase();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes); 
app.use("/api/cards", cardRoutes); 


app.get('/api/cards/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id).populate('approval_path.position');  
    console.log("Returned card:", card);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const initializeCounter = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "registrationNumber" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    console.log("Counter initialized or updated:", counter);
  } catch (error) {
    console.error("Ошибка при инициализации счетчика:", error);
  }
};

initializeCounter();

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

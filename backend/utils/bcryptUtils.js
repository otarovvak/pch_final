const bcrypt = require('bcryptjs');

// Хэширование пароля
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Сравнение пароля с хэшем
async function comparePassword(password, hashedPassword) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

module.exports = { hashPassword, comparePassword };

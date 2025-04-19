const User = require('../models/userModel');

// Обновление информации о пользователе
async function updateUser(userId, updatedData) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }

  const allowedUpdates = ['name', 'role']; 
  const updates = Object.keys(updatedData);
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    throw new Error('Некорректное поле для обновления');
  }

  updates.forEach((update) => (user[update] = updatedData[update]));

  await user.save();
  return user;
}


// Удаление пользователя
async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  return user;
}

module.exports = { updateUser, deleteUser };

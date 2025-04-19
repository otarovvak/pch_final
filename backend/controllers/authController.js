const authService = require('../services/authService');


const register = async (req, res) => {
  try {
    console.log('Received body:', req.body);
    const { email, password, name, role, регион, department } = req.body;
    const user = await authService.registerUser(email, password, name, role, регион, department);
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
  

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.status(200).json({ message: 'Авторизация успешна', user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    await authService.resetPassword(email, password);
    
    res.status(200).json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при изменении пароля', error: error.message });
  }
};


module.exports = { register, login, resetPassword };


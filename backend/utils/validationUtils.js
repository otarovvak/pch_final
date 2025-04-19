// Валидация email
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
  
  // Валидация пароля (минимум 6 символов)
  function validatePassword(password) {
    return password.length >= 6;
  }
  
  module.exports = { validateEmail, validatePassword };
  
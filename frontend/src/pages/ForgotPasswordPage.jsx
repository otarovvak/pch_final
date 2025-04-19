import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Password.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('Все поля должны быть заполнены.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Введите корректный email.');
      return false;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов.');
      return false;
    }
    return true;
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!validateForm()) return;
  
    try {
      const response = await axios.post('http://localhost:3350/api/auth/reset-password', { 
        email, 
        password: password 
      });
      setSuccessMessage('Пароль успешно обновлен.');
      setTimeout(() => navigate('/login'), 1000); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка при обновлении пароля.');
    }
  };
  

  return (
    <div className="login-container">
      <h2>Забыли пароль?</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handlePasswordReset}>
        <div className="form-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Новый пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите новый пароль"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Подтвердите новый пароль"
            required
          />
        </div>
        <button type="submit" className="login-button">
          Сбросить пароль
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;

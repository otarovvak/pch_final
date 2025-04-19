import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { regions, departments } from "../utils/data";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPerson, faEnvelope, faMapPin } from '@fortawesome/free-solid-svg-icons';
import NotificationBlock from '../components/NotificationBlock';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "Сотрудник СУ", 
    регион: regions[0]?._id || regions[0]?.name || "",  
    department: "", 
  });

  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotification(null);

    try {
      const response = await axios.post(
        "http://localhost:3350/api/auth/register",
        formData
      );
      setNotification({ severity: 'success', title: 'Регистрация успешна', message: 'Вы можете войти в систему.' });
      setTimeout(() => navigate("/login"), 3000); 
    } catch (err) {
      setError(err.response?.data?.message || "Что-то пошло не так");
    }
  };

  return (
    <div className="login-container">
      <h2>Регистрация</h2>
      {notification && <NotificationBlock {...notification} />}
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faPerson} className="input-icon" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите имя"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите email"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faPerson} className="input-icon" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faMapPin} className="input-icon" />
            <select
              id="region"
              name="регион"
              value={formData.region}
              onChange={handleChange}
              required
            >
              <option value="">Выберите регион</option>
              {regions.map((region) => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faMapPin} className="input-icon" />
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Выберите отдел</option>
              {departments.map((dept) => (
                <option key={dept.name} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <div className="input-with-icon">
            <FontAwesomeIcon icon={faPerson} className="input-icon" />
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Сотрудник СУ">Сотрудник СУ</option>
              <option value="Аналитик СД">Аналитик СД</option>
              <option value="Модератор">Модератор</option>
            </select>
          </div>
        </div>

        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default RegisterPage;

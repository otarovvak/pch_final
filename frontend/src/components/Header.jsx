import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Header.css"; 

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const tokenKey = "token";

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        try {
          const response = await axios.get(
            "http://localhost:3350/api/user/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem(tokenKey);
            setUser(null); 
          }
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(tokenKey);
    setUser(null); // Update user state immediately
    navigate("/login", { replace: true });
  };


  return (
    <header className="header">
      <nav>
        <ul className="header-ul">
          {user ? (
            <>
              <li>
                <Link to="/profile" className="profile-link">
                  <span className="profile-icon">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <span className="profile-name">
                    {user.name} {user.role}
                  </span>
                </Link>
              </li>

                <li>
                  <Link to="/create-card">Создать карту</Link>
                </li>
             

              <li>
                <Link to="/">Журнал заключений</Link>
              </li>

              <li>
                <button onClick={handleLogout}>Выйти</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import CardCreationPage from './pages/CardCreationPage';
import Cases from './pages/JournalPage';
import Header from './components/Header';
import CardDetailsPage from './pages/CardDetailsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-card" element={<CardCreationPage />} />
        <Route path="/" element={<Cases />} />
        <Route path="/card-details/:id" element={<CardDetailsPage />} /> 
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;

import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './Components/Assets/LoginSignUp/LoginSignUp';
import Login from './Components/Assets/LoginSignUp/Login';
import Dashboard from './Components/Assets/LoginSignUp/pages/dash';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Signup page */}
          <Route path="/signup" element={<SignUp />} />
          
          {/* Dashboard page */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

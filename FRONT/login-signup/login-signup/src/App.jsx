import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './Components/Assets/LoginSignUp/LoginSignUp';
import Login from './Components/Assets/LoginSignUp/Login';
import Dashboard from './Components/Assets/LoginSignUp/pages/dash';
import NetworkMonitoring from './Components/Assets/LoginSignUp/pages/networkmonitoring';
import Notifications from './Components/Assets/LoginSignUp/pages/notifications';  // ← ADD THIS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/network" element={<NetworkMonitoring />} />
        <Route path="/notifications" element={<Notifications />} />  {/* ← ADD THIS */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
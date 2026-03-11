import './App.css';
// 1. Updated imports: Switch is now Routes, Redirect is now Navigate
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './Components/Assets/LoginSignUp/LoginSignUp';
import Login from './Components/Assets/LoginSignUp/Login';
import Dashboard from './Components/Assets/LoginSignUp/pages/dash';
import NetworkMonitoring from './Components/Assets/LoginSignUp/pages/networkmonitoring';


function App() {
  return (
    <Router>
      {/* 3. Switch is replaced with Routes */}
      <Routes>
        
        {/* Default route - redirect to login using Navigate */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login page: Route now uses 'element' prop */}
        <Route path="/login" element={<Login />} />
        
        {/* Signup page */}
        <Route path="/signup" element={<SignUp />} />
        
        {/* Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Trunk Details page */}
        
        {/* Network Monitoring page */}
        <Route path="/network" element={<NetworkMonitoring />} />
        
        {/* Catch all - redirect any unknown path to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;
import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import SignUp from './Components/Assets/LoginSignUp/LoginSignUp';
import Login from './Components/Assets/LoginSignUp/Login';
import Dashboard from './Components/Assets/Dashboard/Dashboard';
import TrunkDetails from './Components/Assets/TrunkDetails/TrunkDetails';
import NetworkMonitoring from './Components/Assets/NetworkMonitoring/NetworkMonitoring';

function App() {
  return (
    <Router>
      <Switch>
        {/* Default route - redirect to login */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        
        {/* Login page */}
        <Route path="/login">
          <Login />
        </Route>
        
        {/* Signup page */}
        <Route path="/signup">
          <SignUp />
        </Route>
        
        {/* Dashboard page */}
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        
        {/* Trunk Details page */}
        <Route path="/trunk/:trunkId">
          <TrunkDetails />
        </Route>
        
        {/* Network Monitoring page */}
        <Route path="/network">
          <NetworkMonitoring />
        </Route>
        
        {/* Catch all - redirect to login */}
        <Route path="*">
          <Redirect to="/login" />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

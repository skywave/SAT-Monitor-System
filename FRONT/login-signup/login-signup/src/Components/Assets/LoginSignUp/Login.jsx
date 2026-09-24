import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#f4f6f9] text-slate-900 px-4">
      {/* Status indicator */}
      <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">System Online</span>
      </div>

      {/* Main login card */}
      <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-2xl p-10 relative z-10 shadow-xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">SAT Monitor</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">System Administration</p>
            </div>
          </div>
          <div className="text-xs text-blue-600 font-bold uppercase tracking-wider pl-[4rem]">Skywave Technologies</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Access System'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <button className="text-blue-600 font-bold text-xs uppercase tracking-wider hover:underline" onClick={handleSwitchToSignup}>
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;

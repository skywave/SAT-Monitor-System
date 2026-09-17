import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    }, 1500);
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
    <div className="min-h-screen flex items-center justify-center relative bg-[#0a0a0f] text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-[20%] w-full h-[1px] bg-gradient-to-r from-transparent via-amethyst-primary to-transparent"></div>
        <div className="absolute top-[50%] w-full h-[1px] bg-gradient-to-r from-transparent via-amethyst-primary to-transparent"></div>
        <div className="absolute top-[80%] w-full h-[1px] bg-gradient-to-r from-transparent via-amethyst-primary to-transparent"></div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-[#16161d]/80 border border-[#2d2d3a] rounded-full backdrop-blur-sm">
        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
        <span className="text-xs text-[#9999ab] uppercase tracking-wider">System Online</span>
      </div>

      {/* Main login card */}
      <div className="w-full max-w-[440px] bg-[#16161d] border border-[#2d2d3a] rounded-2xl p-10 relative z-10 shadow-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amethyst-primary to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">SAT Monitor</h1>
              <p className="text-[10px] text-[#9999ab] uppercase tracking-[0.08em]">System Administration & Trunk Monitoring</p>
            </div>
          </div>
          <div className="text-sm text-amethyst-primary font-bold pl-[4rem]">Skywave Technologies</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#9999ab] uppercase tracking-widest">Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full p-3 bg-[#0a0a0f] border border-[#2d2d3a] rounded-lg text-[15px] focus:outline-none focus:border-amethyst-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#9999ab] uppercase tracking-widest">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full p-3 bg-[#0a0a0f] border border-[#2d2d3a] rounded-lg text-[15px] focus:outline-none focus:border-amethyst-primary"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-br from-amethyst-primary to-purple-800 rounded-lg text-[14px] font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Access System'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#2d2d3a] text-center">
          <button className="text-amethyst-primary font-bold text-xs uppercase" onClick={handleSwitchToSignup}>
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;

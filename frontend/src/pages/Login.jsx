import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, ArrowRight, ShieldCheck, Mail, User, ShieldAlert } from 'lucide-react';
import { Toast } from '../components/Toast';

export default function Login() {
  const { login, registerTOTP } = useAuth();
  const navigate = useNavigate();

  // Authentication State
  const [isRegistering, setIsRegistering] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: Input email, 2: Show QR & verify
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('staff');
  
  // TOTP Code Inputs (6 separate digits)
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Setup / Register Info
  const [registrationData, setRegistrationData] = useState(null);

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  // Handles input changes in the 6 digit code boxes
  const handleCodeChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handles backspace keypress in digit inputs
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Submit passwordless Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const joinedCode = code.join('');
    if (!email) {
      triggerToast('Please provide your email address', 'error');
      return;
    }
    if (joinedCode.length < 6) {
      triggerToast('Please enter the complete 6-digit TOTP verification code', 'error');
      return;
    }

    const result = await login(email, joinedCode);
    if (result.success) {
      triggerToast('Access granted. Welcome back!', 'success');
      // Redirect based on role
      setTimeout(() => {
        if (result.user.role === 'admin') {
          navigate('/');
        } else {
          navigate('/workspace');
        }
      }, 800);
    } else {
      triggerToast(result.error, 'error');
    }
  };

  // Submit initial Registration step
  const handleRegisterInit = async (e) => {
    e.preventDefault();
    if (!email) {
      triggerToast('Email address is required', 'error');
      return;
    }
    const result = await registerTOTP(email, fullName, role);
    if (result.success) {
      setRegistrationData(result.data);
      setSetupStep(2);
      triggerToast('TOTP security key generated successfully', 'success');
    } else {
      triggerToast(result.error, 'error');
    }
  };

  // Submit TOTP Verification to complete setup and login
  const handleSetupVerify = async (e) => {
    e.preventDefault();
    const joinedCode = code.join('');
    if (joinedCode.length < 6) {
      triggerToast('Please enter the 6-digit verification code to complete setup', 'error');
      return;
    }

    const result = await login(email, joinedCode);
    if (result.success) {
      triggerToast('Device successfully authenticated! Setup complete.', 'success');
      setTimeout(() => {
        if (result.user.role === 'admin') {
          navigate('/');
        } else {
          navigate('/workspace');
        }
      }, 800);
    } else {
      triggerToast(result.error, 'error');
    }
  };

  const handleResetMode = () => {
    setIsRegistering(false);
    setSetupStep(1);
    setRegistrationData(null);
    setEmail('');
    setFullName('');
    setRole('staff');
    setCode(['', '', '', '', '', '']);
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Left Column: Branding / Marketing */}
      <div className="w-1/2 bg-gradient-to-br from-[#0f172a] via-[#0d1527] to-[#1e1b4b] border-r border-slate-800/60 p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        
        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-wide">Enterprise IMS</h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Bhartiya Abhilekhan</p>
          </div>
        </div>

        {/* Central Slogan */}
        <div className="space-y-6 max-w-lg relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight leading-none text-white font-sans">
            Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Inventory Flow.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Access our high-precision operational suite designed for global logistics. Secure your workstation with two-factor authentication to ensure data integrity and chain of command.
          </p>
          
          {/* Throughput Widget */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 glow-blue">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span className="uppercase tracking-widest text-[10px] text-blue-400">GLOBAL THROUGHPUT</span>
              <span className="text-emerald-400 flex items-center gap-1">
                99.98%
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full w-[99.98%] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="text-xs text-slate-500 font-medium relative z-10 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          Secure Enterprise Authentication Shield Enabled
        </div>
      </div>

      {/* Right Column: Dynamic Passcode Panel */}
      <div className="w-1/2 flex items-center justify-center p-16 bg-[#0b0f19] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_400px,#1e293b,transparent_80%)] opacity-30 pointer-events-none"></div>
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
          
          {/* Mode 1: Register - Step 1: User Profile Setup */}
          {isRegistering && setupStep === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Configure Account</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Set up passwordless authenticator access</p>

              <form onSubmit={handleRegisterInit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. employee@bhartiya.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Administrative Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="staff">Staff Operator (Worksheets, Orders)</option>
                    <option value="admin">System Admin (Full CRUD access)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 mt-2 transition-all"
                >
                  Configure Security Keys
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 border-t border-slate-800/80 pt-6 text-center">
                <button
                  onClick={handleResetMode}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  Already configured? Login Here
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Register - Step 2: Display Secret QR & Verify */}
          {isRegistering && setupStep === 2 && registrationData && (
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Authenticator Link</h2>
              <p className="text-xs text-slate-400 mt-1">Scan or manually enter the keys below into Google Authenticator.</p>

              <div className="my-5 flex flex-col items-center justify-center p-4 bg-white rounded-xl">
                {/* Dynamically build QR Code using public qrserver API */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(registrationData.provisioning_uri)}`}
                  alt="Google Authenticator QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center mb-6">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Manual Entry Secret Key</span>
                <span className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase selection:bg-blue-600">
                  {registrationData.secret.match(/.{1,4}/g).join(' ')}
                </span>
              </div>

              <form onSubmit={handleSetupVerify} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">Enter 6-Digit TOTP Verification Code</label>
                  
                  {/* Digit inputs */}
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-12 text-center text-lg font-bold bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 mt-2 transition-all"
                >
                  Verify Device & Login
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResetMode}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-bold"
                >
                  Cancel and Return
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Default passwordless LOGIN */}
          {!isRegistering && (
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your 6-digit Google Authenticator code.</p>

              <form onSubmit={handleLoginSubmit} className="space-y-5 mt-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. employee@bhartiya.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Authentication Code</label>
                  
                  {/* Digit inputs */}
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-12 text-center text-lg font-bold bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 mt-4 transition-all"
                >
                  Verify & Login
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  First time?{' '}
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors ml-1"
                  >
                    Setup Authenticator Device
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Compliance Info */}
          <div className="mt-6 flex justify-center items-center gap-1.5 text-[10px] text-slate-500 font-medium border-t border-slate-800/40 pt-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            PCI-DSS & SOC2 Compliant Environment
          </div>
        </div>
      </div>
    </div>
  );
}

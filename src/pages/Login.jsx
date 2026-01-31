import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Acceso Administrador</h2>
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 mb-4 bg-slate-800 rounded-lg text-white border border-slate-700"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-3 mb-6 bg-slate-800 rounded-lg text-white border border-slate-700"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-500 transition">
          Entrar al Sistema
        </button>
      </form>
    </div>
  );
}
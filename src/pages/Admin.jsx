import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // --- ESTADOS ---
  // El estado de mensajes debe ir DENTRO del componente
  const [messages, setMessages] = useState([]); 
  
  // Estados del Formulario
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [techs, setTechs] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  // --- EFECTO 1: Verificar Autenticación ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
      }
    });
  }, [navigate]);

  // --- EFECTO 2: Cargar Mensajes (Solo si hay sesión) ---
  useEffect(() => {
    if (session) {
      const fetchMessages = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) setMessages(data);
      };
      fetchMessages();
    }
  }, [session]);

  // --- HANDLER: Subir Proyecto ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        // 1. Subir a Storage
        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // 2. Obtener URL
        const { data } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
        
        imageUrl = data.publicUrl;
      }

      // 3. Insertar en DB
      const { error } = await supabase.from('projects').insert([
        { 
          title, 
          description: desc, 
          tech_stack: techs.split(',').map(t => t.trim()),
          image_url: imageUrl 
        }
      ]);

      if (error) throw error;

      alert("🚀 Proyecto publicado con éxito");
      // Limpiar estados
      setTitle(''); setDesc(''); setTechs(''); setImageFile(null);
      e.target.reset(); 

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Si no hay sesión, no renderizamos nada (o un loading)
  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-slate-500 hover:text-red-400 transition text-sm font-mono"
          >
            [ LOGOUT ]
          </button>
        </div>

        {/* FORMULARIO DE PROYECTOS */}
        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Nombre del Proyecto</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: E-commerce Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Descripción Corta</label>
            <textarea 
              required value={desc} onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 h-28 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="¿Qué hace este sistema?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Tecnologías (separar por comas)</label>
            <input 
              type="text" required value={techs} onChange={(e) => setTechs(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="React, Tailwind, Supabase..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Imagen de Portada</label>
            <input 
              type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          <button 
            type="submit" disabled={uploading}
            className={`w-full py-4 rounded-xl font-bold transition-all ${uploading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
          >
            {uploading ? 'Procesando Sistema...' : 'Publicar en el Portal'}
          </button>
        </form>

        {/* LISTA DE MENSAJES (LEADS) */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Bandeja de Entrada (Leads)
          </h2>
          
          {messages.length === 0 ? (
            <p className="text-slate-500 italic">No hay mensajes nuevos aún.</p>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-600 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{msg.name}</h3>
                    <span className="text-emerald-400 font-mono text-sm">
                      ${msg.estimated_budget}
                    </span>
                  </div>
                  <p className="text-blue-400 text-sm mb-3">{msg.email}</p>
                  <p className="text-slate-400 text-sm italic">"{msg.message}"</p>
                  <div className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest">
                    Recibido: {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
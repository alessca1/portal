import { useState, useEffect, useRef } from 'react'; // <--- Agregamos useRef
import { supabase } from './lib/supabaseClient';

// --- SUB-COMPONENTE: Tarjeta de Proyecto ---
const ProjectCard = ({ project }) => (
  <div className="group rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300">
    <div className="h-52 w-full overflow-hidden bg-slate-800 relative">
      {project.image_url ? (
        <img 
          src={project.image_url} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs text-center p-4">
          NO_PREVIEW_AVAILABLE.SYS
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-60"></div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {project.title}
      </h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tech_stack?.map((tech) => (
          <span key={tech} className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {tech}
          </span>
        ))}
      </div>
    </div>
  </div>
);

function App() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario
  const [contactData, setContactData] = useState({ name: '', email: '', note: '' });
  const [sending, setSending] = useState(false);

  // Referencia para el scroll automático
  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      const { data: sData } = await supabase.from('services').select('*');
      if (pData) setProjects(pData);
      if (sData) setServices(sData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleContact = async (e) => {
    e.preventDefault();
    setSending(true);
    
    const { error } = await supabase.from('messages').insert([
      { 
        name: contactData.name, 
        email: contactData.email, 
        message: contactData.note,
        estimated_budget: totalPrice 
      }
    ]);

    if (error) alert("Error al enviar: " + error.message);
    else {
      alert("¡Mensaje enviado! Te contactaré pronto.");
      setContactData({ name: '', email: '', note: '' });
    }
    setSending(false);
  };

  const toggleService = (service) => {
    setSelectedServices(prev => 
      prev.find(s => s.id === service.id) 
        ? prev.filter(s => s.id !== service.id) 
        : [...prev, service]
    );
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalPrice = selectedServices.reduce((acc, curr) => acc + curr.base_price, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      
      {/* HEADER / NAV */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-slate-800/50 bg-[#020617]/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <span className="text-lg font-black tracking-tighter text-blue-500">SYSTEMS.DEV</span>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
            <a href="#proyectos" className="hover:text-white transition">Portfolio</a>
            <a href="#cotizador" className="hover:text-white transition">Precios</a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        
        {/* HERO */}
        <section className="mb-32 text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            Build <span className="text-blue-600 italic">Better.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed">
            Desarrollador de sistemas full-stack enfocado en rendimiento y soluciones escalables.
          </p>
        </section>

        {/* PROJECTS GRID */}
        <section id="proyectos" className="mb-40">
          <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em] mb-12">Proyectos Recientes</h2>
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1,2,3].map(n => <div key={n} className="h-80 bg-slate-900 rounded-2xl"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </section>

        {/* PRICING CALCULATOR */}
        <section id="cotizador" className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 md:p-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-4">¿Tienes una idea?</h2>
            <p className="text-slate-400 mb-10">Selecciona los módulos básicos para tu sistema y obtén un presupuesto base.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleService(s)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedServices.includes(s) 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold">{s.name}</div>
                  <div className="text-xs opacity-60">${s.base_price}</div>
                </button>
              ))}
            </div>

            <div className="flex items-end gap-6">
              <div>
                <div className="text-[10px] font-black uppercase text-blue-500 mb-1 tracking-widest">Inversión Estimada</div>
                <div className="text-6xl font-black">${totalPrice}</div>
              </div>
              <button 
                onClick={scrollToForm}
                className="hidden md:block mb-2 bg-white text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-400 transition-colors"
              >
                Contactar Ahora
              </button>
            </div>
          </div>

          {/* FORMULARIO DE CONTACTO */}
          <form ref={formRef} onSubmit={handleContact} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-10 scroll-mt-24">
            <input 
              type="text" placeholder="Tu Nombre" required
              value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
            />
            <input 
              type="email" placeholder="tu@email.com" required
              value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
            />
            <textarea 
              placeholder="Cuéntame brevemente sobre tu proyecto..." 
              className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-24"
              value={contactData.note} onChange={e => setContactData({...contactData, note: e.target.value})}
            ></textarea>
            <button 
              disabled={sending}
              className="md:col-span-2 bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
            >
              {sending ? 'Enviando...' : `Solicitar Sistema por $${totalPrice}`}
            </button>
          </form>

        </section>

      </main>

      <footer className="p-10 text-center text-[10px] uppercase tracking-[0.5em] text-slate-600 border-t border-slate-900">
        Dev_Sistemas // 2026
      </footer>
    </div>
  );
}

export default App;
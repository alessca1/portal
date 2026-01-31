import {    useEffect, useState  } from 'react' 
import { supabase } from '../lib/supabaseClient';

export default function ProjectGrid() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function getProjects() {
      const { data } = await supabase.from('projects').select('*');
      if (data) setProjects(data);
    }
    getProjects();
  }, []);
  return (
    <div id="proyectos" className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {projects.map((project) => (
        <div key={project.id} className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400">{project.title}</h3>
          <p className="text-slate-400 mb-4">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack?.map(tech => (
              <span key={tech} className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
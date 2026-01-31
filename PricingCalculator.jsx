import { useState, useEffect } from 'react';

const PricingCalculator = ({ services }) => {
  const [selected, setSelected] = useState([]);
  const [total, setTotal] = useState(0);

  const toggleService = (service) => {
    if (selected.find(s => s.id === service.id)) {
      setSelected(selected.filter(s => s.id !== service.id));
    } else {
      setSelected([...selected, service]);
    }
  };

  useEffect(() => {
    const sum = selected.reduce((acc, curr) => acc + curr.base_price, 0);
    setTotal(sum);
  }, [selected]);

  return (
    <div className="p-8 bg-gray-900 text-white rounded-xl border border-blue-500/30">
      <h3 className="text-2xl font-bold mb-4">Cotiza tu Sistema</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <button 
            key={service.id}
            onClick={() => toggleService(service)}
            className={`p-4 border rounded-lg transition ${selected.includes(service) ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-700'}`}
          >
            {service.name} - ${service.base_price}
          </button>
        ))}
      </div>
      <div className="mt-8 text-right">
        <p className="text-gray-400">Presupuesto Estimado:</p>
        <span className="text-4xl font-black text-blue-400">${total}</span>
      </div>
    </div>
  );
};
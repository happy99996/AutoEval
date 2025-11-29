import React, { useState } from 'react';
import { VehicleData } from '../types';
import { ArrowRight } from 'lucide-react';

interface Props {
  onAnalyze: (data: VehicleData) => void;
  isLoading: boolean;
}

const VehicleInput: React.FC<Props> = ({ onAnalyze, isLoading }) => {
  const [formData, setFormData] = useState<VehicleData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0, 
    price: 0,
    currency: 'EUR',
    fuelType: 'Petrol'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value
    }));
  };

  // Modern Minimal Input Style
  const inputContainerClass = "relative group";
  const labelClass = "block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 group-focus-within:text-white transition-colors duration-300";
  const inputClass = "w-full bg-transparent border-b border-zinc-800 py-3 text-lg md:text-xl font-light text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all duration-300";

  return (
    <div className={`transition-all duration-700 ${isLoading ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>
      
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
            
            <div className={inputContainerClass}>
              <label className={labelClass}>Manufacturer</label>
              <input
                required
                type="text"
                name="make"
                placeholder="Porsche"
                value={formData.make}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>Model</label>
              <input
                required
                type="text"
                name="model"
                placeholder="911 Carrera"
                value={formData.model}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>Year</label>
               <input
                required
                type="number"
                name="year"
                min="1950"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>Powertrain</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer appearance-none rounded-none`}
              >
                <option value="Petrol" className="bg-black text-zinc-400">Petrol</option>
                <option value="Diesel" className="bg-black text-zinc-400">Diesel</option>
                <option value="Hybrid" className="bg-black text-zinc-400">Hybrid</option>
                <option value="Electric" className="bg-black text-zinc-400">Electric</option>
                <option value="LPG" className="bg-black text-zinc-400">LPG</option>
              </select>
            </div>
        </div>

        <div className="mt-12 flex justify-center md:justify-start">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative inline-flex items-center gap-4 px-8 py-3 bg-white text-black rounded-full font-medium transition-all hover:pr-10 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:pr-8"
            >
              <span className="tracking-tight">Run Analysis</span>
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                 <ArrowRight size={12} strokeWidth={3} />
              </div>
            </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleInput;
import React, { useState } from 'react';
import { VehicleData } from '../types';
import { ArrowRight, Search } from 'lucide-react';

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

  // Minimalist Input Style
  const inputContainerClass = "group bg-background rounded-xl px-4 py-3 border border-zinc-800 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600 transition-all duration-200";
  const labelClass = "block text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5 group-focus-within:text-primary transition-colors";
  const inputClass = "w-full bg-transparent border-none p-0 text-white font-medium focus:ring-0 placeholder-zinc-700";

  return (
    <div className={`bg-surface border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-700 ${isLoading ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className={inputContainerClass}>
              <label className={labelClass}>Manufacturer</label>
              <input
                required
                type="text"
                name="make"
                placeholder="e.g. Porsche"
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
                placeholder="e.g. 911 Carrera"
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
                className={`${inputClass} cursor-pointer appearance-none`}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="LPG">LPG</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-white/5"
            >
              Run Analysis
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleInput;
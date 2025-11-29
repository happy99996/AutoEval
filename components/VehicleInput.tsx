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
    mileage: 0, // Default to 0 as it's no longer an input
    price: 0,   // Default to 0 as it's no longer an input
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

  const inputClasses = "w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-gray-600";
  const labelClasses = "block text-secondary text-xs font-bold uppercase tracking-wider mb-2 ml-1";

  return (
    <div className={`glass-card rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-500 ${isLoading ? 'opacity-50 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
           <Search className="text-primary" size={20} />
           <span className="text-lg font-display font-semibold text-white">General Model Evaluation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div>
            <label className={labelClasses}>Manufacturer</label>
            <input
              required
              type="text"
              name="make"
              placeholder="e.g. Audi"
              value={formData.make}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Model</label>
            <input
              required
              type="text"
              name="model"
              placeholder="e.g. A4 Avant"
              value={formData.model}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Year</label>
             <input
              required
              type="number"
              name="year"
              min="1950"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Fuel Type</label>
            <div className="relative">
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="LPG">LPG</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
          >
            Start Analysis
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleInput;
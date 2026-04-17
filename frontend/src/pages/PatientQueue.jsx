import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import axios from 'axios';
import { UserPlus, Bot, CheckCircle, Loader2 } from 'lucide-react';
import classNames from 'classnames';

const PatientQueue = () => {
  const { patients, resources } = useStore();
  const [formData, setFormData] = useState({ name: '', age: '', symptoms: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5001/api/patients', formData);
      setFormData({ name: '', age: '', symptoms: '' });
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleAllocate = async (patientId, resourceId) => {
    if (!resourceId) return alert('Select a resource');
    try {
      await axios.post('http://localhost:5001/api/patients/allocate', { patientId, resourceId });
    } catch (err) {
      alert(err.response?.data?.message || 'Error allocating resource');
    }
  };

  const getRecommendedResource = (patient) => {
    const available = resources.filter(r => r.availableQuantity > 0);
    if (available.length === 0) return "";
    if (patient.priority === 'Critical' || patient.priority === 'Emergency') {
      const icu = available.find(r => r.name.toLowerCase().includes('icu'));
      if (icu) return icu._id;
    }
    const bed = available.find(r => r.name.toLowerCase().includes('bed') && !r.name.toLowerCase().includes('icu'));
    if (bed) return bed._id;
    return available[0]._id;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div className="lg:col-span-1 border-r border-slate-200 pr-0 lg:pr-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <UserPlus className="h-5 w-5 mr-2 text-hospital-primary" /> Patient Intake
        </h2>
        <form onSubmit={handleCreatePatient} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
            <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms (Detailed)</label>
            <textarea rows="4" value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="Describe symptoms for AI triage..." required />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-hospital-primary text-white py-2 rounded-md flex justify-center items-center font-medium disabled:opacity-75 disabled:cursor-not-allowed transition">
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                <span className="animate-pulse">Analyzing with Gemma 4...</span>
              </>
            ) : 'Submit & Triage'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          Queue & Allocations
        </h2>
        <div className="space-y-4">
          {patients.filter(p => p.status === 'Waiting').map(p => (
            <div key={p._id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-lg">{p.name} <span className="text-sm font-normal text-slate-500">({p.age}y)</span></h3>
                  <span className={classNames(
                    "px-2 py-0.5 rounded text-xs font-bold uppercase",
                    p.priority === 'Critical' ? 'bg-red-100 text-red-700' : 
                    p.priority === 'Emergency' ? 'bg-orange-100 text-orange-700' :
                    p.priority === 'Urgent' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  )}>
                    {p.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{p.symptoms}</p>
                <div className="bg-blue-50 p-3 rounded-lg flex items-start text-sm text-blue-800">
                  <Bot className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">AI Reasoning: </span>
                    {p.aiAnalysis?.reasoning}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg w-full md:w-64 shrink-0 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Allocate Resource</p>
                <select id={`select-${p._id}`} defaultValue={getRecommendedResource(p)} className="w-full mb-2 p-2 border rounded text-sm bg-white">
                  <option value="">-- Select Resource --</option>
                  {resources.filter(r => r.availableQuantity > 0).map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.availableQuantity} left)</option>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    const sel = document.getElementById(`select-${p._id}`);
                    handleAllocate(p._id, sel.value);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-sm font-medium transition flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Allocate
                </button>
              </div>
            </div>
          ))}
          {patients.filter(p => p.status === 'Waiting').length === 0 && (
            <div className="text-slate-500 italic p-4 text-center bg-white rounded-xl shadow-sm border border-slate-100">
              No patients in the waiting queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;

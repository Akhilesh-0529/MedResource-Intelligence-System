import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import api from '../utils/api';
import { UserPlus, Bot, CheckCircle, Loader2, Mic, Image as ImageIcon, X } from 'lucide-react';
import classNames from 'classnames';

const createClientId = () =>
  `client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const PatientQueue = () => {
  const { patients, resources, isOnline, addOptimisticPatient, allocateOptimisticResource } = useStore();
  const [formData, setFormData] = useState({ name: '', age: '', symptoms: '', imageData: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleAudioRecord = (e) => {
    e.preventDefault();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support Speech Recognition.");
    
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({...prev, symptoms: prev.symptoms + (prev.symptoms ? ' ' : '') + transcript}));
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({...prev, imageData: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const requestPayload = { ...formData, clientId: createClientId() };

    try {
      const res = await api.post('/api/patients', requestPayload);
      if (res.data?.isOffline) {
        addOptimisticPatient({
          ...requestPayload,
          ...res.data,
          status: 'Waiting',
          priority: 'Pending Sync',
          aiAnalysis: { reasoning: 'AI Triage pending successful sync...' }
        });
      }
      setFormData({ name: '', age: '', symptoms: '', imageData: '' });
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleAllocate = async (patientId, resourceId) => {
    if (!resourceId) return alert('Select a resource');
    try {
      const res = await api.post('/api/patients/allocate', { patientId, resourceId });
      if (res.data?.isOffline) {
        allocateOptimisticResource(patientId, resourceId);
      }
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
    <div className="flex flex-col gap-6">
      {!isOnline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                You are currently offline. Changes are saved locally and will sync automatically when reconnected.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
            <div className="flex items-center gap-2 mt-2">
              <button 
                type="button" 
                onClick={handleAudioRecord} 
                className={classNames("flex items-center px-3 py-1.5 rounded text-sm font-medium transition", isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
              >
                <Mic className="h-4 w-4 mr-1.5" /> {isListening ? 'Listening...' : 'Record Voice'}
              </button>
              <label className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-sm font-medium transition cursor-pointer">
                <ImageIcon className="h-4 w-4 mr-1.5" /> Attach Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {imagePreview && (
              <div className="mt-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded border border-slate-200 shadow-sm" />
                <button 
                  type="button" 
                  onClick={() => { setImagePreview(null); setFormData(p => ({...p, imageData: ''})); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
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
                    p.priority === 'Urgent' ? 'bg-yellow-100 text-yellow-700' : 
                    p.priority === 'Pending Sync' ? 'bg-slate-200 text-slate-700 border border-slate-300' : 'bg-green-100 text-green-700'
                  )}>
                    {p.priority} {p.priority === 'Pending Sync' && '☁️'}
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
  </div>
  );
};

export default PatientQueue;

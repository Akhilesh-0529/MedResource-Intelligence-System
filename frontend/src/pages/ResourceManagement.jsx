import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import axios from 'axios';
import { Plus } from 'lucide-react';

const ResourceManagement = () => {
  const { resources } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Bed', department: '', totalQuantity: 1 });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/resources', formData);
      setShowForm(false);
      setFormData({ name: '', type: 'Bed', department: '', totalQuantity: 1 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resource Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-hospital-primary text-white px-4 py-2 rounded-md flex items-center text-sm font-medium hover:bg-hospital-secondary transition"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Resource
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
          <h2 className="text-lg font-bold mb-4">New Resource</h2>
          <form onSubmit={handleAdd} className="flex space-x-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option>Bed</option><option>Equipment</option><option>Lab</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
              <input type="number" min="1" value={formData.totalQuantity} onChange={e => setFormData({...formData, totalQuantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded" required />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700">Save</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Availability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {resources.map(r => (
              <tr key={r._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.availableQuantity} / {r.totalQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${r.status === 'Available' ? 'bg-green-100 text-green-800' : 
                      r.status === 'Low' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceManagement;

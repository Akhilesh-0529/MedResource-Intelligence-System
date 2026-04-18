import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import api from '../utils/api';
import { Search, Filter, FileText, UserCircle, Clock, CheckCircle, Activity, Bot, Trash2, Image as ImageIcon } from 'lucide-react';
import classNames from 'classnames';

const PatientRecords = () => {
  const { patients } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) return;
    
    setIsDeleting(patientId);
    try {
      await api.delete(`/api/patients/${patientId}`);
    } catch (err) {
      console.error("Failed to delete patient", err);
      alert(err.response?.data?.message || 'Error deleting patient record');
    }
    setIsDeleting(null);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [patients, searchTerm, statusFilter, priorityFilter]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Emergency': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Allocated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Treatment': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Discharged': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-hospital-primary" />
            Patient Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">Comprehensive view of all patient data and history.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hospital-primary/50"
          />
        </div>
        <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <div className="relative shrink-0">
            <Filter className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hospital-primary/50 appearance-none bg-white text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="Allocated">Allocated</option>
              <option value="In Treatment">In Treatment</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
          <div className="relative shrink-0">
            <Activity className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hospital-primary/50 appearance-none bg-white text-sm"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Emergency">Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Symptoms & AI Analysis</th>
                <th className="px-6 py-4">Status & Priority</th>
                <th className="px-6 py-4">Resources Allocated</th>
                <th className="px-6 py-4">Admitted</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start">
                        {patient.imageData ? (
                          <img src={patient.imageData} alt="Patient" className="h-10 w-10 object-cover rounded border border-slate-200 shadow-sm mr-3 shrink-0" />
                        ) : (
                          <UserCircle className="h-10 w-10 text-slate-300 mr-3 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{patient.name}</div>
                          <div className="text-xs text-slate-500">{patient.age} years old</div>
                          <div className="text-xs text-slate-400 mt-0.5" title={patient._id}>ID: ...{patient._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-xs">
                      <p className="line-clamp-2 text-slate-700 mb-2" title={patient.symptoms}>
                        {patient.symptoms}
                      </p>
                      {patient.aiAnalysis?.reasoning && (
                        <div className="bg-blue-50/50 p-2 rounded border border-blue-100 flex items-start text-xs text-blue-800">
                          <Bot className="h-3 w-3 mr-1.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2" title={patient.aiAnalysis.reasoning}>
                            {patient.aiAnalysis.reasoning}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={classNames("px-2.5 py-1 rounded-full text-xs font-semibold border", getStatusColor(patient.status))}>
                          {patient.status}
                        </span>
                        <span className={classNames("px-2.5 py-1 rounded-full text-xs font-semibold border", getPriorityColor(patient.priority))}>
                          {patient.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {patient.allocatedResources && patient.allocatedResources.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {patient.allocatedResources.map((allocation, idx) => (
                            <div key={idx} className="flex items-center text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600 shrink-0" />
                              <span className="font-medium text-slate-700 truncate">{allocation.resource?.name || 'Unknown Resource'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No resources</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      {(() => {
                        const lastAllocation = patient.allocatedResources?.length > 0
                          ? patient.allocatedResources[patient.allocatedResources.length - 1]
                          : null;
                        const displayDate = lastAllocation?.allocatedAt
                          ? new Date(lastAllocation.allocatedAt)
                          : new Date(patient.createdAt);
                        const label = lastAllocation?.allocatedAt ? 'Allocated' : 'Created';
                        const now = new Date();
                        const diffMs = now - displayDate;
                        const diffMins = Math.floor(diffMs / 60000);
                        const relativeTime = diffMins < 1 ? 'Just now'
                          : diffMins < 60 ? `${diffMins}m ago`
                          : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago`
                          : `${Math.floor(diffMins / 1440)}d ago`;

                        return (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-xs text-slate-500">
                              <Clock className="h-3 w-3 mr-1.5" />
                              <div>
                                <div>{displayDate.toLocaleDateString()}</div>
                                <div>{displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">{label} · {relativeTime}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <button
                        onClick={() => handleDelete(patient._id)}
                        disabled={isDeleting === patient._id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-600">No patient records found</p>
                      <p className="text-sm">Try adjusting your search criteria or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;

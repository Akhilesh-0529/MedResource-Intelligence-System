import { useStore } from '../hooks/useStore';
import { Bed, Microchip, Activity, AlertTriangle } from 'lucide-react';
import classNames from 'classnames';

const DashboardWidget = ({ title, count, total, subtext, icon, type }) => {
  const IconComponent = icon;const healthColor = classNames({
    'text-normal bg-normal/10': type === 'normal',
    'text-urgent bg-urgent/10': type === 'warning',
    'text-critical bg-critical/10': type === 'critical',
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <div className="flex items-end space-x-2">
          <h3 className="text-3xl font-bold text-slate-800">{count}</h3>
          <span className="text-sm text-slate-400 mb-1">/ {total}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">{subtext}</p>
      </div>
      <div className={classNames("p-4 rounded-full", healthColor)}>
        <IconComponent className="h-8 w-8" />
      </div>
    </div>
  );
};

const DashboardAdmin = () => {
  const { resources, patients } = useStore();

  const totalBeds = resources.filter(r => r.type === 'Bed').reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const availableBeds = resources.filter(r => r.type === 'Bed').reduce((acc, curr) => acc + curr.availableQuantity, 0);
  
  const totalEquip = resources.filter(r => r.type === 'Equipment').reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const availableEquip = resources.filter(r => r.type === 'Equipment').reduce((acc, curr) => acc + curr.availableQuantity, 0);

  const waitingPatients = patients.filter(p => p.status === 'Waiting').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hospital Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardWidget 
          title="Available Beds" 
          count={availableBeds} 
          total={totalBeds} 
          subtext="ICU & General Wards"
          icon={Bed}
          type={availableBeds < totalBeds * 0.2 ? 'critical' : 'normal'}
        />
        <DashboardWidget 
          title="Available Equipment" 
          count={availableEquip} 
          total={totalEquip} 
          subtext="Ventilators, Scanners"
          icon={Microchip}
          type={availableEquip < totalEquip * 0.2 ? 'warning' : 'normal'}
        />
        <DashboardWidget 
          title="Patients in Queue" 
          count={waitingPatients} 
          total={patients.length} 
          subtext="Awaiting Triage/Allocation"
          icon={Activity}
          type={waitingPatients > 10 ? 'critical' : 'warning'}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-urgent" />
          Critical Shortages
        </h2>
        {resources.filter(r => r.status === 'Critical' || r.status === 'Low').length === 0 ? (
          <p className="text-slate-500">No critical shortages.</p>
        ) : (
          <ul className="space-y-3">
            {resources.filter(r => r.status === 'Critical' || r.status === 'Low').map(r => (
              <li key={r._id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">{r.name} ({r.department})</span>
                <span className={classNames(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  r.status === 'Critical' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                )}>
                  {r.availableQuantity} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;

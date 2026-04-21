import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { StoreContext } from './StoreContext';
import api, { API_BASE_URL, getConnectionStatus, onConnectionChange, checkServerHealth } from '../utils/api';

const CACHE_KEY_RESOURCES = 'smartalloc_cache_resources';
const CACHE_KEY_PATIENTS = 'smartalloc_cache_patients';

const getCachedData = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};

const cacheData = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* storage full */ }
};

const getPatientIdentity = (patient) => patient.clientId || patient._id;

const mergeByPatientIdentity = (list) => {
  const merged = new Map();
  list.forEach((patient) => {
    merged.set(getPatientIdentity(patient), patient);
  });
  return Array.from(merged.values());
};

export const StoreProvider = ({ children }) => {
  const [resources, setResources] = useState(() => getCachedData(CACHE_KEY_RESOURCES));
  const [patients, setPatients] = useState(() => getCachedData(CACHE_KEY_PATIENTS));
  const [isOnline, setIsOnline] = useState(getConnectionStatus());
  const socketRef = useRef(null);

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = onConnectionChange((status) => {
      setIsOnline(status);
      if (status) {
        // Just came back online — re-fetch fresh data
        const fetchData = async () => {
          try {
            const [resRes, patRes] = await Promise.all([
              api.get('/api/resources'),
              api.get('/api/patients')
            ]);
            setResources(resRes.data);
            setPatients(patRes.data);
            // Cache for offline use
            cacheData(CACHE_KEY_RESOURCES, resRes.data);
            cacheData(CACHE_KEY_PATIENTS, patRes.data);
          } catch (err) {
            console.warn("Using cached data —", err.message);
            // Data already initialized from cache in useState
          }
        };
        fetchData();
      }
    });

    // Also listen to browser online/offline events
    const handleOnline = () => checkServerHealth();
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic health check every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      checkServerHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, patRes] = await Promise.all([
          api.get('/api/resources'),
          api.get('/api/patients')
        ]);
        setResources(resRes.data);
        setPatients(patRes.data);
        // Cache for offline use
        cacheData(CACHE_KEY_RESOURCES, resRes.data);
        cacheData(CACHE_KEY_PATIENTS, patRes.data);
      } catch (err) {
        console.warn("Using cached data —", err.message);
        // Data already initialized from cache in useState
      }
    };
    fetchData();
  }, []);

  // Update cache whenever data changes from socket events
  useEffect(() => { cacheData(CACHE_KEY_RESOURCES, resources); }, [resources]);
  useEffect(() => { cacheData(CACHE_KEY_PATIENTS, patients); }, [patients]);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsOnline(true);
    });

    newSocket.on('disconnect', () => {
      // Don't immediately set offline — server might just be restarting
    });

    newSocket.on('resource-updated', (updatedResource) => {
      setResources(prev => {
        const index = prev.findIndex(r => r._id === updatedResource._id);
        if (index > -1) {
          const newResources = [...prev];
          newResources[index] = updatedResource;
          return newResources;
        }
        return [...prev, updatedResource];
      });
    });

    newSocket.on('resource-deleted', (deletedResourceId) => {
      setResources(prev => prev.filter(r => r._id !== deletedResourceId));
    });

    newSocket.on('patient-deleted', (deletedPatientId) => {
      setPatients(prev => prev.filter(p => p._id !== deletedPatientId));
    });

    newSocket.on('patient-updated', (updatedPatient) => {
      setPatients(prev => {
        const index = prev.findIndex(p => 
          p._id === updatedPatient._id || 
          (updatedPatient.clientId && p._id === updatedPatient.clientId) ||
          (updatedPatient.clientId && p.clientId === updatedPatient.clientId)
        );
        if (index > -1) {
          const newPatients = [...prev];
          newPatients[index] = updatedPatient;
          return mergeByPatientIdentity(newPatients);
        }
        return mergeByPatientIdentity([...prev, updatedPatient]);
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const addOptimisticPatient = (patient) => {
    // Ensure temporary patients always have an _id field assigned 
    // so React keys and UI updates behave correctly.
    const optimisticData = { ...patient, _id: patient._id || patient.clientId };
    
    setPatients((prev) => {
      const index = prev.findIndex(p => p._id === optimisticData._id);
      if (index > -1) return prev;
      return mergeByPatientIdentity([...prev, optimisticData]);
    });
  };

  const allocateOptimisticResource = (patientId, resourceId) => {
    // 1. Decrement the resource
    setResources(prev => prev.map(r => {
      if (r._id === resourceId && r.availableQuantity > 0) {
        return { ...r, availableQuantity: r.availableQuantity - 1 };
      }
      return r;
    }));
    
    // 2. Mark patient as Allocated so they leave the Queue
    setPatients(prev => prev.map(p => {
      if (p._id === patientId || p.clientId === patientId) {
        return { ...p, status: 'Allocated' };
      }
      return p;
    }));
  };

  return (
    <StoreContext.Provider value={{ resources, patients, isOnline, addOptimisticPatient, allocateOptimisticResource }}>
      {children}
    </StoreContext.Provider>
  );
};

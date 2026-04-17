import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { StoreContext } from './StoreContext';

export const StoreProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [patients, setPatients] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, patRes] = await Promise.all([
          axios.get('http://localhost:5001/api/resources'),
          axios.get('http://localhost:5001/api/patients')
        ]);
        setResources(resRes.data);
        setPatients(patRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    socketRef.current = newSocket;

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

    newSocket.on('patient-updated', (updatedPatient) => {
      setPatients(prev => {
        const index = prev.findIndex(p => p._id === updatedPatient._id);
        if (index > -1) {
          const newPatients = [...prev];
          newPatients[index] = updatedPatient;
          return newPatients;
        }
        return [...prev, updatedPatient];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <StoreContext.Provider value={{ resources, patients }}>
      {children}
    </StoreContext.Provider>
  );
};

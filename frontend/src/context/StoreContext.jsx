import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [patients, setPatients] = useState([]);
  const [socket, setSocket] = useState(null);

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

    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

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

    return () => newSocket.close();
  }, []);

  return (
    <StoreContext.Provider value={{ resources, patients, socket }}>
      {children}
    </StoreContext.Provider>
  );
};

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const fetchElectionData = () => api.get('/election-data');
export const fetchGeoJSON = () => api.get('/geojson');
export const fetchInsights = () => api.get('/insights');
export const predictParty = (data: any) => api.post('/predict', data);

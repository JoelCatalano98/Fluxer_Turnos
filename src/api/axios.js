import axios from 'axios';

if (!import.meta.env.VITE_API_URL) {
  console.error("VITE_API_URL no está configurada — la app no puede conectarse al backend");
}

const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: adjuntar token JWT en cada petición
clienteAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('socio_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default clienteAxios;

import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/api/auth`; 

export async function login(username, password) {
  const res = await axios.post(`${API}/login`, { username, password });
  return res.data; // { token, user }
}

export function guardarSesion(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function obtenerSesion() {
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');
  if (!token || !usuario || usuario === 'undefined') return null;
  try {
    return { token, usuario: JSON.parse(usuario) };
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function haySession() {
  return !!localStorage.getItem('token');
}

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

export async function login(username) {
  const res = await api.post('/auth/login', { username });
  return res.data;
}

export async function createRoom(username) {
  const res = await api.post('/rooms/create', { username });
  return res.data;
}

export async function joinRoom(roomId, username) {
  const res = await api.post('/rooms/join', { roomId, username });
  return res.data;
}

export async function getLeaderboard() {
  const res = await api.get('/battles/leaderboard');
  return res.data;
}

export async function runCode({ roomId, code, language, problemId }) {
  const res = await api.post('/judge/run', { roomId, code, language, problemId });
  return res.data;
}

export async function submitCode({ roomId, code, language, problemId }) {
  const user = JSON.parse(localStorage.getItem('multicode_user') || 'null');
  const username = user?.username;
  const res = await api.post('/judge/submit', { roomId, code, language, problemId, username });
  return res.data;
}


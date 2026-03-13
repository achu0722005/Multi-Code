import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';

function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setError('');
    setLoading(true);
    try {
      const user = await login(username.trim());
      localStorage.setItem('multicode_user', JSON.stringify(user));
      navigate('/create');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 mt-8">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 mb-3">
          Battle your friends in real-time coding duels
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Multicode lets you jump into 1v1 coding battles, solve the same problem in real-time, and
          climb the global leaderboard.
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="glass-surface rounded-2xl px-6 py-5 w-full max-w-md flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-100">Choose your username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-3 py-2 rounded-md bg-slate-900/60 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
            placeholder="e.g. code_ninja"
          />
        </label>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="inline-flex justify-center items-center px-4 py-2.5 rounded-md bg-accent text-slate-900 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Joining...' : 'Enter the arena'}
        </button>
        <p className="text-[11px] text-slate-400">
          No password needed for now — we keep it simple. Your rating and battle history are tied to
          this username.
        </p>
      </form>

      <div className="flex gap-4 text-xs text-slate-400">
        <Link to="/leaderboard" className="hover:text-accent transition-colors">
          View Leaderboard
        </Link>
        <span className="text-slate-600">•</span>
        <Link to="/join" className="hover:text-accent transition-colors">
          Join a friend&apos;s room
        </Link>
        <span className="text-slate-600">•</span>
        <Link to="https://www.linkedin.com/in/akshay-nv-b2aa81294/" className="hover:text-accent transition-colors">
          Meet the developer ❤️
        </Link>
      </div>
    </div>
  );
}

export default Home;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom } from '../services/api.js';

function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('multicode_user') || 'null');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    if (!user) {
      navigate('/');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await joinRoom(roomId.trim(), user.username);
      navigate(`/room/${roomId.trim()}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 glass-surface rounded-2xl px-6 py-6 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-slate-100">Join a friend&apos;s room</h2>
      <p className="text-sm text-slate-300">
        Paste the room ID or full link you received. You&apos;ll be dropped directly into the battle
        once you join.
      </p>
      <form onSubmit={handleJoin} className="flex flex-col gap-3">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="px-3 py-2 rounded-md bg-slate-900/60 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
          placeholder="Room ID or link"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !roomId.trim()}
          className="inline-flex justify-center items-center px-4 py-2.5 rounded-md bg-accent text-slate-900 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Joining...' : 'Join room'}
        </button>
      </form>
    </div>
  );
}

export default JoinRoom;


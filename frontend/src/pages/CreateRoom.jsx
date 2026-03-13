import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../services/api.js';

function CreateRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('multicode_user') || 'null');

  const handleCreate = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { roomId } = await createRoom(user.username);
      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 glass-surface rounded-2xl px-6 py-6 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-slate-100">Create a battle room</h2>
      <p className="text-sm text-slate-300">
        A unique room ID will be generated. Share the link with a friend — once both players join,
        the battle begins.
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="inline-flex justify-center items-center px-4 py-2.5 rounded-md bg-accent text-slate-900 text-sm font-semibold disabled:opacity-60"
      >
        {loading ? 'Creating...' : 'Create room'}
      </button>
    </div>
  );
}

export default CreateRoom;


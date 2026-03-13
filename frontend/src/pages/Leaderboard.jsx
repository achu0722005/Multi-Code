import { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api.js';

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getLeaderboard();
        setPlayers(data);
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 glass-surface rounded-2xl px-6 py-6">
      <h2 className="text-xl font-semibold text-slate-100 mb-4">Top players</h2>
      {loading ? (
        <p className="text-sm text-slate-400">Loading leaderboard...</p>
      ) : players.length === 0 ? (
        <p className="text-sm text-slate-400">No battles yet. Be the first to claim the throne.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="text-left py-2 pr-4">#</th>
                <th className="text-left py-2 pr-4">Player</th>
                <th className="text-right py-2 pr-4">Wins</th>
                <th className="text-right py-2 pr-4">Losses</th>
                <th className="text-right py-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => (
                <tr key={p._id} className="border-b border-slate-800/80 last:border-0">
                  <td className="py-2 pr-4 text-slate-400">{idx + 1}</td>
                  <td className="py-2 pr-4 text-slate-100 font-medium">{p.username}</td>
                  <td className="py-2 pr-4 text-right text-emerald-300">{p.wins}</td>
                  <td className="py-2 pr-4 text-right text-rose-300">{p.losses}</td>
                  <td className="py-2 text-right text-slate-100">{Math.round(p.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;


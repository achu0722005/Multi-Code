import User from '../models/User.js';

export async function getLeaderboard(req, res) {
  try {
    const users = await User.find().sort({ wins: -1, rating: -1 }).limit(20);
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load leaderboard' });
  }
}


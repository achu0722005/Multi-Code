import User from '../models/User.js';

export async function login(req, res) {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }
  const trimmed = username.trim();
  if (!trimmed) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    let user = await User.findOne({ username: trimmed });
    if (!user) {
      user = await User.create({ username: trimmed });
    }
    return res.json(user);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Failed to login' });
  }
}


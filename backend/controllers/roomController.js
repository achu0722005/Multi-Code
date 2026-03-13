import crypto from 'crypto';
import Battle from '../models/Battle.js';

function generateRoomId() {
  return crypto.randomBytes(3).toString('hex');
}

export async function createRoom(req, res) {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Username required' });

  const roomId = generateRoomId();
  try {
    const battle = await Battle.create({
      roomId,
      player1: username,
      state: 'waiting'
    });
    return res.json({ roomId: battle.roomId });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to create room' });
  }
}

export async function joinRoom(req, res) {
  const { roomId, username } = req.body;
  if (!roomId || !username) {
    return res.status(400).json({ message: 'Room ID and username required' });
  }

  try {
    const battle = await Battle.findOne({ roomId });
    if (!battle) return res.status(404).json({ message: 'Room not found' });
    if (battle.player2 && battle.player2 !== username) {
      return res.status(400).json({ message: 'Room is full' });
    }

    if (!battle.player2 && battle.player1 !== username) {
      battle.player2 = username;
      await battle.save();
    }

    return res.json({ roomId: battle.roomId });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to join room' });
  }
}


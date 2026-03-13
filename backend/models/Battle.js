import mongoose from 'mongoose';

const battleSchema = new mongoose.Schema(
  {
    roomId: { type: String, unique: true, required: true },
    player1: { type: String, required: true },
    player2: { type: String },
    winner: { type: String },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    state: {
      type: String,
      enum: ['waiting', 'in_progress', 'finished'],
      default: 'waiting'
    },
    // when the battle actually started (both players present and problem assigned)
    startedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Battle', battleSchema);


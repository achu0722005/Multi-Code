import Battle from '../models/Battle.js';
import Problem from '../models/Problem.js';

const ROOM_STATE = new Map();
const BATTLE_DURATION_SECONDS = 10 * 60;

export function registerSocketHandlers(io) {
  // simple server-side timer broadcaster to keep clients in sync
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of ROOM_STATE.entries()) {
      if (!room.startTime) continue;
      const elapsed = Math.floor((now - room.startTime) / 1000);
      const remaining = Math.max(0, BATTLE_DURATION_SECONDS - elapsed);
      io.to(roomId).emit('timer:update', { remainingSeconds: remaining });
    }
  }, 1000);

  io.on('connection', (socket) => {
    socket.on('room:join', async ({ roomId, username }) => {
      if (!roomId || !username) return;
      socket.join(roomId);
      const room = ROOM_STATE.get(roomId) || {
        players: [],
        startTime: null,
        problem: null,
        problemId: null
      };

      if (!room.players.find((p) => p.username === username)) {
        room.players.push({ username, socketId: socket.id });
      } else {
        // update socketId on reconnect
        room.players = room.players.map((p) =>
          p.username === username ? { ...p, socketId: socket.id } : p
        );
      }

      ROOM_STATE.set(roomId, room);

      io.to(roomId).emit('room:update', {
        roomId,
        players: room.players.map((p) => ({ username: p.username }))
      });

      if (room.players.length === 2 && !room.startTime && !room.problemId) {
        // start battle
        room.problemId = 'initializing';
        let battle = await Battle.findOne({ roomId });
        if (!battle) {
          battle = await Battle.create({
            roomId,
            player1: room.players[0].username,
            player2: room.players[1].username
          });
        } else if (!battle.player2 && room.players[1]) {
          battle.player2 = room.players[1].username;
        }

        const count = await Problem.countDocuments();
        if (count > 0) {
          const random = Math.floor(Math.random() * count);
          const problem = await Problem.findOne().skip(random);

          // 3. Save the specific problem and start time to the room object
          battle.problem = problem._id;
          battle.state = 'in_progress';
          battle.startedAt = new Date();
          await battle.save();

          room.problem = {
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty
          };
          room.problemId = problem._id.toString();
          room.startTime = Date.now(); // This enables the timer broadcaster
        }

        // 4. Update the ROOM_STATE and broadcast the start signal
        ROOM_STATE.set(roomId, room);

        io.to(roomId).emit('battle:start', {
          problem: room.problem,
          problemId: room.problemId,
          remainingSeconds: BATTLE_DURATION_SECONDS
        });
      }
    });

    socket.on('room:leave', ({ roomId, username }) => {
      socket.leave(roomId);
      const room = ROOM_STATE.get(roomId);
      if (!room) return;
      room.players = room.players.filter((p) => p.username !== username);
      if (room.players.length === 0) {
        ROOM_STATE.delete(roomId);
      } else {
        ROOM_STATE.set(roomId, room);
        io.to(roomId).emit('room:update', {
          roomId,
          players: room.players.map((p) => ({ username: p.username }))
        });
      }
    });

    socket.on('disconnect', () => {
      // remove this socket from any rooms it was part of
      for (const [roomId, room] of ROOM_STATE.entries()) {
        const before = room.players.length;
        room.players = room.players.filter((p) => p.socketId !== socket.id);
        if (room.players.length === 0) {
          ROOM_STATE.delete(roomId);
        } else if (room.players.length !== before) {
          ROOM_STATE.set(roomId, room);
          io.to(roomId).emit('room:update', {
            roomId,
            players: room.players.map((p) => ({ username: p.username }))
          });
        }
      }
    });

    socket.on('code:change', ({ roomId, code }) => {
      if (!roomId) return;
      socket.to(roomId).emit('code:update', { code });
    });

    socket.on('typing', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('opponent:typing');
    });
  });
}


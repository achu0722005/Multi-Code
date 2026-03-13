import axios from 'axios';
import Problem from '../models/Problem.js';
import Battle from '../models/Battle.js';
import User from '../models/User.js';
import { getIo } from '../socket/ioInstance.js';

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY || null;

function judge0Client() {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (JUDGE0_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }
  return axios.create({
    baseURL: JUDGE0_URL,
    headers
  });
}

function mapLanguageToJudge0(language) {
  switch (language) {
    case 'javascript':
      return 63; // Node.js (latest)
    case 'python':
      return 71; // Python (3.8)
    case 'cpp':
      return 54; // C++ (GCC 9.2)
    case 'java':
      return 62; // Java (OpenJDK 13)
    default:
      return 63;
  }
}

async function runAgainstTestCases({ code, language, testCases }) {
  const client = judge0Client();
  const languageId = mapLanguageToJudge0(language);

  const submissions = await Promise.all(
    testCases.map((tc) =>
      client
        .post('/submissions?base64_encoded=false&wait=true', {
          source_code: code,
          language_id: languageId,
          stdin: tc.input,
          expected_output: tc.expectedOutput
        })
        .then((res) => res.data)
    )
  );

  const allPassed = submissions.every((s) => s.status && s.status.id === 3);
  const failedIndex = submissions.findIndex((s) => !s.status || s.status.id !== 3);

  return {
    allPassed,
    submissions,
    failedIndex
  };
}

export async function runCode(req, res) {
  const { code, language, problemId } = req.body;
  if (!code || !language || !problemId) {
    return res.status(400).json({ message: 'code, language and problemId are required' });
  }
  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const { submissions, allPassed, failedIndex } = await runAgainstTestCases({
      code,
      language,
      testCases: problem.testCases
    });

    let output = '';
    if (allPassed) {
      output = `All ${submissions.length} test cases passed ✅`;
    } else {
      const s = submissions[failedIndex];
      output =
        `Failed on test case #${failedIndex + 1}\n` +
        `Status: ${s.status?.description}\n` +
        (s.stderr || s.compile_output || s.message || '');
    }

    return res.json({
      allPassed,
      output
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Execution failed' });
  }
}

export async function submitSolution(req, res) {
  const { code, language, problemId, roomId, username } = req.body;
  if (!code || !language || !problemId || !roomId || !username) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const { allPassed, output } = await runAgainstTestCases({
      code,
      language,
      testCases: problem.testCases
    });

    if (!allPassed) {
      return res.json({ allPassed: false, output });
    }

    const battle = await Battle.findOne({ roomId });
    if (!battle) {
      return res.json({ allPassed: true, output: `${output}\nBut battle room no longer exists.` });
    }

    // ensure the submitting user is actually part of this battle
    if (![battle.player1, battle.player2].includes(username)) {
      return res.status(403).json({ message: 'You are not a player in this battle' });
    }

    // simple server-side time limit enforcement if startedAt is present
    if (battle.startedAt) {
      const elapsedSeconds =
        (Date.now() - new Date(battle.startedAt).getTime()) / 1000;
      // reuse same limit as socket layer
      if (elapsedSeconds > 10 * 60) {
        return res
          .status(400)
          .json({ message: 'Battle time is over. Submissions are no longer accepted.' });
      }
    }

    // attempt to atomically set winner if not yet decided
    const updatedBattle = await Battle.findOneAndUpdate(
      { roomId, winner: { $exists: false } },
      { $set: { winner: username, state: 'finished' } },
      { new: true }
    );

    if (!updatedBattle) {
      // someone else already won
      return res.json({
        allPassed: true,
        output: `${output}\nBut another player has already won this battle.`
      });
    }

    // simple rating / win-loss update
    const winnerUser = await User.findOne({ username });
    if (winnerUser) {
      winnerUser.wins += 1;
      winnerUser.rating += 20;
      await winnerUser.save();
    }

    const loserName = [updatedBattle.player1, updatedBattle.player2].find(
      (u) => u && u !== username
    );
    if (loserName) {
      const loserUser = await User.findOne({ username: loserName });
      if (loserUser) {
        loserUser.losses += 1;
        loserUser.rating = Math.max(800, loserUser.rating - 15);
        await loserUser.save();
      }
    }

    // broadcast result to both players via Socket.IO
    try {
      const io = getIo();
      io.to(roomId).emit('battle:result', {
        winner: username,
        reason: 'All tests passed first'
      });
    } catch (emitErr) {
      // eslint-disable-next-line no-console
      console.error('Failed to emit battle result', emitErr);
    }

    return res.json({
      allPassed: true,
      output: `${output}\nYou won the battle (if you were first to pass all test cases)!`
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Submission failed' });
  }
}


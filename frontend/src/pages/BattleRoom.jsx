import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor.jsx';
import Timer from '../components/Timer.jsx';
import ProblemBox from '../components/ProblemBox.jsx';
import PlayerStatus from '../components/PlayerStatus.jsx';
import { getSocket } from '../services/socket.js';
import { runCode, submitCode } from '../services/api.js';

const DEFAULT_DURATION = 10 * 60;

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' }
];

function BattleRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('multicode_user') || 'null');

  const [socketConnected, setSocketConnected] = useState(false);
  const [problem, setProblem] = useState(null);
  const [problemId, setProblemId] = useState(null);
  const [myLanguage, setMyLanguage] = useState('javascript');
  const [myCode, setMyCode] = useState('');
  const [opponentCode, setOpponentCode] = useState('');
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [players, setPlayers] = useState({ me: null, opponent: null });
  const [secondsRemaining, setSecondsRemaining] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runningOutput, setRunningOutput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    const socket = getSocket();

    const handleConnect = () => {
      setSocketConnected(true);
      socket.emit('room:join', { roomId, username: user.username });
    };
    const handleDisconnect = () => setSocketConnected(false);

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.on('room:update', (payload) => {
      setPlayers({
        me: payload.players.find((p) => p.username === user.username) || null,
        opponent: payload.players.find((p) => p.username !== user.username) || null
      });
    });

    socket.on('battle:start', ({ problem: p, problemId: pid, remainingSeconds }) => {
      setProblem(p);
      setProblemId(pid);
      setSecondsRemaining(remainingSeconds ?? DEFAULT_DURATION);
      setIsRunning(true);
      setResult(null);
    });

    socket.on('code:update', ({ code }) => {
      setOpponentCode(code);
    });

    socket.on('opponent:typing', () => {
      setOpponentTyping(true);
      setTimeout(() => setOpponentTyping(false), 1200);
    });

    socket.on('timer:update', ({ remainingSeconds }) => {
      setSecondsRemaining(remainingSeconds);
      if (remainingSeconds <= 0) {
        setIsRunning(false);
      }
    });

    socket.on('battle:result', ({ winner, reason }) => {
      setResult({ winner, reason });
      setIsRunning(false);
    });

    return () => {
      socket.emit('room:leave', { roomId, username: user.username });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room:update');
      socket.off('battle:start');
      socket.off('code:update');
      socket.off('opponent:typing');
      socket.off('timer:update');
      socket.off('battle:result');
    };
  }, [roomId, navigate, user]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const handleCodeChange = (code) => {
    setMyCode(code);
    const socket = getSocket();
    socket.emit('code:change', { roomId, code });
    socket.emit('typing', { roomId });
  };

  const handleRun = async () => {
    if (!problemId) return;
    setRunningOutput('Running...');
    try {
      const res = await runCode({ roomId, code: myCode, language: myLanguage, problemId });
      setRunningOutput(res.output || 'No output');
    } catch (e) {
      setRunningOutput('Failed to run code');
    }
  };

  const handleSubmit = async () => {
    if (!problemId) return;
    setSubmitting(true);
    setRunningOutput('Submitting solution...');
    try {
      const res = await submitCode({ roomId, code: myCode, language: myLanguage, problemId });
      setRunningOutput(res.output || 'Submission complete');
    } catch (e) {
      setRunningOutput('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const me = players.me;
  const opponent = players.opponent;
  const winnerUsername = result?.winner;

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Room {roomId}</h2>
          <p className="text-xs text-slate-400">
            {socketConnected ? 'Connected to battle server' : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Timer secondsRemaining={secondsRemaining} />
        </div>
      </div>

      <ProblemBox problem={problem} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <PlayerStatus
            username={me?.username || user?.username}
            isYou
            isTyping={false}
            hasSubmitted={false}
            isWinner={Boolean(winnerUsername && winnerUsername === me?.username)}
          />
          <div className="glass-surface rounded-xl overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/40 text-xs">
              <span className="text-slate-300">Your code</span>
              <select
                value={myLanguage}
                onChange={(e) => setMyLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option value={lang.id} key={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <CodeEditor language={myLanguage} value={myCode} onChange={handleCodeChange} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <PlayerStatus
            username={opponent?.username}
            isYou={false}
            isTyping={opponentTyping}
            hasSubmitted={false}
            isWinner={Boolean(winnerUsername && opponent && winnerUsername === opponent.username)}
          />
          <div className="glass-surface rounded-xl overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/40 text-xs">
              <span className="text-slate-300">
                Opponent code {opponentTyping && <span className="italic text-slate-400">typing...</span>}
              </span>
            </div>
            <CodeEditor language={myLanguage} value={opponentCode} readOnly onChange={() => {}} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            className="px-4 py-2 rounded-md bg-slate-800 text-slate-100 text-sm font-medium hover:bg-slate-700"
          >
            Run code
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit solution'}
          </button>
        </div>
        <div className="flex-1 glass-surface rounded-xl px-3 py-2 text-xs text-slate-300 min-h-[60px]">
          {result ? (
            <span>
              Winner: <span className="font-semibold text-emerald-300">{result.winner}</span>{' '}
              <span className="text-slate-400">({result.reason})</span>
            </span>
          ) : (
            <pre className="whitespace-pre-wrap text-[11px] leading-snug">
              {runningOutput || 'Run or submit your code to see output and verdict.'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattleRoom;


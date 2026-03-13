import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import CreateRoom from './pages/CreateRoom.jsx';
import JoinRoom from './pages/JoinRoom.jsx';
import BattleRoom from './pages/BattleRoom.jsx';
import Leaderboard from './pages/Leaderboard.jsx';

function App() {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<BattleRoom />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


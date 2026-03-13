import { Link, NavLink } from 'react-router-dom';

const navLinkClasses = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-accent/20 text-accent' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
  }`;

function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-surface/80 backdrop-blur-xl">
      <nav className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-slate-900 font-bold">
            M
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-slate-100">Multicode</span>
            <span className="text-[11px] text-slate-400">Realtime coding battles</span>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <NavLink to="/" className={navLinkClasses} end>
            Home
          </NavLink>
          <NavLink to="/create" className={navLinkClasses}>
            Create Room
          </NavLink>
          <NavLink to="/join" className={navLinkClasses}>
            Join Room
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkClasses}>
            Leaderboard
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;


import { Link, NavLink } from 'react-router-dom';

const navLinkClasses = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-accent/20 text-accent' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
  }`;

function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-surface/80 backdrop-blur-xl">
      <nav className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-slate-900 font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
              <path stroke-linecap="round" stroke-linejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>

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


function PlayerStatus({ username, isYou, isTyping, hasSubmitted, isWinner }) {
  return (
    <div className="glass-surface rounded-xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="font-medium text-slate-100">
          {username || 'Waiting for player...'} {isYou && <span className="text-slate-400">(You)</span>}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-300">
        {isTyping && <span className="italic text-slate-400">typing...</span>}
        {hasSubmitted && <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">submitted</span>}
        {isWinner && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">winner</span>}
      </div>
    </div>
  );
}

export default PlayerStatus;


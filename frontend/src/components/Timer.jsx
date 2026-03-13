function Timer({ secondsRemaining }) {
  const minutes = Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsRemaining % 60).toString().padStart(2, '0');

  const danger = secondsRemaining <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
        danger
          ? 'border-red-500/60 bg-red-500/10 text-red-300'
          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
      <span>
        {minutes}:{seconds}
      </span>
    </div>
  );
}

export default Timer;


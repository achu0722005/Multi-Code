function ProblemBox({ problem }) {
  if (!problem) {
    return (
      <div className="glass-surface rounded-xl p-4 text-sm text-slate-400">
        Waiting for problem...
      </div>
    );
  }

  return (
    <div className="glass-surface rounded-xl p-4 sm:p-5 flex flex-col gap-2 max-h-80 overflow-y-auto">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-100 text-base sm:text-lg">{problem.title}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          {problem.difficulty || 'Medium'}
        </span>
      </div>
      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
        {problem.description}
      </p>
    </div>
  );
}

export default ProblemBox;


export default function SceletonLoader() {
  return (
    <div className="w-full md:w-2/5 rounded-md border bg-cyan-900/30 border-slate-400 p-3">
      <div className="flex animate-pulse space-x-2">
        <div className="size-10 rounded-full bg-cyan-900/50"></div>
        <div className="flex-1 space-y-3 py-1">
          <div className="h-2 rounded bg-cyan-900/50"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-2 rounded bg-cyan-900/50"></div>
              <div className="col-span-1 h-2 rounded bg-cyan-900/50"></div>
            </div>
            <div className="h-2 rounded bg-cyan-900/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

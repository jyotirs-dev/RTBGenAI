export const LoadingScreen = () => (
  <main
    aria-busy="true"
    aria-live="polite"
    className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ecfeff_45%,_#f8fafc_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8"
  >
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_30px_120px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-700">Preparing Workspace</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Loading the metadata-driven user administration screen.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Code splitting keeps the entry bundle lean while the CRUD feature loads in parallel.
        </p>
      </section>

      <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-6 space-y-4">
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)]">
          <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-6 space-y-4">
            <div className="h-20 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  </main>
);


import { Navbar } from "./Navbar";

export function RoutePending() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-[1400px] space-y-4 px-4 py-6 sm:px-6">
        <div className="skel h-9 w-48" />
        <div className="skel h-4 w-72" />
        <div className="skel h-36 w-full rounded-2xl" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="skel h-44 rounded-2xl" />
          <div className="skel h-44 rounded-2xl" />
        </div>
        <div className="skel h-80 w-full rounded-2xl" />
      </main>
    </div>
  );
}

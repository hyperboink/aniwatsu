"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function BlockedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert size={40} className="text-red-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Developer Tools Detected
        </h1>

        {/* Message */}
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          It looks like you have your browser&apos;s developer tools open.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          For the security and protection of our content, this site is not accessible while developer tools are active. Please close your developer tools and return to continue enjoying Aniwatsu.
        </p>

        {/* Steps */}
        <div className="bg-[#13131f] border border-white/5 rounded-xl p-4 mb-8 text-left space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">How to close developer tools</p>
          <p className="text-sm text-slate-300">• Press <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-xs font-mono">F12</kbd> to toggle DevTools off</p>
          <p className="text-sm text-slate-300">• Or press <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-xs font-mono">Ctrl + Shift + I</kbd> to close the panel</p>
          <p className="text-sm text-slate-300">• Then click the button below to go back</p>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </main>
  );
}

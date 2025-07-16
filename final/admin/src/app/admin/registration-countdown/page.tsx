"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const total = Math.max(0, diff);
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

const Stepper = () => (
  <div className="flex items-center justify-center gap-8 py-6">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"><span className="text-2xl">⚙️</span></div>
      <span className="text-green-600 font-semibold mt-2">Setup</span>
    </div>
    <div className="h-1 w-8 bg-green-400 rounded" />
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500"><span className="text-2xl">👥</span></div>
      <span className="text-blue-600 font-semibold mt-2">Registration</span>
    </div>
    <div className="h-1 w-8 bg-gray-200 rounded" />
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"><span className="text-2xl">📅</span></div>
      <span className="text-gray-400 font-semibold mt-2">Review</span>
    </div>
    <div className="h-1 w-8 bg-gray-200 rounded" />
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"><span className="text-2xl">✅</span></div>
      <span className="text-gray-400 font-semibold mt-2">Voting</span>
    </div>
    <div className="h-1 w-8 bg-gray-200 rounded" />
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"><span className="text-2xl">📊</span></div>
      <span className="text-gray-400 font-semibold mt-2">Results</span>
    </div>
  </div>
);

const RegistrationCountdownPage = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const votingStart = searchParams.get("votingStart");
  const votingEnd = searchParams.get("votingEnd");
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(new Date(start || "")));
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(new Date(start || ""));
      setTimeLeft(t);
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        // Redirect to registration-active page
        router.push(`/admin/registration-active?end=${end}&votingStart=${encodeURIComponent(votingStart || '')}&votingEnd=${encodeURIComponent(votingEnd || '')}&title=${encodeURIComponent(title || '')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [start, end, votingStart, votingEnd, title, router]);

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen w-full flex flex-col items-center py-8 px-2 pt-24 bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a]">
        {title && (
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 text-center drop-shadow-lg tracking-tight">{title}</h1>
        )}
        <div className="w-full max-w-3xl">
          <Stepper />
        </div>
        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 flex flex-col items-center mb-10 mt-2">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 flex items-center justify-center mb-6 shadow-lg border-4 border-white/20 backdrop-blur-md">
              <Clock className="w-14 h-14 text-blue-300" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Registration Starts In</h2>
            <p className="text-lg text-gray-300 text-center">The countdown to candidate registration has begun</p>
          </div>
          <div className="flex gap-6 mb-12 w-full justify-center">
            <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
              <span className="text-5xl font-extrabold text-blue-300 drop-shadow mb-2">{timeLeft.days}</span>
              <span className="text-lg text-blue-300 font-semibold">Days</span>
            </div>
            <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
              <span className="text-5xl font-extrabold text-purple-300 drop-shadow mb-2">{timeLeft.hours}</span>
              <span className="text-lg text-purple-300 font-semibold">Hours</span>
            </div>
            <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
              <span className="text-5xl font-extrabold text-blue-300 drop-shadow mb-2">{timeLeft.minutes}</span>
              <span className="text-lg text-blue-300 font-semibold">Minutes</span>
            </div>
            <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
              <span className="text-5xl font-extrabold text-pink-400 drop-shadow mb-2">{timeLeft.seconds}</span>
              <span className="text-lg text-pink-400 font-semibold">Seconds</span>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-2xl p-10 flex flex-col items-center border border-white/20 shadow-lg backdrop-blur-xl">
            <Clock className="w-12 h-12 text-blue-300 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Waiting for Registration to Begin</h3>
            <p className="text-blue-200 text-center text-lg">Registration will start automatically at the scheduled time.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationCountdownPage; 
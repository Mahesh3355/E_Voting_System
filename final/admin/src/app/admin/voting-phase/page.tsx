"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import { Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const total = Math.max(0, diff);
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

const Stepper = ({ phase }: { phase: "before" | "active" | "ended" }) => (
  <div className="flex items-center justify-center gap-8 py-6">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
        <span className="text-2xl">⚙️</span>
      </div>
      <span className="text-green-600 font-semibold mt-2">Setup</span>
    </div>
    <div className="h-1 w-8 bg-green-400 rounded" />
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
        <span className="text-2xl">👥</span>
      </div>
      <span className="text-green-600 font-semibold mt-2">Registration</span>
    </div>
    <div className="h-1 w-8 bg-green-400 rounded" />
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
        <span className="text-2xl">📅</span>
      </div>
      <span className="text-green-600 font-semibold mt-2">Review</span>
    </div>
    <div
      className={`h-1 w-8 ${
        phase !== "before" ? "bg-blue-500" : "bg-gray-200"
      } rounded`}
    />
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full ${
          phase === "active"
            ? "bg-blue-500 text-white"
            : phase === "ended"
            ? "bg-gray-400 text-white"
            : "bg-gray-200 text-gray-400"
        } flex items-center justify-center`}
      >
        <span className="text-2xl">🗳️</span>
      </div>
      <span
        className={`${
          phase === "active"
            ? "text-blue-600"
            : phase === "ended"
            ? "text-gray-400"
            : "text-gray-400"
        } font-semibold mt-2`}
      >
        Voting
      </span>
    </div>
    <div
      className={`h-1 w-8 ${
        phase === "ended" ? "bg-blue-500" : "bg-gray-200"
      } rounded`}
    />
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full ${
          phase === "ended"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-400"
        } flex items-center justify-center`}
      >
        <span className="text-2xl">📊</span>
      </div>
      <span
        className={`${
          phase === "ended" ? "text-blue-600" : "text-gray-400"
        } font-semibold mt-2`}
      >
        Results
      </span>
    </div>
  </div>
);

const VotingPhasePage = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "";
  const votingStart = searchParams.get("votingStart");
  const votingEnd = searchParams.get("votingEnd");
  const [phase, setPhase] = useState<"before" | "active" | "ended">("before");
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Parse dates for debug/info
  const parsedStart = votingStart ? new Date(votingStart) : null;
  const parsedEnd = votingEnd ? new Date(votingEnd) : null;

  useEffect(() => {
    if (!votingStart || !votingEnd) {
      setError("Voting start or end time is missing in the URL parameters.");
      return;
    }
    const start = new Date(votingStart);
    const end = new Date(votingEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError(
        "Voting start or end time is invalid. Please check the setup election step."
      );
      return;
    }
    setError(null);

    const updatePhase = () => {
      const now = new Date();
      if (now < start) {
        setPhase("before");
        setTimeLeft(getTimeLeft(start));
      } else if (now >= start && now < end) {
        setPhase("active");
        setTimeLeft(getTimeLeft(end));
      } else {
        setPhase("ended");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    };
    updatePhase();
    const interval = setInterval(updatePhase, 1000);
    return () => clearInterval(interval);
  }, [votingStart, votingEnd]);

  // Auto-redirect to results page when voting ends
  useEffect(() => {
    if (phase === "ended") {
      const timeout = setTimeout(() => {
        router.push(
          `/admin/results?title=${encodeURIComponent(
            title
          )}&votingStart=${encodeURIComponent(
            votingStart || ""
          )}&votingEnd=${encodeURIComponent(votingEnd || "")}`
        );
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase, router, title, votingStart, votingEnd]);

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen w-full flex flex-col items-center py-8 px-2 pt-24 bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a]">
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-white mb-4 text-center drop-shadow-lg tracking-tight"
          >
            {title}
          </motion.h1>
        )}
        <div className="w-full max-w-3xl">
          <Stepper phase={phase} />
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-3xl bg-red-900/80 border border-red-400/40 text-red-200 rounded-lg p-4 mb-6 text-center text-base font-semibold"
          >
            {error}
          </motion.div>
        )}
        {!error && timeLeft && (
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 flex flex-col items-center mb-10 mt-2"
            >
              <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400/20 via-pink-400/20 to-purple-400/20 flex items-center justify-center mb-6 shadow-lg border-4 border-white/20 backdrop-blur-md">
                  <CheckCircle className="w-14 h-14 text-red-300" />
                </div>
                {phase === "before" ? (
                  <>
                    <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                      Voting phase is going to start
                    </h2>
                    <p className="text-lg text-gray-300 text-center">
                      Voting starts in:
                    </p>
                  </>
                ) : phase === "active" ? (
                  <>
                    <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                      Voting Phase Active
                    </h2>
                    <p className="text-lg text-gray-300 text-center">
                      Voters can now cast their votes
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                      Voting Ended
                    </h2>
                    <p className="text-lg text-gray-300 text-center">
                      Voting has ended. Redirecting to results...
                    </p>
                  </>
                )}
              </div>
              <div className="flex gap-6 mb-12 w-full justify-center">
                <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
                  <span className="text-5xl font-extrabold text-red-300 drop-shadow mb-2">
                    {timeLeft.days}
                  </span>
                  <span className="text-lg text-red-300 font-semibold">
                    Days
                  </span>
                </div>
                <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
                  <span className="text-5xl font-extrabold text-pink-300 drop-shadow mb-2">
                    {timeLeft.hours}
                  </span>
                  <span className="text-lg text-pink-300 font-semibold">
                    Hours
                  </span>
                </div>
                <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
                  <span className="text-5xl font-extrabold text-purple-300 drop-shadow mb-2">
                    {timeLeft.minutes}
                  </span>
                  <span className="text-lg text-purple-300 font-semibold">
                    Minutes
                  </span>
                </div>
                <div className="glass-timer-card bg-white/10 border border-white/20 rounded-2xl px-8 py-8 flex flex-col items-center shadow-xl backdrop-blur-md">
                  <span className="text-5xl font-extrabold text-red-400 drop-shadow mb-2">
                    {timeLeft.seconds}
                  </span>
                  <span className="text-lg text-red-400 font-semibold">
                    Seconds
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-2xl p-10 flex flex-col items-center border border-white/20 shadow-lg backdrop-blur-xl">
                <CheckCircle className="w-12 h-12 text-red-300 mb-4" />
                {phase === "before" ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Voting Not Started
                    </h3>
                    <p className="text-red-200 text-center text-lg">
                      Voting will begin soon. Please wait until the countdown
                      ends.
                    </p>
                  </>
                ) : phase === "active" ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Voting in Progress
                    </h3>
                    <p className="text-red-200 text-center text-lg">
                      Voters can cast their votes until the countdown ends.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Voting Ended
                    </h3>
                    <p className="text-red-200 text-center text-lg">
                      Redirecting to results...
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default VotingPhasePage;

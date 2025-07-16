"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminNavbar from "../components/AdminNavbar";

const SetupElectionPage = () => {
  const [title, setTitle] = useState("");
  const [regStart, setRegStart] = useState("");
  const [regEnd, setRegEnd] = useState("");
  const [voteStart, setVoteStart] = useState("");
  const [voteEnd, setVoteEnd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [checkingEvent, setCheckingEvent] = useState(true);

  const regStartRef = useRef<HTMLInputElement>(null);
  const regEndRef = useRef<HTMLInputElement>(null);
  const voteStartRef = useRef<HTMLInputElement>(null);
  const voteEndRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // On mount, check if an election event exists
    const checkCurrentEvent = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events/current");
        const data = await res.json();
        if (data.event) {
          // Redirect to registration countdown or another page as needed
          // You can adjust the redirect target based on your app's flow
          router.replace(
            `/admin/registration-countdown?title=${encodeURIComponent(data.event.title)}&start=${encodeURIComponent(data.event.registrationStart)}&end=${encodeURIComponent(data.event.registrationEnd)}&votingStart=${encodeURIComponent(data.event.votingStart)}&votingEnd=${encodeURIComponent(data.event.votingEnd)}`
          );
        } else {
          setCheckingEvent(false);
        }
      } catch (err) {
        setCheckingEvent(false); // Allow setup if error
      }
    };
    checkCurrentEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title || !regStart || !regEnd || !voteStart || !voteEnd) {
      setError("All fields are required.");
      return;
    }
    const now = new Date();
    const regStartDate = new Date(regStart);
    const regEndDate = new Date(regEnd);
    const voteStartDate = new Date(voteStart);
    const voteEndDate = new Date(voteEnd);
    if (
      regStartDate <= now ||
      regEndDate <= now ||
      voteStartDate <= now ||
      voteEndDate <= now
    ) {
      setError("All dates and times must be in the future.");
      return;
    }
    if (
      !(regStartDate < regEndDate && regEndDate < voteStartDate && voteStartDate < voteEndDate)
    ) {
      setError("Dates must be in order: Registration Start < Registration End < Voting Start < Voting End.");
      return;
    }
    // Send to backend
    try {
      const res = await fetch("http://localhost:5000/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          registrationStart: regStartDate.toISOString(),
          registrationEnd: regEndDate.toISOString(),
          votingStart: voteStartDate.toISOString(),
          votingEnd: voteEndDate.toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Election event created successfully!");
        setTimeout(() => {
          router.push("/admin/registration-countdown?title=" + encodeURIComponent(title) + "&start=" + regStartDate.toISOString() + "&end=" + regEndDate.toISOString() + "&votingStart=" + voteStartDate.toISOString() + "&votingEnd=" + voteEndDate.toISOString());
        }, 1200);
      } else {
        setError(data.message || "Failed to create election event.");
      }
    } catch (err) {
      setError("Failed to create election event. Please try again.");
    }
  };

  if (checkingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-white">
        <div className="text-xl font-semibold animate-pulse">Checking for ongoing election...</div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar backHref="/admin" />
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] flex flex-col items-center justify-center py-8 px-2 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
          className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12 flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="flex flex-col items-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 flex items-center justify-center mb-4 shadow-lg border-4 border-white/20 backdrop-blur-md">
              <Calendar className="w-12 h-12 text-blue-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-center drop-shadow-lg">Setup New Election</h1>
            <p className="text-lg text-gray-300 mb-4 text-center font-light">Configure your election timeline and details</p>
          </motion.div>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
            className="w-full flex flex-col gap-8"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="text-red-200 bg-red-900/40 border border-red-400/30 rounded-lg px-4 py-2 mb-2 text-center font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-200 bg-green-900/40 border border-green-400/30 rounded-lg px-4 py-2 mb-2 text-center font-semibold">
                {success}
              </div>
            )}
            <div>
              <label className="block text-white font-semibold mb-2">Election Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition shadow-md backdrop-blur-md"
                placeholder="Enter election title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-white font-semibold mb-2">Registration Start</label>
                <div className="relative">
                  <input
                    ref={regStartRef}
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition shadow-md backdrop-blur-md"
                    value={regStart}
                    onChange={e => setRegStart(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-white font-semibold mb-2">Registration End</label>
                <div className="relative">
                  <input
                    ref={regEndRef}
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition shadow-md backdrop-blur-md"
                    value={regEnd}
                    onChange={e => setRegEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-white font-semibold mb-2">Voting Start</label>
                <div className="relative">
                  <input
                    ref={voteStartRef}
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition shadow-md backdrop-blur-md"
                    value={voteStart}
                    onChange={e => setVoteStart(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-white font-semibold mb-2">Voting End</label>
                <div className="relative">
                  <input
                    ref={voteEndRef}
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition shadow-md backdrop-blur-md"
                    value={voteEnd}
                    onChange={e => setVoteEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04, boxShadow: "0 4px 32px 0 #3b82f6aa" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white rounded-xl py-3 text-lg font-semibold flex items-center justify-center gap-2 mt-2 transition-all duration-200 shadow-lg"
            >
              <span className="text-xl">&#9654;</span> Create Election
            </motion.button>
          </motion.form>
        </motion.div>
        <style jsx global>{`
          input[type="datetime-local"].custom-date-input::-ms-input-placeholder {
            color: #a5b4fc;
          }
          input[type="datetime-local"].custom-date-input::placeholder {
            color: #a5b4fc;
          }
        `}</style>
      </div>
    </>
  );
};

export default SetupElectionPage; 
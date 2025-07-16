"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Award, AlertCircle, CheckCircle2, XCircle, ArrowLeft, ChevronRight, Users, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Types for our election data
type ElectionPhase = "registration" | "voting" | "completed";

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  phase: ElectionPhase;
  results?: {
    totalVotes: number;
    candidates: {
      name: string;
      votes: number;
      percentage: number;
    }[];
  };
}

const EventsPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date().toISOString());
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    fetch('http://localhost:5000/api/events/current')
      .then(res => res.json())
      .then(data => {
        setEvent(data.event);
        setLoading(false);
      });
    const interval = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => clearInterval(interval);
  }, []);

  let phase = 'none';
  if (event) {
    const nowDate = new Date(now);
    if (nowDate < new Date(event.registrationStart)) phase = 'before-registration';
    else if (nowDate < new Date(event.registrationEnd)) phase = 'registration';
    else if (nowDate < new Date(event.votingStart)) phase = 'before-voting';
    else if (nowDate < new Date(event.votingEnd)) phase = 'voting';
    else phase = 'completed';
  }

  useEffect(() => {
    if (event && phase === 'completed') {
      setShowCompleted(true);
      const timeout = setTimeout(() => {
        setShowCompleted(false);
        fetch('http://localhost:5000/api/events/current', { method: 'DELETE' })
          .then(() => setEvent(null));
      }, 30000); // 30 seconds
      return () => clearTimeout(timeout);
    } else {
      setShowCompleted(false);
    }
  }, [event, phase]);

  const getCountdown = (target: string) => {
    const diff = new Date(target).getTime() - new Date(now).getTime();
    if (diff <= 0) return '00:00:00';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mock data - In real app, this would come from your backend
  const [elections, setElections] = React.useState<Election[]>([]);

  const getPhaseColor = (phase: ElectionPhase) => {
    switch (phase) {
      case "registration":
        return "text-blue-400";
      case "voting":
        return "text-green-400";
      case "completed":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const getPhaseIcon = (phase: ElectionPhase) => {
    switch (phase) {
      case "registration":
        return <AlertCircle className="w-5 h-5" />;
      case "voting":
        return <Clock className="w-5 h-5" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <XCircle className="w-5 h-5" />;
    }
  };

  // Separate active and completed elections
  const activeElections = elections.filter(election => election.phase !== "completed");
  const completedElections = elections.filter(election => election.phase === "completed");

  // Dynamic text content based on election state
  const getContextualText = () => {
    if (activeElections.length === 0 && completedElections.length === 0) {
      return {
        title: "Welcome to VoteChain Elections",
        subtitle: "Your Voice Matters",
        description: "This is where democracy comes alive in our college community. While there are no active elections at the moment, stay tuned for upcoming opportunities to make your voice heard. Your participation shapes our future.",
        icon: <Award className="w-12 h-12 text-red-400 mb-4" />
      };
    } else if (activeElections.length > 0) {
      return {
        title: "Active Elections in Progress",
        subtitle: "Make Your Voice Count",
        description: "The time to shape our community's future is now. Your vote is your voice - use it to elect leaders who will represent your interests and drive positive change. Every vote matters in building a stronger college community.",
        icon: <Clock className="w-12 h-12 text-green-400 mb-4" />
      };
    } else {
      return {
        title: "Election Results",
        subtitle: "Transparency in Action",
        description: "View the outcomes of our democratic process. These results reflect the collective voice of our community, demonstrating the power of participation in shaping our institution's future.",
        icon: <CheckCircle2 className="w-12 h-12 text-purple-400 mb-4" />
      };
    }
  };

  const contextualText = getContextualText();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  // Motivational quote
  const motivationalQuote = "Your vote is your voice. Shape the future of your college!";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100">
      {/* Navbar */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled
          ? "backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm"
          : "bg-gradient-to-r from-[#0b0f1a] to-[#05080f] border-b border-white/10"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-red-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
              <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
                VoteChain
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="bg-transparent hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-colors">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-8"
      >
        <span className="inline-block text-lg md:text-xl font-semibold text-indigo-300 bg-indigo-900/30 px-6 py-2 rounded-full shadow-md animate-pulse">
          {motivationalQuote}
        </span>
      </motion.div>

      {/* Main Content */}
      <div className="pt-4">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center text-lg text-gray-400">Loading events...</div>
          ) : !showCompleted && !event ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-all duration-300"
            >
              <Sparkles className="w-16 h-16 mx-auto text-red-400 mb-4 animate-bounce" />
              <h1 className="text-4xl font-bold text-red-400 mb-4 font-poppins drop-shadow-lg">
                No Events Yet!
              </h1>
              <h2 className="text-2xl font-semibold text-white/90 mb-6">
                Stay tuned for upcoming elections.
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                This is where democracy comes alive in our college community. While there are no active events at the moment, keep an eye out for registration and voting announcements!
              </p>
            </motion.div>
          ) : showCompleted && event && phase === 'completed' ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16 bg-gradient-to-br from-[#1e293b]/80 via-[#0f172a]/80 to-[#0b1120]/80 border border-white/10 rounded-2xl p-8 shadow-2xl animate-glow relative overflow-hidden"
                style={{ boxShadow: "0 0 40px 0 #6366f1aa, 0 0 80px 0 #f43f5e55" }}
              >
                <Award className="w-12 h-12 mx-auto text-purple-400 mb-4 animate-pulse" />
                <h1 className="text-3xl font-extrabold text-white mb-2 font-poppins drop-shadow-lg tracking-wide">
                  {event.title || 'Election Event'}
                </h1>
                <div className="flex justify-center mb-4">
                  <span className="bg-purple-900/60 text-purple-300 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2 animate-fadeIn">
                    <Award className="w-4 h-4" /> Event Completed
                  </span>
                </div>
                <h2 className="text-xl text-white mb-2">This election event has ended.</h2>
                <p className="text-lg text-gray-300 mt-4">Please wait for the next event to participate in VoteChain. Stay tuned for upcoming elections!</p>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16 bg-gradient-to-br from-[#1e293b]/80 via-[#0f172a]/80 to-[#0b1120]/80 border border-white/10 rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_60px_rgba(99,102,241,0.3)] transition-all duration-300 animate-glow relative overflow-hidden"
              style={{ boxShadow: "0 0 40px 0 #6366f1aa, 0 0 80px 0 #f43f5e55" }}
            >
              <Calendar className="w-12 h-12 mx-auto text-red-400 mb-4 animate-pulse" />
              <h1 className="text-3xl font-extrabold text-white mb-2 font-poppins drop-shadow-lg tracking-wide">
                {event.title || 'Election Event'}
              </h1>
              {/* Phase badge */}
              <div className="flex justify-center mb-4">
                {phase === 'before-registration' && (
                  <span className="bg-blue-900/60 text-blue-300 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2 animate-fadeIn">
                    <Calendar className="w-4 h-4" /> Registration Upcoming
                  </span>
                )}
                {phase === 'registration' && (
                  <span className="bg-blue-900/60 text-blue-300 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2 animate-fadeIn">
                    <Calendar className="w-4 h-4" /> Registration Active
                  </span>
                )}
                {phase === 'before-voting' && (
                  <span className="bg-green-900/60 text-green-300 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2 animate-fadeIn">
                    <Clock className="w-4 h-4" /> Voting Upcoming
                  </span>
                )}
                {phase === 'voting' && (
                  <span className="bg-green-900/60 text-green-300 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" /> Voting Active
                  </span>
                )}
                {phase === 'completed' && (
                  <span className="bg-purple-900/60 text-purple-300 px-4 py-1 rounded-full font-semibold text-sm flex items-center gap-2 animate-fadeIn">
                    <Award className="w-4 h-4" /> Event Completed
                  </span>
                )}
              </div>
              {/* Progress bar */}
              <div className="mb-6">
                {phase === 'registration' && (
                  <Progress value={
                    Math.max(0, Math.min(100, 100 - (new Date(event.registrationEnd).getTime() - new Date(now).getTime()) / (new Date(event.registrationEnd).getTime() - new Date(event.registrationStart).getTime()) * 100))
                  } className="h-2 bg-blue-900/40" />
                )}
                {phase === 'voting' && (
                  <Progress value={
                    Math.max(0, Math.min(100, 100 - (new Date(event.votingEnd).getTime() - new Date(now).getTime()) / (new Date(event.votingEnd).getTime() - new Date(event.votingStart).getTime()) * 100))
                  } className="h-2 bg-green-900/40" />
                )}
              </div>
              {/* Timers and actions */}
              {phase === 'before-registration' && (
                <>
                  <h2 className="text-xl text-white mb-2">Registration starts in:</h2>
                  <div className="text-3xl font-mono text-blue-400 mb-4 animate-pulse">{getCountdown(event.registrationStart)}</div>
                </>
              )}
              {phase === 'registration' && (
                <>
                  <h2 className="text-xl text-white mb-2">Registration ends in:</h2>
                  <div className="text-3xl font-mono text-blue-400 mb-4 animate-pulse">{getCountdown(event.registrationEnd)}</div>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-8 py-3 mt-4 text-lg font-bold shadow-lg animate-bounce">
                      Sign Up Now
                    </Button>
                  </Link>
                </>
              )}
              {phase === 'before-voting' && (
                <>
                  <h2 className="text-xl text-white mb-2">Voting starts in:</h2>
                  <div className="text-3xl font-mono text-green-400 mb-4 animate-pulse">{getCountdown(event.votingStart)}</div>
                </>
              )}
              {phase === 'voting' && (
                <>
                  <h2 className="text-xl text-white mb-2">Voting ends in:</h2>
                  <div className="text-3xl font-mono text-green-400 mb-4 animate-pulse">{getCountdown(event.votingEnd)}</div>
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full px-8 py-3 mt-4 text-lg font-bold shadow-lg animate-bounce">
                      Voter Login
                    </Button>
                  </Link>
                </>
              )}
              {phase === 'completed' && (
                <>
                  <h2 className="text-xl text-white mb-2">This election event has ended.</h2>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Add CSS for glow and fadeIn animations */}
      <style jsx global>{`
        .animate-glow {
          box-shadow: 0 0 40px 0 #6366f1aa, 0 0 80px 0 #f43f5e55;
          animation: glowPulse 2.5s infinite alternate;
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 40px 0 #6366f1aa, 0 0 80px 0 #f43f5e55; }
          100% { box-shadow: 0 0 60px 10px #f43f5e99, 0 0 120px 20px #6366f1cc; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;

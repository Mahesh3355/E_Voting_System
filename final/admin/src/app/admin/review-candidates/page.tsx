"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, Users } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
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
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"><span className="text-2xl">👥</span></div>
      <span className="text-green-600 font-semibold mt-2">Registration</span>
    </div>
    <div className="h-1 w-8 bg-green-400 rounded" />
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><span className="text-2xl">📅</span></div>
      <span className="text-blue-600 font-semibold mt-2">Review</span>
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

const ReviewCandidatesPage = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const votingStart = searchParams.get("votingStart");
  const votingEnd = searchParams.get("votingEnd");
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(new Date(votingStart || "")));
  const router = useRouter();
  const [showApproved, setShowApproved] = useState(false);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [buttonLoading, setButtonLoading] = useState<{ [key: string]: 'approve' | 'reject' | null }>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!votingStart) return;
    const target = new Date(votingStart);
    if (isNaN(target.getTime())) return;

    const interval = setInterval(() => {
      const t = getTimeLeft(target);
      setTimeLeft(t);
      const msLeft = target.getTime() - Date.now();
      if (msLeft <= 0) {
        router.push(`/admin/voting-phase?votingStart=${encodeURIComponent(votingStart || '')}&votingEnd=${encodeURIComponent(votingEnd || '')}&title=${encodeURIComponent(title || '')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [votingStart, votingEnd, title, router]);

  // Fetch pending candidates from backend
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/candidate/pending");
        const data = await res.json();
        if (res.ok && data.success) {
          setPending(data.candidates);
        } else {
          setError(data.message || "Failed to fetch candidates.");
        }
      } catch (err) {
        setError("Failed to connect to server.");
      }
    };
    fetchCandidates();
  }, []);

  // Approve candidate
  const handleApprove = async (idx: number, id: string) => {
    setButtonLoading(prev => ({ ...prev, [id]: 'approve' }));
    try {
      const res = await fetch(`http://localhost:5000/api/candidate/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApproved(prev => [...prev, data.candidate]);
        setPending(prev => prev.filter((c, i) => i !== idx));
      } else {
        setError(data.message || 'Failed to approve candidate.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
    setButtonLoading(prev => ({ ...prev, [id]: null }));
  };

  // Reject candidate
  const handleReject = async (idx: number, id: string) => {
    setButtonLoading(prev => ({ ...prev, [id]: 'reject' }));
    try {
      const res = await fetch(`http://localhost:5000/api/candidate/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPending(prev => prev.filter((c, i) => i !== idx));
      } else {
        setError(data.message || 'Failed to reject candidate.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
    setButtonLoading(prev => ({ ...prev, [id]: null }));
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen w-full flex flex-col items-center py-8 px-2 pt-24 bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a]">
        {title && (
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 text-center drop-shadow-lg tracking-tight">{title}</h1>
        )}
        <div className="w-full max-w-4xl">
          <Stepper />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key="review-candidates-main"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-full max-w-6xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 flex flex-col items-center mb-10 mt-2"
          >
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20 flex items-center justify-center mb-6 shadow-lg border-4 border-white/20 backdrop-blur-md">
                <Users className="w-14 h-14 text-yellow-300" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Review Candidates</h2>
              <p className="text-lg text-gray-300 text-center">Review and approve candidate registrations</p>
            </div>
            <div className="w-full bg-white/10 rounded-2xl p-10 flex flex-col items-center border border-white/20 shadow-lg backdrop-blur-xl">
              <Users className="w-12 h-12 text-yellow-300 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Candidate Review</h3>
              <p className="text-yellow-200 text-center text-lg">Review and approve candidate registrations before voting begins.</p>
            </div>
            <div className="w-full flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 bg-white/10 border border-yellow-400/30 rounded-2xl p-6 flex flex-col items-center shadow-md">
                <span className="text-3xl font-bold text-yellow-300">{pending.length}</span>
                <span className="text-lg text-yellow-300">Pending Review</span>
              </div>
              <div className="flex-1 bg-white/10 border border-green-400/30 rounded-2xl p-6 flex flex-col items-center shadow-md">
                <span className="text-3xl font-bold text-green-300">{approved.length}</span>
                <span className="text-lg text-green-300">Approved</span>
              </div>
            </div>
            <div className="w-full mb-10">
              <h3 className="text-xl font-bold mb-4 text-yellow-200 flex items-center gap-2">Pending Review <span className="text-base font-normal text-gray-400">({pending.length})</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pending.map((c, i) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/10 border border-yellow-400/20 rounded-2xl p-8 min-h-[220px] flex flex-col gap-2 shadow transition-transform hover:scale-[1.025] hover:shadow-lg break-words w-full max-w-full"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {c.profilePicUrl ? (
                        <img
                          src={`http://localhost:5000${c.profilePicUrl}`}
                          alt={c.name + " profile"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-900 bg-blue-900"
                        />
                      ) : (
                      <span className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 text-2xl">👤</span>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-white break-words text-lg md:text-xl">{c.name}</div>
                        <div className="text-sm text-gray-300 flex items-center gap-1 break-all"><span>📧</span>{c.email}</div>
                        <div className="text-sm text-gray-300 flex items-center gap-1 break-all"><span>🎓</span>{c.degree} - {c.branch}, Year {c.year}</div>
                        <div className="text-sm text-gray-300 flex items-center gap-1 break-all"><span>🏠</span>{c.address}</div>
                        <div className="text-sm text-gray-300 flex items-center gap-1 break-all"><span>📱</span>{c.phone}</div>
                      </div>
                      <span className="ml-auto bg-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>
                    </div>
                    <div className="font-semibold text-gray-200 mt-2">🏅 Achievements & Awards</div>
                    <div className="text-gray-300 text-sm mb-2 break-words whitespace-pre-line">{c.achievements}</div>
                    <div className="font-semibold text-gray-200">🧑‍💼 Experience & Leadership</div>
                    <div className="text-gray-300 text-sm mb-2 break-words whitespace-pre-line">{c.experience}</div>
                    <div className="font-semibold text-gray-200">📝 Manifesto</div>
                    <div className="text-gray-300 text-sm mb-2 break-words whitespace-pre-line">{c.manifestoUrl}</div>
                    <div className="font-semibold text-gray-200">🎯 Position Applied</div>
                    <div className="text-gray-300 text-sm mb-2 break-words whitespace-pre-line">{c.position}</div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                      <button
                        className={`flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-lg py-2 font-semibold flex items-center justify-center gap-2 shadow transition-transform hover:scale-105 active:scale-95 ${buttonLoading[c._id] === 'approve' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={() => handleApprove(i, c._id)}
                        disabled={!!buttonLoading[c._id]}
                      >
                        {buttonLoading[c._id] === 'approve' ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <span>✔️</span>}
                        Approve
                      </button>
                      <button
                        className={`flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg py-2 font-semibold flex items-center justify-center gap-2 shadow transition-transform hover:scale-105 active:scale-95 ${buttonLoading[c._id] === 'reject' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={() => handleReject(i, c._id)}
                        disabled={!!buttonLoading[c._id]}
                      >
                        {buttonLoading[c._id] === 'reject' ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <span>❌</span>}
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="w-full flex justify-center mb-8">
              <button
                className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 text-lg ${showApproved ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/10 text-blue-300 hover:bg-blue-900/30'}`}
                onClick={() => setShowApproved(v => !v)}
              >
                {showApproved ? 'Hide Approved Candidates' : 'Show Approved Candidates'}
              </button>
            </div>
            {showApproved && (
              <div className="w-full mb-8 animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-green-200 flex items-center gap-2">Approved Candidates <span className="text-base font-normal text-gray-400">({approved.length})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {approved.map((c, i) => (
                    <div key={i} className="bg-white/10 border border-green-400/20 rounded-2xl p-8 min-h-[220px] flex flex-col gap-2 shadow transition-transform hover:scale-[1.025] hover:shadow-lg break-words w-full max-w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 text-2xl">👤</span>
                        <div className="min-w-0">
                          <div className="font-bold text-white break-words text-lg md:text-xl">{c.name}</div>
                          <div className="text-sm text-gray-300 flex items-center gap-1 break-all"><span>📧</span>{c.email}</div>
                        </div>
                        <span className="ml-auto bg-green-400/20 text-green-200 px-3 py-1 rounded-full text-xs font-semibold">Approved</span>
                      </div>
                      <div className="font-semibold text-gray-200">📄 Campaign Description</div>
                      <div className="text-gray-300 text-sm mb-2 break-words whitespace-pre-line">{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="w-full flex justify-center mt-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 text-lg font-semibold shadow transition-transform hover:scale-105 active:scale-95"
                onClick={() => router.push(`/admin/voting-phase?votingStart=${encodeURIComponent(votingStart || '')}&votingEnd=${encodeURIComponent(votingEnd || '')}&title=${encodeURIComponent(title || '')}`)}
              >
                Proceed to Voting Phase
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default ReviewCandidatesPage; 
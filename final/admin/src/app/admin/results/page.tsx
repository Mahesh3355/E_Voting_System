"use client";
import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE_URL = "http://localhost:5000";

// Define the expected ElectionResults type
interface ElectionResults {
  positions: string[];
  winnerNames: string[];
  winningVoteCounts: number[];
  isTied: boolean[];
  resultHashes: string[];
  candidates: { [key: string]: { name: string; votes: number }[] };
}

const ResultsPage = () => {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [published, setPublished] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Poll for latest results every minute
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/blockchain/latest-archived-result`
        );
        const data = await res.json();
        if (data.success && data.results) {
          setResults(data.results);
        } else {
          setResults(null);
        }
      } catch {
        setResults(null);
      }
    };
    fetchResults(); // Initial fetch
    const interval = setInterval(fetchResults, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (!results) return null;

  // Helper functions
  const calculateTotalVotes = () => {
    if (!results) return 0;
    return results.winningVoteCounts.reduce(
      (sum: number, votes: number) => sum + Number(votes),
      0
    );
  };
  const getWinners = () => {
    if (!results) return [];
    return results.positions
      .map((position: string, index: number) => ({
        position,
        name: results.winnerNames[index],
        votes: Number(results.winningVoteCounts[index]),
        isTied: results.isTied[index],
        hash: results.resultHashes[index],
      }))
      .filter((winner) => String(winner.name).toLowerCase() !== "no votes");
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen w-full flex flex-col items-center py-12 px-2 pt-24 bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a]">
        {/* Statistics */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-blue-300/40 hover:z-10">
            <span className="text-4xl font-extrabold text-blue-300 mb-2 drop-shadow font-sans">
              {results.positions.length}
            </span>
            <span className="text-base text-blue-300 font-semibold tracking-wide font-sans">
              Positions
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-purple-300/40 hover:z-10">
            <span className="text-4xl font-extrabold text-purple-300 mb-2 drop-shadow font-sans">
              {calculateTotalVotes()}
            </span>
            <span className="text-base text-purple-300 font-semibold tracking-wide font-sans">
              Total Votes Cast
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-yellow-300/40 hover:z-10">
            <span className="text-4xl font-extrabold text-yellow-300 mb-2 drop-shadow font-sans">
              {getWinners().length}
            </span>
            <span className="text-base text-yellow-300 font-semibold tracking-wide font-sans">
              Winners
            </span>
          </div>
        </div>
        {/* Winners Display */}
        <div className="w-full max-w-3xl bg-gradient-to-br from-[#232946] to-[#121629] rounded-3xl border border-blue-400/30 p-10 shadow-2xl mb-12">
          <h3 className="text-3xl font-extrabold text-blue-200 mb-8 tracking-tight drop-shadow font-sans flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-700 text-white shadow-lg text-2xl">
              🏆
            </span>
            Election Winners
          </h3>
          <div className="grid gap-6 w-full max-w-2xl">
            {getWinners().map((winner, index) => (
              <div
                key={index}
                className="bg-white/10 rounded-2xl p-6 border-l-8 border-blue-400 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-blue-400/40 z-10"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="text-2xl font-bold text-blue-200 mb-1 font-sans flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                    {winner.position}
                  </h4>
                  <p className="text-white text-lg font-semibold mb-1 font-sans flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-400 text-white flex items-center justify-center text-base">
                      👑
                    </span>
                    {winner.name}
                  </p>
                  {winner.name !== "No Votes" && winner.votes > 0 && (
                    <p className="text-blue-200 font-medium font-sans">
                      Won with {winner.votes} votes
                    </p>
                  )}
                  {winner.isTied && (
                    <p className="text-yellow-400 font-medium mt-1 font-sans flex items-center gap-2">
                      <span>⚠️</span> Tie detected
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end justify-between gap-2">
                  <p className="text-xs text-gray-400 font-sans">Hash</p>
                  <p className="text-xs text-gray-500 font-mono break-all max-w-xs">
                    {winner.hash}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Detailed Results */}
        <div className="w-full max-w-3xl bg-gradient-to-br from-[#232946] to-[#121629] rounded-3xl border border-blue-400/30 p-10 shadow-2xl mb-12">
          <h2 className="text-2xl font-bold mb-8 text-blue-200 text-center tracking-tight drop-shadow font-sans">
            Detailed Results
          </h2>
          <div className="space-y-8">
            {results.positions.map((position, index) => (
              <div
                key={position}
                className="bg-white/10 rounded-2xl p-6 border-l-8 border-blue-400 shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-blue-400/40 z-10"
              >
                <h3 className="text-xl font-bold text-blue-200 mb-4">
                  {position}
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold text-sm shadow">
                    🏆 Winner
                  </span>
                  <span className="text-lg font-bold text-white">
                    {results.winnerNames[index]}
                  </span>
                  <span className="ml-auto text-green-300 font-bold">
                    {results.winningVoteCounts[index]} votes
                  </span>
                </div>
                {results.isTied[index] && (
                  <p className="text-yellow-400 font-medium mt-2 flex items-center gap-2">
                    <span>⚠️</span> This position resulted in a tie
                  </p>
                )}
                <div className="text-xs text-gray-400 font-mono mt-2">
                  Result Hash: {results.resultHashes[index]}
                </div>
                {results.candidates && results.candidates[position] && (
                  <div className="mt-6">
                    <p className="font-bold text-blue-200 mb-2">
                      All Candidates:
                    </p>
                    <ul className="divide-y divide-blue-800">
                      {results.candidates[position].map((c, i) => (
                        <li
                          key={i}
                          className={`flex justify-between py-2 px-2 rounded ${
                            c.name === results.winnerNames[index]
                              ? "bg-gradient-to-r from-green-500/30 to-blue-500/20 text-white font-semibold"
                              : "text-gray-200"
                          }`}
                        >
                          <span>{c.name}</span>
                          <span>{c.votes} votes</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Centered Publish Button at End */}
        <div className="w-full flex justify-center mt-12 mb-8">
          <button
            className="relative group overflow-hidden flex items-center gap-3 px-12 py-5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-800 shadow-lg text-white text-2xl font-semibold font-sans tracking-wide transition-transform duration-200 border-none outline-none focus:ring-4 focus:ring-blue-300 hover:scale-105 hover:shadow-blue-400/40 z-10"
            onClick={() => setShowModal(true)}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-800 opacity-0 group-hover:opacity-20 group-focus:opacity-30 blur-lg transition-all duration-300 pointer-events-none" />
            <span className="z-10">Publish Results</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 drop-shadow-lg"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span className="absolute left-1/2 top-1/2 w-0 h-0 bg-white/30 rounded-full opacity-0 group-active:opacity-100 group-active:w-36 group-active:h-36 group-active:animate-ping pointer-events-none" />
          </button>
        </div>
        {/* Modal for publish confirmation */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div
              className="relative bg-gradient-to-br from-[#0b0f1a]/90 via-[#23263a]/90 to-[#181e28]/90 rounded-3xl shadow-2xl border-4 border-blue-400/40 p-12 max-w-xl w-full flex flex-col items-center text-center overflow-hidden backdrop-blur-xl"
              style={{
                boxShadow: "0 0 48px 8px #38bdf855, 0 0 96px 32px #2563eb33",
              }}
            >
              {/* Burst/Confetti effect */}
              <span className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="text-blue-400 text-6xl animate-pulse drop-shadow-xl">
                  🎉
                </span>
              </span>
              <h2 className="text-4xl font-extrabold text-blue-200 mb-4 mt-20 animate-bounce drop-shadow-lg">
                Results Published!
              </h2>
              <p className="text-lg text-white/90 mb-6">
                The election results have been successfully published and are
                now publicly available.
              </p>
              <blockquote className="italic text-blue-200 text-xl mb-6 border-l-4 border-blue-400 pl-4">
                "Democracy is not just the right to vote, it is the right to
                live in dignity."
                <br />
                <span className="text-blue-400 font-bold">- Naomi Klein</span>
              </blockquote>
              <p className="text-lg text-blue-200 mb-8">
                Thank you for participating and making your voice count!
              </p>
              <button
                onClick={() => {
                  setShowModal(false);
                  setPublished(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white rounded-full px-10 py-3 text-lg font-bold shadow-xl border-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
              >
                Continue
              </button>
              {/* Simple burst/confetti effect using animated circles */}
              <div className="pointer-events-none absolute inset-0 z-0">
                {[...Array(18)].map((_, i) => (
                  <span
                    key={i}
                    className={`absolute rounded-full opacity-60 animate-pop-burst`}
                    style={{
                      width: `${16 + Math.random() * 24}px`,
                      height: `${16 + Math.random() * 24}px`,
                      background: `hsl(${Math.floor(
                        Math.random() * 360
                      )},80%,70%)`,
                      top: `${40 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                      animationDelay: `${Math.random() * 0.7}s`,
                    }}
                  />
                ))}
              </div>
              <style jsx global>{`
                @keyframes pop-burst {
                  0% {
                    transform: scale(0.2) translateY(0);
                    opacity: 0.7;
                  }
                  60% {
                    transform: scale(1.2) translateY(-30px);
                    opacity: 1;
                  }
                  100% {
                    transform: scale(1) translateY(-60px);
                    opacity: 0;
                  }
                }
                .animate-pop-burst {
                  animation: pop-burst 1.2s cubic-bezier(0.61, -0.01, 0.7, 1.01)
                    forwards;
                }
              `}</style>
            </div>
          </div>
        )}
        {/* Published banner */}
        {published && (
          <div className="w-full max-w-3xl mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-800 rounded-2xl border border-blue-400/40 px-8 py-5 shadow-lg text-white text-lg font-semibold font-sans animate-fade-in">
                <span className="text-2xl text-green-300">✅</span>
                <span className="text-white font-bold">
                  Results are now published and visible to everyone!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResultsPage;

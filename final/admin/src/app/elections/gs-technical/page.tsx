"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import blockchainService from "@/services/blockchain";

const GSTechnicalCandidates: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [voted, setVoted] = useState(false);
  const votedSectionRef = useRef<HTMLDivElement>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [accountAddress, setAccountAddress] = useState("");
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch current election event
    const fetchEvent = async () => {
      setEventLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/events/current");
        const data = await res.json();
        setEvent(data.event);
      } catch (err) {
        setEvent(null);
      }
      setEventLoading(false);
    };
    fetchEvent();

    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:5000/api/candidate/approved?position=GS(TECHNICAL)"
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setCandidates(data.candidates);
        } else {
          setError(data.message || "Failed to fetch candidates.");
        }
      } catch (err) {
        setError("Failed to connect to server.");
      }
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    async function checkIfVoted() {
      if (!accountAddress || !event?.electionId) return;
      const position = "GS(TECHNICAL)";
      try {
        const res = await fetch(
          `/api/blockchain/vote-status?electionId=${
            event.electionId
          }&voterAddress=${accountAddress}&position=${encodeURIComponent(
            position
          )}`
        );
        const data = await res.json();
        setVoted(data.hasVoted);
      } catch (err) {
        // Optionally handle error
      }
    }
    checkIfVoted();
  }, [accountAddress, event]);

  const handleVoteClick = (candidate: any) => {
    if (!voted) {
      setSelectedCandidate(candidate);
      setShowModal(true);
    }
  };

  const handleSubmitVote = async () => {
    setVoteError("");
    setVoteSuccess("");
    // Validate Ethereum address
    if (!accountAddress || !/^0x[a-fA-F0-9]{40}$/.test(accountAddress)) {
      setVoteError("Please enter a valid Ethereum account address.");
      return;
    }
    // Validate candidate
    if (!selectedCandidate || !selectedCandidate.candidateNumber) {
      setVoteError("Please select a valid candidate.");
      return;
    }
    // Validate electionId
    if (!event?.electionId || isNaN(event.electionId)) {
      setVoteError("Election ID is missing or invalid.");
      return;
    }
    // Validate voting period
    const now = Math.floor(Date.now() / 1000);
    if (
      event.votingStart &&
      event.votingEnd &&
      (now < event.votingStart || now > event.votingEnd)
    ) {
      setVoteError("Voting is not active for this election.");
      return;
    }
    try {
      const result = await blockchainService.castVote(
        accountAddress,
        selectedCandidate.candidateNumber,
        event.electionId
      );
      if (result.success) {
        setVoteSuccess(
          "Vote cast successfully! Transaction hash: " + result.transactionHash
        );
        setTransactionHash(result.transactionHash || "");
        setShowModal(false);
        setVoted(true);
        setTimeout(() => {
          votedSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        setVoteError(result.message || "Failed to cast vote.");
      }
    } catch (err) {
      setVoteError("Failed to cast vote. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100 font-sans">
      {/* Header */}
      <header className="backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
            <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
              VoteChain
            </h2>
          </div>
          <Link href="/votenow">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full">
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 tracking-wide drop-shadow-lg text-center font-poppins mb-10">
          GS (Technical) Elections
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 place-items-center">
          {loading || eventLoading ? (
            <div className="text-white text-lg col-span-2">
              Loading candidates...
            </div>
          ) : error ? (
            <div className="text-red-400 text-lg col-span-2">{error}</div>
          ) : candidates.length === 0 ? (
            (() => {
              if (!event) {
                return (
                  <div className="text-white/70 text-lg col-span-2">
                    No election event found.
                  </div>
                );
              }
              const now = new Date();
              const regEnd = new Date(event.registrationEnd);
              const voteStart = new Date(event.votingStart);
              const voteEnd = new Date(event.votingEnd);
              if (now < voteStart) {
                return (
                  <div className="text-white/70 text-lg col-span-2">
                    No approved candidates for this position yet.
                  </div>
                );
              } else if (now >= voteStart && now <= voteEnd) {
                return (
                  <div className="text-white/70 text-lg col-span-2">
                    No one applied for this position.
                  </div>
                );
              } else {
                return (
                  <div className="text-white/70 text-lg col-span-2">
                    No candidates for this position.
                  </div>
                );
              }
            })()
          ) : (
            candidates.map((candidate) => (
              <motion.div
                key={candidate._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 32px 0 rgba(93, 188, 252, 0.25)",
                  filter: "brightness(1.08)",
                }}
                transition={{ duration: 0.5 }}
                className="bg-[#1C1F2E]/80 backdrop-blur-lg border border-blue-900 rounded-2xl shadow-2xl px-8 py-10 w-full max-w-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-4 mb-8">
                  {candidate.profilePicUrl ? (
                    <img
                      src={`http://localhost:5000${candidate.profilePicUrl}`}
                      alt={candidate.name + " profile"}
                      className="w-28 h-28 rounded-full border border-indigo-500 shadow object-cover transition duration-200 hover:ring-4 hover:ring-blue-400/40"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="w-28 h-28 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 text-4xl">
                      👤
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 tracking-wide drop-shadow-lg text-center mb-2">
                    {candidate.name}
                  </h2>
                  <p className="text-sm text-white/70">
                    {candidate.degree} - {candidate.branch}, Year{" "}
                    {candidate.year}
                  </p>
                </div>
                <ul className="space-y-4 text-sm text-white text-left pl-2">
                  <li>
                    <strong className="text-indigo-300">
                      Achievements & Awards:
                    </strong>
                    <br />
                    {candidate.achievements}
                  </li>
                  <li>
                    <strong className="text-indigo-300">
                      Experience & Leadership:
                    </strong>
                    <br />
                    {candidate.experience}
                  </li>
                  <li>
                    <strong className="text-indigo-300">Manifesto:</strong>
                    <br />
                    {candidate.manifestoUrl}
                  </li>
                </ul>
                <div className="mt-8 flex justify-center">
                  <Button
                    className={`rounded-full px-8 py-2 ${
                      voted
                        ? "bg-gray-500 cursor-not-allowed text-white/50"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                    onClick={() => handleVoteClick(candidate)}
                    disabled={voted}
                  >
                    Vote
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {voted && (
          <motion.div
            ref={votedSectionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 text-center"
          >
            <p className="text-2xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white rounded-lg shadow-lg p-6 mb-4 flex flex-col items-center animate-pulse">
              🗳️ Just cast your first-ever vote!
              <br />
              It’s not just a right — it’s a powerful moment.
              <br />
              Here’s to being heard. 💬✅
              <br />
              <span className="mt-2 text-base font-medium text-yellow-200">
                #FirstVote #ProudVoter #DemocracyInAction
              </span>
            </p>
            {transactionHash && (
              <div className="mt-4 p-4 bg-[#181c2a] border border-blue-700 rounded-xl shadow text-white/90 max-w-xl mx-auto flex flex-col items-center">
                <span className="font-semibold text-blue-400">
                  Transaction Hash:
                </span>
                <div className="break-all text-blue-300 text-sm mt-1 flex items-center gap-2">
                  <span>{transactionHash}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transactionHash);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    }}
                    className="ml-2 w-8 h-8 flex items-center justify-center hover:text-blue-400 transition focus:outline-none"
                    title="Copy to clipboard"
                    aria-label="Copy transaction hash"
                  >
                    {copied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-green-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-blue-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 15.75H6A2.25 2.25 0 013.75 13.5v-9A2.25 2.25 0 016 2.25h9A2.25 2.25 0 0117.25 4.5v2.25M8.25 15.75A2.25 2.25 0 0010.5 18h6A2.25 2.25 0 0018.75 15.75v-6A2.25 2.25 0 0016.5 7.5h-6A2.25 2.25 0 008.25 9.75v6z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            <Link href="/votenow#verify">
              <Button
                variant="none"
                className="border border-green-500 text-green-500 hover:bg-green-500/30 hover:text-white rounded-full px-6 py-2 transition-colors"
              >
                Verify
              </Button>
            </Link>
          </motion.div>
        )}

        {showModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#0e111a] text-white rounded-2xl px-6 py-8 w-full max-w-md border border-white/10 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-center text-white">
                You are casting your vote to :
                <span className="block text-center text-green-300 font-bold text-2xl mt-2">
                  {selectedCandidate.name}
                </span>
              </h3>
              <label className="block text-sm mb-2 text-white/80">
                Enter your Hardhat account address:
              </label>
              <input
                type="text"
                placeholder="e.g. 0xABC123..."
                className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-white/50"
                value={accountAddress}
                onChange={(e) => setAccountAddress(e.target.value)}
              />
              {voteError && (
                <div className="text-red-400 text-sm mt-2">{voteError}</div>
              )}
              {voteSuccess && (
                <div className="text-green-400 text-sm mt-2">{voteSuccess}</div>
              )}
              <div className="mt-6 flex justify-end gap-4">
                <Button
                  variant="none"
                  className="text-white/70 hover:text-red-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                  onClick={handleSubmitVote}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GSTechnicalCandidates;

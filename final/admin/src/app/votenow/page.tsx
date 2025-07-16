"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Home,
  BellRing,
  CheckSquare,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import blockchainService from "@/services/blockchain";

const VoteNowPage: React.FC = () => {
  const [active, setActive] = useState<string>("");
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [voter, setVoter] = useState<any>(null);

  // Transaction verification states
  const [transactionHash, setTransactionHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Helper: Validate Ethereum transaction hash
  function isValidTxHash(hash: string) {
    return /^0x([A-Fa-f0-9]{64})$/.test(hash);
  }

  // Handle transaction verification
  const handleVerifyTransaction = async () => {
    if (!transactionHash.trim()) {
      setVerificationResult({
        success: false,
        message: "Please enter a transaction hash.",
      });
      return;
    }

    if (!isValidTxHash(transactionHash.trim())) {
      setVerificationResult({
        success: false,
        message: "Invalid transaction hash format. Please check and try again.",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await blockchainService.verifyTransactionHash(
        transactionHash.trim()
      );
      setVerificationResult(result);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        success: false,
        message: "Failed to verify transaction. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerifyTransaction();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("voter");
    if (stored) {
      setVoter(JSON.parse(stored));
    }
  }, []);

  const navButtons = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    {
      id: "elections",
      icon: CheckSquare,
      label: "Elections",
      href: "#elections",
    },
    { id: "verify", icon: ShieldCheck, label: "Verify", href: "#verify" },
    { id: "events", icon: BellRing, label: "Events", href: "/events" },
  ];

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

          {/* Nav */}
          <div className="hidden sm:flex gap-8">
            {navButtons.map(({ id, icon: Icon, label, href }) => {
              const isActive = active === id;
              return (
                <Link key={id} href={href}>
                  <div
                    onClick={() => {
                      setActive(id);
                      setTimeout(() => setActive(""), 1000);
                    }}
                    className={`flex items-center gap-2 cursor-pointer transition-all duration-200 group ${
                      isActive ? "text-red-400 font-semibold" : "text-white/80"
                    } hover:text-red-400`}
                  >
                    <Icon
                      className={`w-5 h-5 group-hover:text-red-400 ${
                        isActive ? "text-red-400" : "text-white/70"
                      }`}
                    />
                    <span className="text-sm transition-all duration-200">
                      {label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => setAccountOpen(!accountOpen)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              Account
            </Button>
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute right-0 mt-2 w-36 rounded-md px-3 py-1.5 z-50
                  bg-gradient-to-t from-white/10 via-white/5 to-transparent
                  backdrop-blur-lg border border-white/10
                  flex flex-col space-y-1"
              >
                <Link href="/votenow/account">
                  <div className="text-white/80 text-sm py-1 cursor-pointer transition duration-200 hover:text-red-400">
                    Details
                  </div>
                </Link>
                <Link href="/login">
                  <div className="text-white/80 text-sm py-1 cursor-pointer transition duration-200 hover:text-red-400">
                    Logout
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center gap-12">
        {/* Welcome */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-red-400 text-center font-poppins"
        >
          {`Welcome, ${voter?.fullName || "Voter"}`}
        </motion.h1>

        {/* Rules Card */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          whileHover={{
            scale: 1.03,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 20,
              duration: 0.2,
            },
          }}
          transition={{
            duration: 0.45,
            ease: [0.42, 0, 0.58, 1],
          }}
          viewport={{ once: true }}
          className="bg-white/2 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-8 text-center 
  w-full max-w-2xl shadow-md shadow-red-500/40 hover:shadow-white/60 transition-all duration-150"
        >
          <h2 className="text-2xl font-semibold text-indigo-400 text-left w-full mb-4">
            Voting Rules
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white text-left">
            <li>
              Visit the official VoteChain website and log in using your
              verified student credentials.
            </li>
            <li>
              Navigate to the "Elections" section from the main navigation bar.
            </li>
            <li>
              Click on the "Start Voting" button to begin the voting process.
            </li>
            <li>
              Verify your identity through your assigned blockchain wallet or
              secure account.
            </li>
            <li>Review the list of candidates and their details carefully.</li>
            <li>
              Select your preferred candidate by clicking their corresponding
              vote button.
            </li>
            <li>
              Confirm your vote; it will be encrypted and signed using your
              private key.
            </li>
            <li>
              The vote is then submitted to the blockchain network and recorded
              immutably.
            </li>
            <li>
              You will receive a transaction ID as proof that your vote was
              registered successfully.
            </li>
            <li>
              Once voting ends, results will be published on the blockchain for
              public viewing.
            </li>
          </ul>
        </motion.div>

        {/* Elections Section */}
        <motion.section
          id="elections"
          className="scroll-mt-32 max-w-7xl mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="scroll-mt-32 w-full text-center text-4xl font-bold mb-10"
            style={{ color: "#F43F5E", fontFamily: "'Poppins', sans-serif" }}
          >
            Elections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
            {[
              {
                title: "Vice-president",
                emoji: "👔",
                href: "/elections/vice-president",
              },
              {
                title: "GS (GYMKHANA)",
                emoji: "🏛️",
                href: "/elections/gs-gymkhana",
              },
              {
                title: "GS (TECHNICAL)",
                emoji: "🖥️",
                href: "/elections/gs-technical",
              },
              {
                title: "GS (CULTURAL)",
                emoji: "🥁",
                href: "/elections/gs-cultural",
              },
              {
                title: "GS (SPORTS)",
                emoji: "🏆",
                href: "/elections/gs-sports",
              },
            ].map((position, index) => (
              <Link key={index} href={position.href} passHref>
                <motion.div
                  className="w-full max-w-[320px]
           bg-gradient-to-br from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.08)] text-white
           border border-white/20
           rounded-2xl p-6
           shadow-[0_12px_24px_rgba(255,255,255,0.12)]
           backdrop-blur-md
           transition-all duration-150
           cursor-pointer flex flex-col justify-start items-start gap-2"
                  whileHover={{
                    y: -12,
                    borderColor: "rgba(244,63,94,0.5)",
                    boxShadow: "0 12px 32px rgba(244,63,94,0.25)",
                    transition: {
                      type: "spring",
                      duration: 0.05,
                      ease: "easeOut",
                    },
                  }}
                >
                  <div className="text-5xl mb-4">{position.emoji}</div>
                  <h3 className="text-xl font-semibold text-indigo-500 mb-2">
                    {position.title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    Click to vote for {position.title} elections.
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/*Verify Vote*/}
        <motion.section
          id="verify"
          className="scroll-mt-32 max-w-5xl mx-auto px-6 py-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center text-emerald-400 mb-6 font-poppins">
            Verify Your Vote
          </h2>
          <p className="text-center text-white/80 max-w-xl mx-auto text-sm">
            Enter your transaction ID to verify your vote on the blockchain.
          </p>

          {/* Input Section */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <input
              type="text"
              placeholder="Enter Transaction Hash (0x...)"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full sm:w-96 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isVerifying}
            />
            <Button
              onClick={handleVerifyTransaction}
              disabled={isVerifying || !transactionHash.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify
                </>
              )}
            </Button>
          </div>

          {/* Result Display */}
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              whileHover={{
                scale: 1.02,
                boxShadow:
                  verificationResult.success && verificationResult.isSuccess
                    ? "0 0 40px 0 rgba(16, 185, 129, 0.25)"
                    : "0 0 40px 0 rgba(239, 68, 68, 0.25)",
              }}
              className="mt-6 max-w-2xl mx-auto"
            >
              <div
                className={`w-full border backdrop-blur-lg rounded-2xl shadow-2xl transition duration-300 ${
                  verificationResult.success && verificationResult.isSuccess
                    ? "border-emerald-900 bg-[#1C1F2E]/60"
                    : "border-red-900 bg-[#1C1F2E]/60"
                }`}
              >
                <div className="p-10 sm:p-12">
                  <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="flex items-center gap-3">
                      {verificationResult.success &&
                      verificationResult.isSuccess ? (
                        <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                          <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="p-3 rounded-full bg-red-500/20 border border-red-400/30">
                          <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                      )}
                      <h2 className="text-3xl font-extrabold text-white drop-shadow-md tracking-wide">
                        {verificationResult.success &&
                        verificationResult.isSuccess
                          ? "Transaction Verified"
                          : "Verification Failed"}
                      </h2>
                    </div>
                    <p className="text-sm text-blue-300 font-medium text-center">
                      {verificationResult.message}
                    </p>
                  </div>

                  {verificationResult.success &&
                    verificationResult.found &&
                    verificationResult.transaction && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Transaction Hash */}
                        <div
                          className={`rounded-xl p-5 border flex flex-col items-start shadow-md transition ${
                            verificationResult.success &&
                            verificationResult.isSuccess
                              ? "bg-[#2A2D3E]/70 border-emerald-800 hover:border-emerald-500"
                              : "bg-[#2A2D3E]/70 border-red-800 hover:border-red-500"
                          }`}
                        >
                          <span
                            className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                              verificationResult.success &&
                              verificationResult.isSuccess
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            Transaction Hash
                          </span>
                          <span className="text-xs text-blue-300 font-semibold break-all">
                            {verificationResult.transaction.hash}
                          </span>
                        </div>

                        {/* Status */}
                        <div
                          className={`rounded-xl p-5 border flex flex-col items-start shadow-md transition ${
                            verificationResult.success &&
                            verificationResult.isSuccess
                              ? "bg-[#2A2D3E]/70 border-emerald-800 hover:border-emerald-500"
                              : "bg-[#2A2D3E]/70 border-red-800 hover:border-red-500"
                          }`}
                        >
                          <span
                            className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                              verificationResult.success &&
                              verificationResult.isSuccess
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            Status
                          </span>
                          <span
                            className={`text-xl font-extrabold tracking-wide ${
                              verificationResult.transaction.status ===
                              "Success"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {verificationResult.transaction.status}
                          </span>
                        </div>

                        {/* Block Number */}
                        <div
                          className={`rounded-xl p-5 border flex flex-col items-start shadow-md transition ${
                            verificationResult.success &&
                            verificationResult.isSuccess
                              ? "bg-[#2A2D3E]/70 border-emerald-800 hover:border-emerald-500"
                              : "bg-[#2A2D3E]/70 border-red-800 hover:border-red-500"
                          }`}
                        >
                          <span
                            className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                              verificationResult.success &&
                              verificationResult.isSuccess
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            Block Number
                          </span>
                          <span className="text-xl text-white font-extrabold tracking-wide">
                            {verificationResult.transaction.blockNumber}
                          </span>
                        </div>

                        {/* Gas Used */}
                        <div
                          className={`rounded-xl p-5 border flex flex-col items-start shadow-md transition ${
                            verificationResult.success &&
                            verificationResult.isSuccess
                              ? "bg-[#2A2D3E]/70 border-emerald-800 hover:border-emerald-500"
                              : "bg-[#2A2D3E]/70 border-red-800 hover:border-red-500"
                          }`}
                        >
                          <span
                            className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                              verificationResult.success &&
                              verificationResult.isSuccess
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            Gas Used
                          </span>
                          <span className="text-xl text-white font-extrabold tracking-wide">
                            {verificationResult.transaction.gasUsed}
                          </span>
                        </div>

                        {/* From Address */}
                        <div
                          className={`rounded-xl p-5 border flex flex-col items-start shadow-md transition sm:col-span-2 ${
                            verificationResult.success &&
                            verificationResult.isSuccess
                              ? "bg-[#2A2D3E]/70 border-emerald-800 hover:border-emerald-500"
                              : "bg-[#2A2D3E]/70 border-red-800 hover:border-red-500"
                          }`}
                        >
                          <span
                            className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                              verificationResult.success &&
                              verificationResult.isSuccess
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            From Address
                          </span>
                          <span className="text-xs text-blue-300 font-semibold break-all">
                            {verificationResult.transaction.from}
                          </span>
                        </div>

                        {/* To Address */}
                        <div
                          className={`rounded-xl p-5 border flex flex-col items-start shadow-md transition sm:col-span-2 ${
                            verificationResult.success &&
                            verificationResult.isSuccess
                              ? "bg-[#2A2D3E]/70 border-emerald-800 hover:border-emerald-500"
                              : "bg-[#2A2D3E]/70 border-red-800 hover:border-red-500"
                          }`}
                        >
                          <span
                            className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                              verificationResult.success &&
                              verificationResult.isSuccess
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            To Address
                          </span>
                          <span className="text-xs text-blue-300 font-semibold break-all">
                            {verificationResult.transaction.to}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default VoteNowPage;

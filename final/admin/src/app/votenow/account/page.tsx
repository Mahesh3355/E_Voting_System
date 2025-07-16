"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type Voter = {
  fullName: string;
  email: string;
  registrationNumber: string;
  degree: string;
  walletAddress: string;
  isBlockchainRegistered: boolean;
  // add any other fields you use
};

const ProfilePage = () => {
  const [voter, setVoter] = useState<Voter | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("voter");
    if (stored) {
      const { email } = JSON.parse(stored);
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("Fetching voter details for email:", email);
      fetch(
        `${API_BASE_URL}/api/voter/by-email?email=${encodeURIComponent(email)}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("Voter API response:", data);
          if (data.success && data.voter) {
            setVoter(data.voter);
          } else {
            setVoter(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching voter details:", err);
        });
    }
  }, []);

  if (!voter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-white">
        <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
        <p className="mb-6">Please log in to view your profile.</p>
        <Link href="/login">
          <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
            <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
              VoteChain
            </h2>
          </div>
          {/* Back Button */}
          <Link href="/votenow">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full">
              Back
            </Button>
          </Link>
        </div>
      </header>
      {/* Body */}
      <main className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center gap-12 bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] min-h-screen">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 tracking-wide drop-shadow-lg text-center font-poppins mb-10">
          Student Details
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 40px 0 rgba(93, 188, 252, 0.25)",
          }}
        >
          <Card className="w-full max-w-[600px] border border-blue-900 bg-[#1C1F2E]/60 backdrop-blur-lg rounded-2xl shadow-2xl transition duration-300">
            <CardContent className="p-10 sm:p-12">
              <div className="flex flex-col items-center gap-2 mb-8">
                <h2 className="text-3xl font-extrabold text-white drop-shadow-md tracking-wide">
                  {voter.fullName}
                </h2>
                <p className="text-sm text-blue-300 font-medium break-all">
                  {voter.email}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Scholar ID */}
                <div className="bg-[#2A2D3E]/70 rounded-xl p-5 border border-blue-800 hover:border-blue-500 flex flex-col items-start shadow-md transition">
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-1">
                    Scholar Id
                  </span>
                  <span className="text-xl text-white font-extrabold tracking-wide">
                    {voter.registrationNumber}
                  </span>
                </div>

                {/* Degree */}
                <div className="bg-[#2A2D3E]/70 rounded-xl p-5 border border-blue-800 hover:border-blue-500 flex flex-col items-start shadow-md transition">
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-1">
                    Degree
                  </span>
                  <span className="text-xl text-white font-extrabold tracking-wide">
                    {voter.degree}
                  </span>
                </div>

                {/* Wallet Address */}
                <div className="bg-[#2A2D3E]/70 rounded-xl p-5 border border-blue-800 hover:border-blue-500 flex flex-col items-start shadow-md transition">
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-1">
                    Wallet Address
                  </span>
                  <span className="text-xs text-blue-300 font-semibold break-all flex items-center gap-2 mt-1">
                    {voter.walletAddress}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(voter.walletAddress);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      }}
                      className="ml-2 w-8 h-8 flex items-center justify-center hover:text-blue-400 transition focus:outline-none"
                      title="Copy to clipboard"
                      aria-label="Copy wallet address"
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
                  </span>
                </div>

                {/* Blockchain Registered */}
                <div className="bg-[#2A2D3E]/70 rounded-xl p-5 border border-blue-800 hover:border-blue-500 flex flex-col items-start shadow-md transition">
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-1">
                    Blockchain Registered
                  </span>
                  <span className="text-xl text-green-400 font-extrabold tracking-wide">
                    {voter.isBlockchainRegistered ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;

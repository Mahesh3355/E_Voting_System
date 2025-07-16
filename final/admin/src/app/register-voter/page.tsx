"use client";
import React, { useState, useEffect } from "react";
import { Mail, User, GraduationCap, Hash, Send, ArrowLeft, Shield, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const degrees = [
  "B.Tech", "M.Tech", "MBA", "PhD", "Other"
];

const RegisterVoterPage = () => {
  const [fullName, setFullName] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [email, setEmail] = useState("");
  const [degree, setDegree] = useState("");
  const [errors, setErrors] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpError, setShowOtpError] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    // Scholar ID validation: exactly 7 digits
    if (!/^\d{7}$/.test(scholarId)) {
      setErrorMsg("Scholar ID must be exactly 7 digits");
      return;
    }
    if (!fullName || !email || !degree) {
      setErrorMsg("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voter/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          registrationNumber: scholarId,
          email,
          degree,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpEmail(email);
        setShowOtp(true);
      } else if (data.message && data.message.includes('already registered')) {
        setShowAlreadyRegistered(true);
      } else {
        setErrorMsg(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setErrorMsg("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowOtp(false);
    setOtp("");
    setErrorMsg("");
    setShowOtpError(false);
    setResendMsg("");
  };

  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setShowOtpError(false);
    if (!otp) {
      setErrorMsg("Please enter the OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voter/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail,
          otp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowThankYou(true);
      } else {
        if (data.message && data.message.includes('already registered')) {
          setShowAlreadyRegistered(true);
        } else {
          setErrorMsg(data.message || "OTP verification failed");
        }
      }
    } catch (err) {
      setShowOtpError(true);
      setErrorMsg("OTP verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendMsg("");
    setErrorMsg("");
    setOtp("");
    setShowOtpError(false);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voter/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          registrationNumber: scholarId,
          email: otpEmail,
          degree,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResendMsg("A new OTP has been sent to your email!");
      } else {
        setErrorMsg(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setErrorMsg("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100 font-sans">
      {/* Navbar */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled
          ? "backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm"
          : "bg-gradient-to-r from-[#0b0f1a] to-[#05080f] border-b border-white/10"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showOtp ? (
              <button
                onClick={handleBackToForm}
                className="flex items-center gap-2 text-white/80 hover:text-red-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
            ) : (
              <Link
                href="/signup"
                className="flex items-center gap-2 text-white/80 hover:text-red-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </Link>
            )}
            <div className="flex items-center gap-3">
              <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
              <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
                VoteChain
              </h2>
            </div>
          </div>
          <Link href="/login">
            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 shadow-lg">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 flex flex-col items-center justify-center px-2 py-8 min-h-screen">
        {/* Stepper Indicator */}
        <motion.div
          className="flex items-center justify-center mb-10 gap-8"
          initial={false}
          animate={showOtp ? "otp" : "form"}
        >
          {/* Step 1: Registration Form */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300
              ${!showOtp
                  ? "bg-white/10 border-blue-400 shadow-blue-400/40 ring-2 ring-blue-400/40 animate-pulse"
                  : "bg-white/5 border-white/10"
                }`}
            >
              <User className={`w-7 h-7 ${!showOtp ? "text-blue-300" : "text-gray-400"}`} />
            </div>
            <span
              className={`mt-2 font-semibold text-xs tracking-wide transition-all duration-200
              ${!showOtp ? "text-blue-300" : "text-gray-400"}`}
            >
              Registration
            </span>
          </div>
          <div
            className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300
            ${showOtp
                ? "bg-gradient-to-r from-blue-500 to-blue-300 shadow-blue-400/30"
                : "bg-white/10"
              }`}
          />
          {/* Step 2: OTP Verification */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300
              ${showOtp
                  ? "bg-white/10 border-blue-400 shadow-blue-400/40 ring-2 ring-blue-400/40 animate-pulse"
                  : "bg-white/5 border-white/10"
                }`}
            >
              <Shield className={`w-7 h-7 ${showOtp ? "text-blue-300" : "text-gray-400"}`} />
            </div>
            <span
              className={`mt-2 font-semibold text-xs tracking-wide transition-all duration-200
              ${showOtp ? "text-blue-300" : "text-gray-400"}`}
            >
              OTP Verification
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.7 }}
                className="relative bg-gradient-to-br from-[#0b0f1a]/90 via-[#23263a]/90 to-[#181e28]/90 rounded-3xl shadow-2xl border-4 border-blue-400/40 p-12 max-w-xl w-full flex flex-col items-center text-center overflow-hidden backdrop-blur-xl"
                style={{ boxShadow: '0 0 48px 8px #38bdf855, 0 0 96px 32px #2563eb33' }}
              >
                {/* Burst/Confetti effect */}
                <span className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <Shield className="w-24 h-24 text-blue-400 animate-pulse drop-shadow-xl" />
                </span>
                <h2 className="text-4xl font-extrabold text-blue-200 mb-4 mt-16 animate-bounce drop-shadow-lg">Thank You for Registering!</h2>
                <p className="text-lg text-white/90 mb-6">Your voter registration has been submitted successfully.</p>
                <blockquote className="italic text-blue-200 text-xl mb-6 border-l-4 border-blue-400 pl-4">
                  "The vote is the most powerful instrument ever devised by man for breaking down injustice and destroying the terrible walls which imprison men because they are different from other men."<br />
                  <span className="text-blue-400 font-bold">- Lyndon B. Johnson</span>
                </blockquote>
                <p className="text-lg text-blue-200 mb-8">Thank you for participating in the democratic process. Your voice matters!</p>
                <motion.button
                  whileHover={{ scale: 1.08, y: -2, boxShadow: '0 8px 32px 0 #2563eb55' }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white rounded-full px-10 py-3 text-lg font-bold shadow-xl border-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                  onClick={() => window.location.href = '/'}
                >
                  <CheckCircle className="w-6 h-6 mr-1 -ml-2 text-emerald-400" />
                  Return to Home
                </motion.button>
                {/* Simple burst/confetti effect using animated circles */}
                <div className="pointer-events-none absolute inset-0 z-0">
                  {[...Array(18)].map((_, i) => (
                    <span
                      key={i}
                      className={`absolute rounded-full opacity-60 animate-pop-burst`}
                      style={{
                        width: `${16 + Math.random() * 24}px`,
                        height: `${16 + Math.random() * 24}px`,
                        background: `hsl(${Math.floor(Math.random() * 360)},80%,70%)`,
                        top: `${40 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`,
                        animationDelay: `${Math.random() * 0.7}s`,
                      }}
                    />
                  ))}
                </div>
                <style jsx global>{`
                  @keyframes pop-burst {
                    0% { transform: scale(0.2) translateY(0); opacity: 0.7; }
                    60% { transform: scale(1.2) translateY(-30px); opacity: 1; }
                    100% { transform: scale(1) translateY(-60px); opacity: 0; }
                  }
                  .animate-pop-burst {
                    animation: pop-burst 1.2s cubic-bezier(.61,-0.01,.7,1.01) forwards;
                  }
                  .animate-spin-slow {
                    animation: spin 2.5s linear infinite;
                  }
                `}</style>
              </motion.div>
            </motion.div>
          ) : showOtp ? (
            <motion.form
              key="otp"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, type: "spring" }}
              onSubmit={handleVerifyRegister}
              className="w-full max-w-xl bg-gradient-to-br from-[#181c2a]/80 to-[#10131c]/80 rounded-2xl shadow-xl border border-white/10 p-8 md:p-12 mx-auto transition-all duration-300 ease-in-out hover:shadow-blue-500/40 hover:scale-105 hover:-translate-y-2 focus-within:shadow-blue-400/60"
            >
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Verify Your Email</h2>
              <p className="text-center text-white/80 mb-8">
                We've sent a 6-digit OTP to{" "}
                <span className="text-blue-400 font-semibold">{otpEmail}</span>
              </p>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 text-red-400 text-center font-semibold bg-red-500/10 py-2 px-4 rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Success Message for Resend */}
              {resendMsg && (
                <div className="mb-4 text-green-400 text-center font-semibold bg-green-500/10 py-2 px-4 rounded-lg">
                  {resendMsg}
                </div>
              )}

              <div className="mb-8">
                <label className="block text-left text-white font-semibold mb-2">Enter OTP</label>
                <input
                  type="tel"
                  className="w-full text-2xl tracking-widest text-center px-4 py-4 rounded-lg bg-[#181c2a] border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={6}
                  pattern="[0-9]*"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={otpLoading}
                className={`bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white rounded-full w-full py-3 text-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 group hover:scale-105 hover:-translate-y-1 ${otpLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                <Shield className="w-5 h-5" />
                <span className="relative inline-block">
                  {otpLoading ? "Verifying..." : "Verify & Register"}
                  <span className="inline-block ml-2 text-xl transform transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </span>
              </Button>

              <div className="text-center mt-6 text-white/70">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className={`text-blue-400 hover:underline transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, type: "spring" }}
              onSubmit={handleSendOtp}
              className="w-full max-w-xl bg-gradient-to-br from-[#181c2a]/80 to-[#10131c]/80 rounded-2xl shadow-xl border border-white/10 p-8 md:p-12 mx-auto transition-all duration-300 ease-in-out hover:shadow-blue-500/80 hover:scale-105 hover:-translate-y-2 hover:border-blue-400 focus-within:shadow-blue-400/80"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Register as Voter</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-left text-white font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#181c2a] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-left text-white font-semibold mb-2">Scholar ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#181c2a] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                      placeholder="Enter your scholar ID"
                      value={scholarId}
                      onChange={e => setScholarId(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-left text-white font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#181c2a] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    placeholder="Enter your college email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-left text-white font-semibold mb-2">Current Degree</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#181c2a] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition appearance-none"
                    value={degree}
                    onChange={e => setDegree(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your degree</option>
                    {degrees.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
              </div>
              {errorMsg && <div className="text-red-400 text-center mb-4">{errorMsg}</div>}
              <Button
                type="submit"
                variant="default"
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white rounded-full w-full py-3 text-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 group hover:scale-105 hover:-translate-y-1"
              >
                <Send className="w-5 h-5" />
                <span className="relative inline-block">
                  Send OTP
                  <span className="inline-block ml-2 text-xl transform transition-transform duration-300 group-hover:translate-x-2">→</span>
                </span>
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Invalid OTP Modal */}
        <AnimatePresence>
          {showOtpError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-[#181c2a] to-[#10131c] rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border border-red-500/50"
              >
                <div className="mb-4 text-red-500">
                  <X className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-4">Invalid OTP</h3>
                <p className="text-white/80 mb-6">The OTP you entered is incorrect. Please try again.</p>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-200"
                  onClick={() => setShowOtpError(false)}
                >
                  Try Again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showAlreadyRegistered && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
              <h3 className="text-xl font-bold text-red-600 mb-4">Email Already Registered</h3>
              <p className="text-gray-800 mb-6">This email is already registered as a voter. Please use a different email or login.</p>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold"
                onClick={() => setShowAlreadyRegistered(false)}
              >OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterVoterPage; 
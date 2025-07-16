"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, User, Send, CheckCircle, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<"voter" | "admin">("voter");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; email?: string; otp?: string }>({});
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");

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

  const handleSendOtp = async () => {
    setLoginError("");
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: "Please enter your email address" }));
      return;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voter/login-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setErrors(prev => ({ ...prev, email: undefined }));
      } else {
        setLoginError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setLoginError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoterLogin = async () => {
    setLoginError("");
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: "Please enter the OTP" }));
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voter/login-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setLoginSuccess(true);
        // Save voter info to localStorage
        if (data.voter) {
          localStorage.setItem('voter', JSON.stringify(data.voter));
        }
        setTimeout(() => {
          window.location.href = "/votenow";
        }, 1000);
      } else {
        setLoginError(data.message || "OTP verification failed");
      }
    } catch (err) {
      setLoginError("OTP verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp("");
    setErrors(prev => ({ ...prev, otp: undefined }));
  };

  const handleAdminLogin = async () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Please enter your username";
    }
    if (!password.trim()) {
      newErrors.password = "Please enter your password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setLoginError("");
    setLoginSuccess(false);
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setErrors({});
        setLoginSuccess(true);
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      } else {
        setLoginError(data.message || "Incorrect username or password. Please try again.");
      }
    } catch (err) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: 'username' | 'password' | 'email' | 'otp') => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

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
            <Link href="/">
              <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full w-10 h-10 p-0 backdrop-blur-md border border-white/20 shadow-[0_6px_24px_rgba(255,100,100,0.35)] transition-all duration-300 active:scale-95 active:font-bold">
                <span className="text-white text-base font-normal">&#8592;</span>
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
              <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
                VoteChain
              </h2>
            </div>
          </div>

          <Link href="/signup">
            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20">
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12 space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-red-400 font-poppins"
              >
                Welcome Back!
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-3"
              >
                <p className="text-gray-300 text-lg">
                  Your voice matters in shaping the future of our college community.
                </p>
              </motion.div>
            </div>

            {/* Login Container */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]">
              {/* Login Tabs */}
              <div className="flex gap-4 mb-8">
                <Button
                  onClick={() => setActiveTab("voter")}
                  className="w-full bg-transparent text-white rounded-full py-2 flex items-center justify-center gap-2 
             hover:bg-indigo-500/30 hover:text-white font-bold focus:bg-indigo-600/40 transition-colors duration-300 border border-indigo-400/50"
                >
                  Voter Login
                </Button>
                <Button
                  onClick={() => setActiveTab("admin")}
                  className="w-full bg-transparent text-white rounded-full py-2 flex items-center justify-center gap-2 
             hover:bg-indigo-500/30 hover:text-white font-bold focus:bg-indigo-600/40 transition-colors duration-300 border border-indigo-400/50"
                >
                  Admin Login
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "voter" ? (
                  <motion.div
                    key="voter"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {!otpSent ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Email ID</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                clearError('email');
                              }}
                              className={`w-full pl-10 pr-4 py-2 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'
                                } rounded-lg focus:outline-none focus:border-red-500`}
                              placeholder="Enter your email"
                            />
                            {errors.email && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-xs"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.email}
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handleSendOtp}
                          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send OTP
                        </Button>
                        {loginError && (
                          <div className="mb-4 text-red-400 text-center font-semibold bg-red-500/10 py-2 px-4 rounded-lg">{loginError}</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-center text-sm text-gray-300 mb-4 flex items-center justify-center gap-2">
                          <Mail className="w-4 h-4" />
                          OTP sent to {email}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Enter OTP</label>
                          <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => {
                                setOtp(e.target.value);
                                clearError('otp');
                              }}
                              className={`w-full pl-10 pr-4 py-2 bg-white/5 border ${errors.otp ? 'border-red-500' : 'border-white/10'} rounded-lg focus:outline-none focus:border-red-500`}
                              placeholder="Enter OTP"
                            />
                            {errors.otp && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-xs"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.otp}
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handleVoterLogin}
                          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2"
                        >
                          Verify & Login
                        </Button>
                        <Button
                          onClick={handleBackToEmail}
                          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2"
                        >
                          Back to Email
                        </Button>
                        {loginError && (
                          <div className="mb-4 text-red-400 text-center font-semibold bg-red-500/10 py-2 px-4 rounded-lg">{loginError}</div>
                        )}
                        {loginSuccess && (
                          <div className="mb-4 text-green-400 text-center font-semibold bg-green-500/10 py-2 px-4 rounded-lg">Login successful! Redirecting...</div>
                        )}
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            clearError('username');
                          }}
                          className={`w-full pl-10 pr-4 py-2 bg-white/5 border ${errors.username ? 'border-red-500' : 'border-white/10'
                            } rounded-lg focus:outline-none focus:border-red-500`}
                          placeholder="Enter username"
                        />
                        {errors.username && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-xs"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.username}
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError('password');
                          }}
                          className={`w-full pl-10 pr-4 py-2 bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'
                            } rounded-lg focus:outline-none focus:border-red-500`}
                          placeholder="Enter password"
                        />
                        {errors.password && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-xs"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.password}
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleAdminLogin}
                      className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2"
                    >
                      Sign In
                    </Button>
                    {loginError && (
                      <div className="mb-4 text-red-400 text-center font-semibold bg-red-500/10 py-2 px-4 rounded-lg">{loginError}</div>
                    )}
                    {loginSuccess && (
                      <div className="mb-4 text-green-400 text-center font-semibold bg-green-500/10 py-2 px-4 rounded-lg">Login successful! Redirecting...</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help Messages */}
            <div className="space-y-3 mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center text-gray-400 text-sm"
              >
                Having trouble logging in? Contact <a href="mailto:support@votechain.edu" className="text-red-400 hover:text-red-300 transition-colors">support@votechain.edu</a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center text-gray-400 text-sm"
              >
                Don't have an account? <Link href="/signup" className="text-red-400 hover:text-red-300 transition-colors">Sign up here</Link>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
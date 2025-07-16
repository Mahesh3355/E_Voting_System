// app/signup/page.tsx or pages/signup.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, User, Send, CheckCircle, HelpCircle, Shield, Clock, AlertCircle } from "lucide-react";
import { ChoiceCard } from "@/components/ChoiceCard";

const SignupPage = () => {
  const [activeTab, setActiveTab] = useState<"voter" | "admin">("voter");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; email?: string; otp?: string }>({});

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

  const handleSendOtp = () => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: "Please enter your email address" }));
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    // TODO: Implement OTP sending logic
    setOtpSent(true);
    setErrors(prev => ({ ...prev, email: undefined }));
  };

  const handleVoterLogin = () => {
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: "Please enter the OTP" }));
      return;
    }
    // TODO: Implement voter login logic
    setErrors(prev => ({ ...prev, otp: undefined }));
    // Navigate to votenow page after successful login
    window.location.href = '/votenow';
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp("");
    setErrors(prev => ({ ...prev, otp: undefined }));
  };

  const handleAdminLogin = () => {
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

    // TODO: Implement admin login logic
    setErrors({});
    // Navigate to admin page after successful login
    window.location.href = '/admin';
  };

  const clearError = (field: 'username' | 'password' | 'email' | 'otp') => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100 font-sans flex flex-col">
      {/* Navbar */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled
          ? "backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm"
          : "backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-red-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/perfect1.png" alt="Logo" className="w-10 h-10 drop-shadow-lg" />
              <h2 className="text-2xl font-extrabold text-white/90 tracking-wide font-poppins drop-shadow">VoteChain</h2>
            </div>
          </div>
          <Link href="/login">
            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 shadow-lg">Login</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-36 pb-20 px-2">
        <motion.main
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10 md:p-16 flex flex-col items-center">
            <div className="mb-14 w-full text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">Welcome to <span className="text-purple-400">VoteChain</span></h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light">
                Secure, transparent, and decentralized voting powered by blockchain technology.<br />
                <span className="text-purple-200">Register as a voter or candidate to participate in your college elections.</span>
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-stretch gap-12 w-full relative">
              <ChoiceCard
                iconSrc="/file.svg" // Ballot icon
                iconBgColor="#2143DE"
                title="Register as Voter"
                description="Join as a student voter to participate in college elections and make your voice heard in student governance."
                features={[
                  "Email verification required",
                  "Scholar ID validation",
                  "OTP-based secure login",
                ]}
                buttonText="Register Now"
                buttonVariant="gradientBlue"
                linkHref="/register-voter"
              />
              <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-2 rounded-full"></div>
              <ChoiceCard
                iconSrc="/globe.svg" // Person icon
                iconBgColor="#8C3FBE"
                title="Register as Candidate"
                description="Apply to run for student positions and lead your fellow students. Open to 4th year students only."
                features={[
                  "4th year students only",
                  "Comprehensive application",
                  "Manifesto submission",
                ]}
                buttonText="Apply Now"
                buttonVariant="gradientPurple"
                linkHref="/register-candidate"
              />
            </div>
            <div className="mt-12 text-center text-white/60 text-sm">
              Need help? Contact <a href="mailto:support@votechain.edu" className="text-blue-300 underline hover:text-blue-400 transition">support@votechain.edu</a>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default SignupPage;
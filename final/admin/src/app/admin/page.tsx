"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, BarChart2, Clock, UserCheck, CheckCircle, Star, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AdminNavbar from "./components/AdminNavbar";

const features = [
  {
    icon: <Clock className="w-8 h-8 text-blue-400 mb-2" />,
    title: "Election Setup",
    desc: "Configure election timelines and settings"
  },
  {
    icon: <UserCheck className="w-8 h-8 text-purple-400 mb-2" />,
    title: "Candidate Management",
    desc: "Review and approve candidate applications"
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-green-400 mb-2" />,
    title: "Voting Control",
    desc: "Monitor and control voting phases"
  },
  {
    icon: <Star className="w-8 h-8 text-yellow-400 mb-2" />,
    title: "Results Dashboard",
    desc: "View real-time results and analytics"
  },
];

const AdminPage = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#181e28] text-gray-100 font-sans">
      {/* Navbar */}
      <AdminNavbar />
      <div className="pt-28 pb-8 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex flex-col items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-400 flex items-center justify-center mb-2 shadow-lg">
              <BarChart2 className="w-8 h-8 text-white" />
              <span className="absolute -top-2 right-0 text-yellow-300 text-xl">✦</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-purple-300 mb-2 drop-shadow-lg">Election Management System</h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto font-light mb-2">Administrative interface for managing democratic elections from setup to results publication</p>
          </div>
        </motion.div>
        {/* Admin Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-xl bg-gradient-to-br from-[#181c2a]/80 to-[#23263a]/80 rounded-2xl border border-blue-400/40 shadow-2xl p-10 mb-10 flex flex-col items-center transition-all duration-300 transform hover:scale-105 hover:border-blue-500 hover:shadow-2xl cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-blue-900 flex items-center justify-center mb-4 border-4 border-blue-400/40">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Election Administrator</h2>
          <p className="text-white/80 mb-6 text-center">Access the complete administrative interface to manage elections, approve candidates, and oversee the entire election process</p>
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white rounded-full py-3 text-lg font-semibold shadow-lg transition-all duration-300 mt-2 transform hover:scale-105 hover:shadow-xl hover:brightness-110 focus:outline-none"
            onClick={() => router.push('/admin/setup-election')}
          >
            Access Admin Dashboard
          </button>
        </motion.div>
        {/* Features Row */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-6 px-2 mb-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#181c2a]/80 to-[#23263a]/80 rounded-xl border border-white/10 shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:border-blue-400 hover:shadow-2xl cursor-pointer"
            >
              {f.icon}
              <h3 className="text-lg font-bold text-white mb-1 mt-2">{f.title}</h3>
              <p className="text-white/70 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 
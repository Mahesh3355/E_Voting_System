"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const StudentDetailsPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100 font-sans">
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
      <main className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center gap-12">
        {/* Welcome */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-red-400 text-center font-poppins"
        >
          Student Details
        </motion.h1>
        {/* Student Details Card */}
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
          transition={{ duration: 0.45, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true }}
          className="bg-white/2 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-8 text-center 
          w-full max-w-2xl shadow-md shadow-indigo-500/40 hover:shadow-white/60 transition-all duration-150"
        >
          <ul className="space-y-4 text-sm text-white text-left w-full max-w-md mx-auto pl-4 sm:pl-6">
            <li><strong>Name:</strong> Ram</li>
            <li><strong>Schloar Id:</strong> 2212XXX</li>
            <li><strong>Email:</strong> ram@cse.nits.ac.in</li>
            <li><strong>Degree:</strong> B.tech</li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDetailsPage;
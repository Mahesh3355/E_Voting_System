"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Sparkles,
  Workflow,
  ChevronLeft,
  ChevronRight,
  BellRing,
  Wallet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";

const images = ["/blockchain1.png", "/blockchain2.png", "/blockchain3.png"];

const HomePage: React.FC = () => {
  const [active, setActive] = useState<string>("");
  const [current, setCurrent] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const showAccount = searchParams.get("account") === "1";
  
  // REMOVE Web3 integration
  // const { isConnected, connectWallet, walletAddress, isLoading, error } = useWeb3();

  useEffect(() => {
    if (isClicked) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isClicked]);

  const handleClick = (direction: "left" | "right") => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 15000);
    if (direction === "left") {
      setCurrent((prev) => (prev - 1 + images.length) % images.length);
    } else {
      setCurrent((prev) => (prev + 1) % images.length);
    }
  };

  const navButtons = [
    { id: "home", icon: Home, label: "Home", href: "#top" },
    { id: "features", icon: Sparkles, label: "Features", href: "#key-features" },
    { id: "process", icon: Workflow, label: "Process", href: "#how" },
    { id: "events", icon: BellRing, label: "Events", href: "/events" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100 font-sans">
      {/* Navbar */}
      <header className="backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
            <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
              VoteChain
            </h2>
          </div>

          {/* Nav Icons */}
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
                    className={`flex items-center gap-2 cursor-pointer transition-all duration-200 group ${isActive ? "text-red-400 font-semibold" : "text-white/80"
                      } hover:text-red-400`}
                  >
                    <Icon
                      className={`w-5 h-5 group-hover:text-red-400 ${isActive ? "text-red-400" : "text-white/70"
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

          {/* Auth Buttons */}
          <div className="flex gap-4">
            {/* REMOVE wallet connect and status UI, keep only login/signup/account */}
            {showAccount ? (
              <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full">Account</Button>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Error Message */}
      {/* REMOVE wallet error message UI */}

      <main>
        {/* Top Section */}
        <section id="top" className="px-6 py-24 max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="md:w-1/2 text-center md:text-left"
            >
              <h1 className="text-5xl font-extrabold text-red-400 mb-6 leading-tight font-poppins">
                Revolutionizing College Elections <br />
                with Blockchain Technology
              </h1>
            </motion.div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="md:w-1/2 text-center md:text-left"
            >
              <div className="space-y-6 text-gray-300 font-light leading-relaxed">
                <p>
                  Our Blockchain-based E-Voting System brings a new era of trust and transparency to college elections. With tamper-proof records and real-time dashboards, every vote is secure, verifiable, and anonymous.
                </p>
                <p>
                  Vote from anywhere, anytime—with full confidence that your voice is counted and your identity protected. Designed for students, built on trust, and powered by cutting-edge blockchain technology.
                </p>
                
                {/* REMOVE Connect Wallet Section from main content */}
                {/* REMOVE Wallet Connected Section from main content */}
                
                <Link href="/events">
                  <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full px-6 py-2 backdrop-blur-md border border-white/20 shadow-[0_6px_24px_rgba(255,100,100,0.35)] transition-all duration-300 active:scale-95 active:font-bold">
                    →
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Image Carousel */}
          <div className="relative w-full flex justify-center">
            <div className="w-full md:w-[90%] h-[30rem] relative overflow-hidden rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[current]}
                  src={images[current]}
                  alt="Blockchain Visual"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="object-cover w-full h-full"
                />
              </AnimatePresence>

              {/* Arrows */}
              <button
                onClick={() => handleClick("left")}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg transition duration-300 hover:bg-[#f87171]/40 hover:shadow-xl"
              >
                <ChevronLeft className="w-6 h-6 text-black" />
              </button>
              <button
                onClick={() => handleClick("right")}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg transition duration-300 hover:bg-[#f87171]/40 hover:shadow-xl"
              >
                <ChevronRight className="w-6 h-6 text-black" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <motion.section
          className="max-w-7xl mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            id="key-features"
            className="scroll-mt-32 w-full text-center text-4xl font-bold mb-10"
            style={{ color: "#F43F5E", fontFamily: "'Poppins', sans-serif" }}
          >
            Key Features of Blockchain
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
            {[
              {
                title: "Immutable Records",
                icon: "🔒",
                desc: "Votes are permanently stored on the blockchain, preventing any modifications.",
              },
              {
                title: "End-to-End Verifiability",
                icon: "🔍",
                desc: "Voters can verify their vote was counted without revealing identity.",
              },
              {
                title: "Decentralization",
                icon: "🌐",
                desc: "No single point of failure—ensuring trust through distributed consensus.",
              },
              {
                title: "Transparency",
                icon: "📊",
                desc: "Publicly auditable data without compromising voter privacy.",
              },
              {
                title: "Anonymity",
                icon: "🕵️‍♂️",
                desc: "Votes are cast without linking them to identities, ensuring privacy.",
              },
              {
                title: "Tamper-Resistance",
                icon: "🛡️",
                desc: "Cryptographic protection guards against unauthorized alterations.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
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
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-indigo-500 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Process Section */}
        <motion.section
          id="how"
          className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Title */}
          <h2
            className="text-4xl font-bold mb-16 text-center"
            style={{ color: "#F43F5E", fontFamily: "'Poppins', sans-serif" }}
          >
            Blockchain Voting Process
          </h2>

          {/* Process Cards */}
          <div className="flex flex-col items-center space-y-12 w-full">
            {[
              {
                title: "✦ Voter Registration",
                desc: "Verified voters receive a secure blockchain identity to access the system.",
              },
              {
                title: "⚙︎ Smart Contract Setup",
                desc: "A transparent contract defines candidates, voting rules, and the voting timeline.",
              },
              {
                title: "✉︎ Secure Vote Casting",
                desc: "Voters cast encrypted votes using their private key, ensuring privacy and integrity.",
              },
              {
                title: "✔︎ Vote Validation",
                desc: "Each vote is authenticated on-chain and protected from tampering or duplication.",
              },
              {
                title: "☰   Tallying & Results",
                desc: "Votes are automatically counted and published on-chain for full transparency.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                whileHover={{
                  scale: 1.06,
                  transition: { type: "spring", stiffness: 400, damping: 20, duration: 0.2 },
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.42, 0, 0.58, 1],
                  delay: i * 0.15,
                }}
                viewport={{ once: true }}
                className="bg-white/2 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 text-center 
  w-full max-w-xl shadow-md shadow-red-500/40 hover:shadow-white/60 transition-all duration-150"

              >
                <h3 className="text-indigo-400 font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-white text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default HomePage;

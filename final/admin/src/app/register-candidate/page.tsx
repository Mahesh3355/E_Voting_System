"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, User, FileText, CheckCircle, AlertCircle, CalendarClock, Mail, Phone, GraduationCap, Sparkles } from "lucide-react";

const CandidateRulesPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const formRef = useRef(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const manifestoInputRef = useRef<HTMLInputElement>(null);
  const [profilePicName, setProfilePicName] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [manifestoName, setManifestoName] = useState("");
  const [reviewData, setReviewData] = useState({});
  const [position, setPosition] = useState("");
  const [achievements, setAchievements] = useState("");
  const [experience, setExperience] = useState("");
  const [formWarning, setFormWarning] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [address, setAddress] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'loading' | 'open' | 'notStarted' | 'ended'>('loading');
  const [eventTitle, setEventTitle] = useState('');
  const [regStart, setRegStart] = useState('');
  const [regEnd, setRegEnd] = useState('');
  const [name, setName] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [votingEnd, setVotingEnd] = useState('');

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

  useEffect(() => {
    // Check registration period on mount
    const checkRegistrationPeriod = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events/current');
        const data = await res.json();
        if (!data.event) {
          setRegistrationStatus('ended');
          return;
        }
        setEventTitle(data.event.title);
        setRegStart(data.event.registrationStart);
        setRegEnd(data.event.registrationEnd);
        const now = new Date();
        const start = new Date(data.event.registrationStart);
        const end = new Date(data.event.registrationEnd);
        if (now < start) {
          setRegistrationStatus('notStarted');
        } else if (now > end) {
          setRegistrationStatus('ended');
        } else {
          setRegistrationStatus('open');
        }
        setVotingEnd(data.event.votingEnd);
      } catch (err) {
        setRegistrationStatus('ended');
      }
    };
    checkRegistrationPeriod();
  }, []);

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
            {step === 0 ? (
              <Link href="/signup" className="flex items-center gap-2 text-white/80 hover:text-red-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </Link>
            ) : (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-white/80 hover:text-red-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
            )}
            <div className="flex items-center gap-3">
              <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
              <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
                VoteChain
              </h2>
            </div>
          </div>
          <Link href="/login">
            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-28 pb-12 max-w-3xl mx-auto px-4">
        {/* Registration period modal */}
        <motion.div>
          {(registrationStatus === 'notStarted' || registrationStatus === 'ended') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-[#181c2a] to-[#10131c] rounded-xl shadow-2xl p-10 max-w-sm w-full text-center border border-purple-500/50"
              >
                <div className="mb-4 text-purple-400">
                  <Shield className="w-12 h-12 mx-auto animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-purple-300 mb-4">Candidate Registration {registrationStatus === 'notStarted' ? 'Not Started' : 'Closed'}</h3>
                <p className="text-white/80 mb-6">
                  {registrationStatus === 'notStarted'
                    ? `Registration for "${eventTitle}" will open on ${regStart ? new Date(regStart).toLocaleString() : ''}. Please come back later!`
                    : 'Candidate registration is closed for the current election.'}
                </p>
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-200"
                  onClick={() => window.location.href = '/'}
                >Return to Home</button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        {/* Stepper */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2 text-center drop-shadow-lg tracking-tight">Candidate Registration</h1>
          <p className="text-lg text-white/80 mb-8 text-center font-medium">Apply to run for student positions</p>
          <div className="flex items-center justify-center gap-8 w-full max-w-2xl">
            {/* Stepper with glassy, glowing effect */}
            {[{
              icon: <Shield className="w-6 h-6" />, label: "Rules & Eligibility"
            }, {
              icon: <User className="w-6 h-6" />, label: "Personal Information"
            }, {
              icon: <FileText className="w-6 h-6" />, label: "Application Details"
            }, {
              icon: <CheckCircle className="w-6 h-6" />, label: "Review & Submit"
            }].map((phase, idx) => (
              <React.Fragment key={phase.label}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300
                    ${step === idx
                      ? "bg-white/10 border-purple-400 shadow-purple-400/40 ring-2 ring-purple-400/40 animate-pulse"
                      : step > idx
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-500 shadow-pink-400/30"
                        : "bg-white/5 border-white/10"}`}
                  >
                    {React.cloneElement(phase.icon, {
                      className: `w-7 h-7 ${step === idx ? "text-purple-300" : step > idx ? "text-white" : "text-gray-400"}`
                    })}
                  </div>
                  <span className={`mt-2 font-semibold text-xs tracking-wide transition-all duration-200
                    ${step === idx ? "text-purple-300" : step > idx ? "text-white/80" : "text-gray-400"}`}>{phase.label}</span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300
                    ${step > idx ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-pink-400/30" : "bg-white/10"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Info Card */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="bg-gradient-to-br from-[#1a1d26] via-[#23263a] to-[#181e28] rounded-2xl shadow-2xl border border-purple-500/40 p-8 mb-8 flex flex-col items-center relative overflow-hidden"
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Rules and Eligibility</h2>
              </div>
              <p className="text-white/80 mb-6">Please read and understand the following rules and eligibility criteria before proceeding with your application.</p>
              {/* Eligibility Criteria */}
              <div className="bg-green-900/60 border border-green-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-bold text-green-300">Eligibility Criteria</span>
                </div>
                <ul className="text-green-200 text-base ml-8 list-disc space-y-1">
                  <li>Must be a 4th year student currently enrolled in the college</li>
                  <li>Minimum CGPA of 7.0 or equivalent</li>
                  <li>No pending disciplinary actions or academic probation</li>
                  <li>Active participation in college activities for at least 2 years</li>
                </ul>
              </div>
              {/* Rules and Regulations */}
              <div className="bg-blue-900/60 border border-blue-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-bold text-blue-300">Rules and Regulations</span>
                </div>
                <ul className="text-blue-100 text-base ml-8 list-disc space-y-1">
                  <li>Candidates must maintain academic excellence throughout the campaign period</li>
                  <li>Campaigning is allowed only in designated areas and during specified hours</li>
                  <li>No personal attacks or negative campaigning against other candidates</li>
                  <li>All campaign materials must be approved by the election committee</li>
                  <li>Maximum campaign expenditure limit is ₹5,000</li>
                </ul>
              </div>
              {/* Important Dates */}
              <div className="bg-orange-900/60 border border-orange-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="w-5 h-5 text-orange-400" />
                  <span className="text-lg font-bold text-orange-300">Important Dates</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-4 text-orange-100 text-base">
                  <div>
                    <div className="font-semibold">Application Deadline:</div>
                    <div>{regEnd ? new Date(regEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Campaign Period:</div>
                    <div>To be announced</div>
                  </div>
                  <div>
                    <div className="font-semibold">Voting Day:</div>
                    <div>{regStart ? new Date(regStart).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Result Declaration:</div>
                    <div>{votingEnd ? new Date(votingEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}</div>
                  </div>
                </div>
              </div>
              {/* Important Notice */}
              <div className="bg-red-900/60 border border-red-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-lg font-bold text-red-300">Important Notice</span>
                </div>
                <div className="text-red-200 text-base">
                  Any violation of the above rules and regulations will result in immediate disqualification.<br />
                  False information provided in the application will lead to cancellation of candidature.
                </div>
              </div>
            </div>
            {/* Agreement Checkbox and Button */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mt-6">
              <label className="flex items-center gap-3 text-white/80 text-base cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setShowWarning(false); }}
                  className="w-5 h-5 accent-purple-500 rounded border border-white/20 focus:ring-2 focus:ring-purple-400 transition"
                />
                I have read and agree to all the rules, regulations, and eligibility criteria mentioned above.
              </label>
              <Button
                type="button"
                variant="default"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-full px-10 py-3 text-lg font-semibold shadow-lg transition-all duration-300 w-full md:w-auto"
                onClick={() => {
                  if (!agreed) {
                    setShowWarning(true);
                    if (formRef.current) {
                      (formRef.current as HTMLElement).scrollIntoView({ behavior: "smooth" });
                    }
                    return;
                  }
                  setShowWarning(false);
                  setStep(1);
                }}
              >
                Proceed to Application
                <CheckCircle className="w-5 h-5 ml-2" />
              </Button>
            </div>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-red-400 font-semibold text-center"
                ref={formRef}
              >
                Please check the box to agree to the rules and eligibility before proceeding.
              </motion.div>
            )}
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="bg-gradient-to-br from-[#1a1d26] via-[#23263a] to-[#181e28] rounded-2xl shadow-2xl border border-purple-500/40 p-8 mb-8 flex flex-col items-center relative overflow-hidden"
            style={{ boxShadow: '0 0 32px 4px #a78bfa33, 0 0 64px 16px #7c3aed22' }}
          >
            <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-purple-400/30 animate-glow-card" />
            <form key={step} className="space-y-8 w-full max-w-3xl z-10" onSubmit={e => {
              e.preventDefault();
              if (!name || !scholarId || !email || !phone || !degree || !branch || !year || !cgpa || !address) {
                setFormWarning("Please fill in all required personal details.");
                return;
              }
              if (!/^\d{7}$/.test(scholarId)) {
                setFormWarning("Scholar ID must be exactly 7 digits.");
                return;
              }
              if (year !== "4") {
                setFormWarning("Only 4th year students are eligible to register as candidates.");
                return;
              }
              setFormWarning("");
              setStep(2);
            }}>
              <div>
                <label className="block text-white font-semibold mb-2">Full Name <span className="text-purple-400">*</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Scholar ID <span className="text-purple-400">*</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  placeholder="Enter your 7-digit scholar ID"
                  value={scholarId}
                  onChange={e => setScholarId(e.target.value)}
                  pattern="[0-9]{7}"
                  title="Please enter a 7-digit scholar ID"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Email Address <span className="text-purple-400">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                      placeholder="Enter your college email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Phone Number <span className="text-purple-400">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <hr className="my-6 border-gray-700" />
              <h3 className="text-xl font-bold text-white mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Degree <span className="text-purple-400">*</span></label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <select
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                      value={degree}
                      onChange={e => setDegree(e.target.value)}
                      required
                    >
                      <option value="">Select degree</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MBA">MBA</option>
                      <option value="PhD">PhD</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Branch/Specialization <span className="text-purple-400">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    placeholder="e.g., Computer Science"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Current Year <span className="text-purple-400">*</span></label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    required
                  >
                    <option value="">Select year</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Current CGPA <span className="text-purple-400">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    placeholder="Enter your CGPA (out of 10)"
                    value={cgpa}
                    onChange={e => setCgpa(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Address <span className="text-purple-400">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-[#232834] border border-[#353a4a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    placeholder="Enter your complete address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
                <Button type="button" variant="default" className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full px-10 py-3 text-lg font-semibold shadow-lg transition-all duration-300 w-full md:w-auto" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-5 h-5 mr-2" /> Previous
                </Button>
                <Button type="submit" variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-full px-10 py-3 text-lg font-semibold shadow-lg transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2">
                  Next <span className="ml-2">→</span>
                </Button>
              </div>
              {formWarning && <div className="text-red-400 text-center font-semibold mt-4">{formWarning}</div>}
            </form>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="bg-gradient-to-br from-[#1a1d26] via-[#23263a] to-[#181e28] rounded-2xl shadow-2xl border border-purple-500/40 p-8 mb-8 flex flex-col items-center relative overflow-hidden"
            style={{ boxShadow: '0 0 32px 4px #a78bfa33, 0 0 64px 16px #7c3aed22' }}
          >
            <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-purple-400/30 animate-glow-card" />
            <h2 className="text-2xl font-bold text-white mb-2">Application Details</h2>
            <p className="text-white/70 mb-8">Provide details about your achievements, experience, and campaign</p>
            <form key={step} className="space-y-8" onSubmit={e => {
              e.preventDefault();
              if (!position || !achievements || !experience || !profilePicName || !manifestoName) {
                setFormWarning("Please fill in all required fields and upload all necessary files before reviewing your application.");
                return;
              }
              setFormWarning("");
              setReviewData({
                position,
                achievements,
                experience
              });
              setStep(3);
            }}>
              {/* Position Applied For */}
              <div>
                <label className="block text-white font-semibold mb-2">Position Applied For <span className="text-purple-400">*</span></label>
                <select
                  className="w-full bg-[#232834] border border-[#353a4a] text-white py-4 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-lg"
                  required
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                >
                  <option value="">Select position</option>
                  <option value="Vice-president">Vice-president</option>
                                      <option value="GS(GYMKHANA)">GS(GYMKHANA)</option>
                    <option value="GS(CULTURAL)">GS(CULTURAL)</option>
                    <option value="GS(TECHNICAL)">GS(TECHNICAL)</option>
                    <option value="GS(SPORTS)">GS(SPORTS)</option>
                </select>
              </div>
              {/* Achievements & Awards */}
              <div>
                <label className="block text-white font-semibold mb-2">Achievements & Awards <span className="text-purple-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-purple-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4M4 4h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4V4z" /></svg>
                  </span>
                  <textarea
                    className="w-full max-w-3xl bg-[#232834] border border-[#353a4a] text-white py-4 pl-14 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-lg min-h-[160px] resize-y mx-auto"
                    placeholder="List your academic achievements, awards, certifications, competitions won, etc."
                    required
                    value={achievements}
                    onChange={e => setAchievements(e.target.value)}
                  />
                </div>
                <div className="text-gray-400 text-sm mt-2">Include academic honors, competition wins, certifications, etc.</div>
              </div>
              {/* College Experience & Leadership Roles */}
              <div>
                <label className="block text-white font-semibold mb-2">College Experience & Leadership Roles <span className="text-purple-400">*</span></label>
                <textarea
                  className="w-full max-w-3xl bg-[#232834] border border-[#353a4a] text-white py-4 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-lg min-h-[160px] resize-y mx-auto"
                  placeholder="Describe your involvement in college activities, leadership roles, clubs, societies, events organized, etc."
                  required
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                />
                <div className="text-gray-400 text-sm mt-2">Mention clubs, societies, events organized, volunteer work, etc.</div>
              </div>
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-white font-semibold mb-2">Profile Picture <span className="text-purple-400">*</span></label>
                <div className="border-2 border-dashed border-gray-500 rounded-xl p-8 flex flex-col items-center justify-center bg-[#232834] mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <div className="text-white/80 mb-2">Upload your profile picture</div>
                  <div className="text-gray-400 text-sm mb-4">Drag and drop or click to select</div>
                  <div className="flex gap-4">
                    <input
                      ref={profilePicInputRef}
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      className="hidden"
                      id="profilePic"
                      required
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setProfilePicName(e.target.files[0].name);
                          setProfilePicFile(e.target.files[0]);
                        } else {
                          setProfilePicName("");
                          setProfilePicFile(null);
                        }
                      }}
                    />
                    <Button type="button" variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-full px-8 py-2 text-lg font-semibold mt-2 shadow-lg transition-all duration-300" onClick={() => profilePicInputRef.current && profilePicInputRef.current.click()}>
                      Choose File
                    </Button>
                  </div>
                  {profilePicName && <div className="mt-4 text-green-400 font-semibold">{profilePicName}</div>}
                </div>
                <div className="text-gray-400 text-sm">Accepted formats: JPG, PNG. Max size: 5MB</div>
              </div>
              {/* Manifesto Document (now textarea) */}
              <div>
                <label className="block text-white font-semibold mb-2">Manifesto <span className="text-purple-400">*</span></label>
                <textarea
                  className="w-full max-w-3xl bg-[#232834] border border-[#353a4a] text-white py-4 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-lg min-h-[160px] resize-y mx-auto"
                  placeholder="Type your manifesto here. Clearly state your goals, promises, and vision as a candidate."
                  required
                  value={manifestoName}
                  onChange={e => setManifestoName(e.target.value)}
                />
                <div className="text-gray-400 text-sm mt-2">Your manifesto should outline your objectives, plans, and why students should vote for you.</div>
              </div>
              {/* Navigation Buttons */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
                <Button type="button" variant="default" className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full px-10 py-3 text-lg font-semibold shadow-lg transition-all duration-300 w-full md:w-auto" onClick={() => setStep(1)}>
                  Previous
                </Button>
                <Button type="submit" variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-full px-10 py-3 text-lg font-semibold shadow-lg transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2" disabled={submitting} onClick={async (e) => {
                  e.preventDefault();
                  setFormWarning("");
                  setSubmitting(true);
                  const formData = new FormData();
                  formData.append('name', name);
                  formData.append('scholarId', scholarId);
                  formData.append('email', email);
                  formData.append('phone', phone);
                  formData.append('degree', degree);
                  formData.append('branch', branch);
                  formData.append('year', year);
                  formData.append('cgpa', cgpa);
                  formData.append('address', address);
                  formData.append('position', position);
                  formData.append('achievements', achievements);
                  formData.append('experience', experience);
                  formData.append('manifestoUrl', manifestoName);
                  if (profilePicFile) {
                    formData.append('profilePic', profilePicFile);
                  }
                  try {
                    const res = await fetch('http://localhost:5000/api/candidate/register', {
                      method: 'POST',
                      body: formData
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setShowThankYou(true);
                    } else {
                      setFormWarning(data.message || 'Failed to register candidate.');
                    }
                  } catch (err) {
                    setFormWarning('Failed to connect to server. Please try again.');
                  }
                  setSubmitting(false);
                }}>
                  Submit Application
                </Button>
              </div>
            </form>
            {formWarning && <div className="text-red-400 text-center font-semibold mt-4">{formWarning}</div>}
          </motion.div>
        )}
        {step === 3 && !showThankYou && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="bg-gradient-to-br from-[#1a1d26] via-[#23263a] to-[#181e28] rounded-2xl shadow-2xl border border-purple-500/40 p-8 mb-8 flex flex-col items-center relative overflow-hidden"
            style={{ boxShadow: '0 0 32px 4px #a78bfa33, 0 0 64px 16px #7c3aed22' }}
          >
            <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-purple-400/30 animate-glow-card" />
            <h2 className="text-4xl font-extrabold text-white mb-4 text-center drop-shadow-[0_2px_16px_rgba(168,139,250,0.5)]">Review & Submit</h2>
            <p className="text-white/80 mb-8 text-center text-lg">Please review your application before submitting.</p>
            {/* Beautiful Application Card */}
            <div className="w-full max-w-2xl bg-gradient-to-br from-[#2e1065]/70 via-[#3b0764]/60 to-[#18181b]/80 rounded-2xl p-10 mb-8 border-l-8 border-purple-500/60 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* Animated sparkles */}
              <span className="absolute right-8 top-8 animate-pulse">
                <Sparkles className="w-8 h-8 text-pink-400/80" />
              </span>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-7 h-7 text-purple-300" />
                <span className="font-bold text-xl text-purple-200 tracking-wide">Position Applied For:</span>
                <span className="ml-2 text-purple-100 text-xl font-extrabold uppercase tracking-wider">{position}</span>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                  <span className="font-semibold text-lg text-green-200">Achievements & Awards</span>
                </div>
                <div className="ml-9 text-white/90 whitespace-pre-line text-base mt-1 bg-green-900/30 rounded-xl p-4 border border-green-400/10 shadow-inner font-mono">
                  {achievements}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-6 h-6 text-blue-300" />
                  <span className="font-semibold text-lg text-blue-200">College Experience & Leadership Roles</span>
                </div>
                <div className="ml-9 text-white/90 whitespace-pre-line text-base mt-1 bg-blue-900/30 rounded-xl p-4 border border-blue-400/10 shadow-inner font-mono">
                  {experience}
                </div>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-yellow-300" />
                <span className="font-semibold text-lg text-yellow-200">Profile Picture:</span>
                <span className="ml-2 text-green-400 font-semibold text-base">{profilePicName}</span>
              </div>
              <div className="mb-2 flex items-center gap-3">
                <FileText className="w-6 h-6 text-pink-300" />
                <span className="font-semibold text-lg text-pink-200">Manifesto Document:</span>
                <span className="ml-2 text-green-400 font-semibold text-base">{manifestoName}</span>
              </div>
              {/* Floating accent shapes */}
              <span className="absolute left-4 bottom-4 w-8 h-8 bg-pink-400/30 rounded-full blur-xl animate-float-slow" />
              <span className="absolute right-10 bottom-10 w-6 h-6 bg-purple-400/30 rounded-full blur-xl animate-float" />
              <style jsx global>{`
                @keyframes float {
                  0% { transform: translateY(0); }
                  50% { transform: translateY(-12px); }
                  100% { transform: translateY(0); }
                }
                .animate-float { animation: float 2.5s ease-in-out infinite; }
                .animate-float-slow { animation: float 4.5s ease-in-out infinite; }
              `}</style>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
              <Button
                type="button"
                variant="default"
                className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full px-10 py-3 text-lg font-semibold shadow-lg transition-all duration-300 w-full md:w-auto"
                onClick={() => setStep(2)}
              >
                Previous
              </Button>
            </div>
          </motion.div>
        )}
        {/* Thank You Popup */}
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.7 }}
              className="relative bg-gradient-to-br from-[#2e1065]/80 via-[#3b0764]/70 to-[#18181b]/90 rounded-3xl shadow-2xl border-4 border-purple-400/40 p-12 max-w-xl w-full flex flex-col items-center text-center overflow-hidden backdrop-blur-xl"
              style={{ boxShadow: '0 0 48px 8px #a78bfa55, 0 0 96px 32px #7c3aed33' }}
            >
              {/* Burst/Confetti effect */}
              <span className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <Sparkles className="w-24 h-24 text-pink-400 animate-pulse drop-shadow-xl" />
              </span>
              <h2 className="text-4xl font-extrabold text-purple-200 mb-4 mt-16 animate-bounce drop-shadow-lg">Thank You for Your Application!</h2>
              <p className="text-lg text-white/90 mb-6">Your candidate application has been submitted successfully.</p>
              <blockquote className="italic text-pink-200 text-xl mb-6 border-l-4 border-pink-400 pl-4">
                "The ballot is stronger than the bullet."<br />
                <span className="text-pink-400 font-bold">- Abraham Lincoln</span>
              </blockquote>
              <p className="text-lg text-purple-200 mb-8">We wish you the very best of luck in your election journey. May your leadership inspire positive change!</p>
              <motion.button
                whileHover={{ scale: 1.08, y: -2, boxShadow: '0 8px 32px 0 #a21caf55' }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-full px-10 py-3 text-lg font-bold shadow-xl border-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400/60"
                onClick={() => window.location.href = '/'}
              >
                <Sparkles className="w-6 h-6 mr-1 -ml-2 text-pink-200 animate-spin-slow" />
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
        )}
      </div>
    </div>
  );
};

export default CandidateRulesPage; 
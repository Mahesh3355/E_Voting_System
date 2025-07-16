import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { User, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminNavbarProps {
  backHref?: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ backHref }) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <nav className="fixed w-full top-0 z-50 backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm py-3 px-0">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <button
              onClick={() => router.push(backHref)}
              className="mr-2 p-2 rounded-full bg-white/10 hover:bg-blue-500/80 text-white transition-all duration-200 focus:outline-none"
              title="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <Image src="/perfect1.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-white tracking-wide font-poppins">VoteChain</span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 bg-white/10 hover:bg-red-500/80 text-white rounded-full px-4 py-2 transition-all duration-200 focus:outline-none"
            title="Account"
          >
            <User className="w-6 h-6" />
            <span className="hidden md:inline font-semibold">Account</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl px-0 py-0 z-50 bg-gradient-to-br from-[#181c2a]/90 via-[#23263a]/90 to-[#0b0f1a]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center overflow-hidden">
              <div className="w-full flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 shadow border-2 border-white/10">
                  <User className="w-10 h-10 text-white" />
                </div>
                <span className="text-white font-bold text-lg mb-6">Your Account</span>
              </div>
              <div className="w-full flex flex-col gap-4 px-8 pb-8">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/80 text-white font-bold rounded-full px-4 py-4 text-lg shadow-md border border-white/20 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400/30"
                >
                  <LogOut className="w-6 h-6 text-red-300" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 
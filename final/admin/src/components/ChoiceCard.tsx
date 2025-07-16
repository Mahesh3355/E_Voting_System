import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

type ChoiceCardProps = {
  iconSrc: string;
  iconBgColor: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "gradientBlue" | "gradientRed" | "gradientPurple";
  linkHref: string;
};

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  iconSrc,
  iconBgColor,
  title,
  description,
  features,
  buttonText,
  buttonVariant,
  linkHref,
}) => {
  // Compute card and icon classes for hover color
  const cardHoverClass = buttonVariant === 'gradientBlue'
    ? 'hover:shadow-blue-500/80 hover:ring-2 hover:ring-blue-400'
    : 'hover:shadow-purple-500/40 hover:ring-2 hover:ring-purple-400';
  const iconRingClass = buttonVariant === 'gradientBlue'
    ? 'ring-blue-400/30 group-hover:ring-blue-400/60'
    : 'ring-purple-400/30 group-hover:ring-purple-400/60';

  return (
    <div
      className={`bg-gradient-to-br from-[#23263a]/80 to-[#181e28]/80 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm mx-4 transition-all duration-300 ease-in-out group ${cardHoverClass} hover:scale-105 hover:-translate-y-2 focus-within:shadow-purple-400/80`}
    >
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-4 ${iconRingClass} shadow-lg bg-gray-800/60 relative transition-all duration-300`}
      >
        <Image src={iconSrc} alt="icon" width={48} height={48} className="drop-shadow-xl filter grayscale" />
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-purple-400/20 rounded-full blur-sm opacity-70"></span>
      </div>
      <h2 className="text-2xl font-extrabold text-white mb-3 tracking-tight drop-shadow">{title}</h2>
      <p className="text-white/80 mb-6 font-light min-h-[56px]">{description}</p>
      <ul className="text-left w-full mb-8 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-white/80 gap-3">
            <span className={`inline-block w-3 h-3 rounded-full bg-gradient-to-br ${buttonVariant === "gradientBlue" ? "from-blue-400 to-blue-600" : buttonVariant === "gradientPurple" ? "from-purple-400 to-pink-400" : "from-red-400 to-orange-400"} shadow-md`}></span>
            <span className="text-sm font-medium">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={linkHref} className="w-full">
        <Button
          variant="default"
          className={`w-full py-3 text-lg rounded-full flex items-center justify-center font-semibold shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:bg-opacity-90 group-hover:scale-105 group-hover:-translate-y-1
            ${buttonVariant === "gradientBlue" ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
            : buttonVariant === "gradientPurple" ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white"
            : "bg-gradient-to-r from-red-400 to-orange-400 text-white"}
          `}
        >
          {buttonText}
          <span className="ml-2 text-xl transform transition-transform duration-300 group-hover:translate-x-2">→</span>
        </Button>
      </Link>
    </div>
  );
}; 
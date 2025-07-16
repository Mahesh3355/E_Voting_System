import React from "react";

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-[#1C1F2E]/60 backdrop-blur-lg shadow-2xl rounded-2xl border border-blue-900 ${className}`}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

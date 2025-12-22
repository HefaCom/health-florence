
import React from "react";

interface FloLogoProps {
  className?: string;
}

export function FloLogo({ className = "" }: FloLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-3xl animate-pulse-glow">
        <img
          src="/logo1.jpg"
          alt="Nurse Help Me"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}

export function FloLogoSmall({ className = "" }: FloLogoProps) {
  return (
    <div className={`w-10 h-10 relative ${className}`}>
      <div className="relative overflow-hidden rounded-full animate-pulse-glow">
        <img
          src="/logo.jpg"
          alt="Health AI"
          className="object-cover w-full h-full scale-150"
        />
      </div>
    </div>
  );
}

export function HealthAICoin({ className = "" }: FloLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-full animate-pulse-glow">
        <img
          src="/logo1.jpg"
          alt="Health AI Coin"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}

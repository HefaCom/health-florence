
import React from "react";

interface FloLogoProps {
  className?: string;
}

export function FloLogo({ className = "" }: FloLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-3xl animate-pulse-glow">
        <img 
          src="/lovable-uploads/5eae8820-b481-4ca1-b211-4da3631a137a.png" 
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
          src="/lovable-uploads/5eae8820-b481-4ca1-b211-4da3631a137a.png" 
          alt="Nurse Help Me" 
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
          src="/lovable-uploads/8dfe6cd9-3600-4a46-948c-a11241f1143e.png" 
          alt="Health AI Coin" 
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}

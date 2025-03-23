
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 
          ${theme === "dark" 
            ? "bg-gradient-to-br from-healthAI-navy/90 via-healthAI-darkBlue/80 to-black/90" 
            : "bg-gradient-to-br from-blue-50/90 via-blue-100/80 to-indigo-100/90"
          }`}
      />
      
      {/* Animated circles */}
      <div 
        className={`absolute w-96 h-96 rounded-full blur-3xl opacity-50 transition-all duration-700 ease-in-out
          ${theme === "dark" ? "bg-primary" : "bg-primary"}`}
        style={{ 
          left: `${mousePosition.x * 10}%`,
          top: `${mousePosition.y * 10}%`,
          transform: `translate(${mousePosition.x * -50}%, ${mousePosition.y * -50}%)` 
        }}
      />
      
      <div 
        className={`absolute w-64 h-64 rounded-full blur-3xl opacity-40 transition-all duration-700 ease-in-out
          ${theme === "dark" ? "bg-blue-700" : "bg-blue-400"}`}
        style={{ 
          right: `${mousePosition.x * 20}%`,
          bottom: `${mousePosition.y * 20}%`,
          transform: `translate(${mousePosition.x * 30}%, ${mousePosition.y * 30}%)` 
        }}
      />
      
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-20 animate-float
              ${theme === "dark" ? "bg-white" : "bg-primary"}`}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className={`absolute inset-0 opacity-5 
          ${theme === "dark" ? "bg-grid-white/5" : "bg-grid-black/5"}`}
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: `linear-gradient(to right, ${theme === "dark" ? "#ffffff" : "#000000"} 1px, transparent 1px), 
                           linear-gradient(to bottom, ${theme === "dark" ? "#ffffff" : "#000000"} 1px, transparent 1px)`
        }}
      />
    </div>
  );
}

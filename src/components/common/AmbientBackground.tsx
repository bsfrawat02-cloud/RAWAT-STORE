import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

export const AmbientBackground: React.FC = () => {
  const { ambientLightEnabled, soundEnabled } = useStore();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x: xPercent, y: yPercent });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  if (!ambientLightEnabled) {
    return <div className="fixed inset-0 bg-[#050505] pointer-events-none -z-10" />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#050505]">
      {/* Dynamic Cursor Reactive Aurora Orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 transition-all duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, #9333ea 0%, #06b6d4 50%, transparent 80%)',
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Top Left Deep Purple Atmospheric Glow */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[130px] animate-ambient" />

      {/* Bottom Right Electric Cyan Atmospheric Glow */}
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[130px] animate-ambient" style={{ animationDelay: '4s' }} />

      {/* Center Golden Specular Flare */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/5 blur-[150px] rounded-full" />

      {/* 3D Cyber Perspective Floor Grid */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[45vh] opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(50px) scale(1.5)',
          maskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
        }}
      />

      {/* Fine Mesh Matrix Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25" />

      {/* Subtle Floating Ambient Starlight Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-400/30"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 8.3 + 5) % 100}%`,
              top: `${(i * 11.7 + 10) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 4 + (i % 5),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i * 0.3) % 3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

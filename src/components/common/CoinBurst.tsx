import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../../utils/audio';

interface CoinParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
  delay: number;
  scale: number;
}

interface CoinBurstProps {
  triggerKey?: string | number;
  count?: number;
  sourceElementId?: string;
  targetElementId?: string;
  onComplete?: () => void;
  soundEnabled?: boolean;
}

export const triggerCoinFountain = (options?: { count?: number }) => {
  const event = new CustomEvent('trigger-coin-fountain', { detail: options });
  window.dispatchEvent(event);
};

export const CoinBurstContainer: React.FC<{ soundEnabled?: boolean }> = ({ soundEnabled = true }) => {
  const [coins, setCoins] = useState<CoinParticle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ count?: number }>;
      const count = customEvent.detail?.count || 18;
      
      const newCoins: CoinParticle[] = [];
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      // Source in bottom right or center
      const startX = windowWidth / 2 + (Math.random() - 0.5) * 100;
      const startY = windowHeight * 0.65;

      // Target in top right header wallet position
      const targetX = windowWidth > 768 ? windowWidth - 120 : windowWidth - 60;
      const targetY = 32;

      for (let i = 0; i < count; i++) {
        // Arc explosion offset before flying to target
        const blastAngle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const blastDistance = 80 + Math.random() * 120;
        const midX = startX + Math.cos(blastAngle) * blastDistance;
        const midY = startY + Math.sin(blastAngle) * blastDistance - 60;

        newCoins.push({
          id: Date.now() + i,
          startX: midX,
          startY: midY,
          endX: targetX,
          endY: targetY,
          rotation: Math.random() * 720 - 360,
          delay: i * 0.04,
          scale: 0.8 + Math.random() * 0.4,
        });
      }

      setCoins(newCoins);
      setIsActive(true);

      // Play coin ping sounds
      playSound('coin', soundEnabled);
      setTimeout(() => playSound('coin', soundEnabled), 120);
      setTimeout(() => playSound('coin', soundEnabled), 260);

      setTimeout(() => {
        setIsActive(false);
        setCoins([]);
      }, 1600);
    };

    window.addEventListener('trigger-coin-fountain', handleTrigger);
    return () => window.removeEventListener('trigger-coin-fountain', handleTrigger);
  }, [soundEnabled]);

  if (!isActive || coins.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{
              x: coin.startX,
              y: coin.startY,
              scale: 0,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: [coin.startX, coin.startX + (Math.random() - 0.5) * 40, coin.endX],
              y: [coin.startY, coin.startY - 80, coin.endY],
              scale: [0, coin.scale * 1.3, 0.4],
              opacity: [1, 1, 0],
              rotate: coin.rotation,
            }}
            transition={{
              duration: 0.95,
              delay: coin.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute top-0 left-0"
          >
            {/* 3D Golden Coin Graphic */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.8)] flex items-center justify-center font-tech font-black text-amber-950 text-xs select-none">
              ₹
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

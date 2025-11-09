"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function DailyRewardModal({ isOpen, onClose, points }) {
  const confettiRef = useRef(null);

  useEffect(() => {
    if (isOpen && confettiRef.current) {
      createConfetti(confettiRef.current);
    }
  }, [isOpen]);

  const createConfetti = (canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 4,
        life: 1,
        color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"][
          Math.floor(Math.random() * 5)
        ],
        size: Math.random() * 4 + 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.01;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      });

      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none" />

      <div className="relative z-10">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 rounded-3xl blur-xl"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-amber-200 dark:border-amber-800 animate-in zoom-in-50 duration-500">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-amber-900 dark:text-amber-100" />
          </button>

          {/* Gift Box Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              {/* Gift box */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg animate-bounce" />

              {/* Ribbon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-full" />

              {/* Bow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-6 h-6 bg-yellow-400 rounded-full shadow-md animate-pulse" />

              {/* Sparkles */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-pulse"
                  style={{
                    animation: `spin 2s linear infinite`,
                    top: i % 2 === 0 ? "-8px" : "auto",
                    bottom: i % 2 === 0 ? "auto" : "-8px",
                    left: i < 2 ? "-8px" : "auto",
                    right: i < 2 ? "auto" : "-8px",
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-center text-2xl font-bold text-amber-900 dark:text-amber-50 mb-2">
            Daily Reward! 🎉
          </h2>

          <p className="text-center text-amber-800 dark:text-amber-100 text-sm mb-6">
            Great job checking in today. Come back tomorrow for another reward!
          </p>

          {/* Points Display */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl px-8 py-4 shadow-lg">
                <div className="text-center">
                  <p className="text-amber-900 text-sm font-semibold mb-1">
                    You earned
                  </p>
                  <p className="text-4xl font-bold text-amber-900">+{points}</p>
                  <p className="text-amber-900 text-sm font-semibold mt-1">
                    POINTS
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Awesome! 🚀
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

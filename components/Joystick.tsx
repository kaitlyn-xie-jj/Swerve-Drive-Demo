import React, { useRef, useState, useEffect } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove, label, className = '', disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = (clientX: number, clientY: number) => {
    if (disabled) return;
    setIsDragging(true);
    updatePosition(clientX, clientY);
  };

  const handleEnd = () => {
    if (disabled) return;
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxDist = rect.width / 2; // radius

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setPosition({ x: dx, y: dy });
    
    // OUTPUT COORDINATES:
    // Screen X is +Right. Screen Y is +Down.
    // We want +Y Up. So invert Y.
    const normalizedX = dx / maxDist;
    const normalizedY = -(dy / maxDist); // Invert Screen Y
    
    onMove(normalizedX, normalizedY);
  };

  useEffect(() => {
    const handleWindowMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        updatePosition(e.clientX, e.clientY);
      }
    };
    const handleWindowUp = () => {
      if (isDragging) handleEnd();
    };

    window.addEventListener('mousemove', handleWindowMove);
    window.addEventListener('mouseup', handleWindowUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('mouseup', handleWindowUp);
    };
  }, [isDragging]);

  return (
    <div className={`flex flex-col items-center ${className} ${disabled ? 'opacity-50 grayscale' : ''}`}>
      <div 
        ref={containerRef}
        className="w-32 h-32 rounded-full bg-slate-100 border-2 border-slate-300 relative cursor-pointer touch-none shadow-inner"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => {
           if(isDragging) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
        }}
        onTouchEnd={handleEnd}
      >
        {/* Background Crosshairs to indicate axes */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-slate-200"></div>

        <div 
          className="w-12 h-12 rounded-full bg-robot-accent absolute shadow-lg transition-transform duration-75 ease-out flex items-center justify-center text-white/50 text-xs"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          }}
        >
          {/* Arrow on joystick handle */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45">
             <path d="M12 19V5" />
             <path d="M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>
      {label && <span className="mt-2 text-sm font-semibold text-slate-600 uppercase tracking-wider">{label}</span>}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { SwerveCanvas } from '../components/SwerveCanvas';
import { calculateSwerveStates, optimizeModuleState } from '../utils/kinematics';
import { Joystick } from '../components/Joystick';
import { SwerveModuleState } from '../types';

export const Scene2_Rotation: React.FC = () => {
  const [omega, setOmega] = useState(0);
  const [currentModules, setCurrentModules] = useState<SwerveModuleState[]>([]);

  // Constants
  const WIDTH = 200;
  const LENGTH = 200;

  useEffect(() => {
    // Translation is 0
    // Omega scaling: input is small, multiply for kinematics visualization
    const targets = calculateSwerveStates(0, 0, omega, WIDTH, LENGTH);

    const optimized = targets.map((target, i) => {
        const current = currentModules[i] || target;
        const opt = optimizeModuleState(target.angle, target.speed, current.angle);
        return { ...target, angle: opt.angle, speed: opt.speed };
    });

    setCurrentModules(optimized);
  }, [omega]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full items-center justify-center p-6 gap-8">
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
             <h2 className="text-xl font-bold text-amber-900 mb-2">Scene B: Pure Rotation</h2>
             <p className="text-amber-800 text-sm">
                 Translation is locked to (0,0). <br/>
                 Use the slider to rotate the robot (ω).
             </p>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
            Wheels are tangent to the circle centered on the robot.<br/>
            <strong>Positive ω (CCW)</strong> turns the robot counter-clockwise.
        </p>

        <div className="flex flex-col items-center pt-4">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rotation Rate (ω)</label>
             <input 
                type="range" 
                min="-0.1" max="0.1" step="0.001"
                value={omega}
                onChange={(e) => setOmega(parseFloat(e.target.value))}
                className="w-64 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-robot-accent mb-2"
             />
             <div className="flex justify-between w-64 text-xs font-mono text-slate-400">
                 <span>CW (-)</span>
                 <span>0</span>
                 <span>CCW (+)</span>
             </div>
        </div>
        
        <div className="flex justify-center opacity-50 grayscale pointer-events-none scale-75">
            <Joystick onMove={()=>{}} label="Translation (Locked)" disabled />
        </div>
      </div>

      <div className="lg:w-2/3 flex justify-center">
        <SwerveCanvas 
            modules={currentModules} 
            chassisVelocity={{x: 0, y: 0}} 
            width={450} 
            height={450} 
        />
      </div>
    </div>
  );
};


import React, { useState, useMemo, useEffect } from 'react';
import { Joystick } from '../components/Joystick';
import { SwerveCanvas } from '../components/SwerveCanvas';
import { calculateSwerveStates, optimizeModuleState } from '../utils/kinematics';
import { SwerveModuleState } from '../types';

export const Scene1_Translation: React.FC = () => {
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(0);

  // Maintain previous states for optimization continuity
  const [currentModules, setCurrentModules] = useState<SwerveModuleState[]>([]);

  // Constants (Module Positions +/- 100)
  const WIDTH = 200;
  const LENGTH = 200;

  useEffect(() => {
    // Calculate naive target states
    const targets = calculateSwerveStates(vx * 200, vy * 200, 0, WIDTH, LENGTH); // Scale up joystick input

    // Optimize against current states to prevent flipping
    const optimized = targets.map((target, i) => {
        const current = currentModules[i] || target;
        const opt = optimizeModuleState(target.angle, target.speed, current.angle);
        return { ...target, angle: opt.angle, speed: opt.speed };
    });

    setCurrentModules(optimized);
  }, [vx, vy]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full items-center justify-center p-6 gap-8">
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <h2 className="text-xl font-bold text-blue-900 mb-2">Scene A: Pure Translation</h2>
             <p className="text-blue-800 text-sm">
                 Rotation (ω) is locked to 0. <br/>
                 Move the joystick to translate the robot.
             </p>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
            <strong>Coordinate System:</strong><br/>
            +X is Forward (Up). +Y is Left.<br/>
            Notice that for pure translation, all wheels point in the same direction as the chassis vector.
        </p>

        <div className="flex justify-center pt-4">
            {/* Joystick: Up -> +Y visual -> +X Robot (Forward). Left -> -X visual -> +Y Robot (Left) */}
            <Joystick 
                onMove={(x, y) => { 
                    // Joystick Output: x (Right=+1), y (Up=+1) 
                    // Robot Input: Vx (Forward=+1) = y. Vy (Left=+1) = -x.
                    setVx(y); 
                    setVy(-x); 
                }} 
                label="Translation" 
            />
        </div>
        <div className="text-center font-mono text-xs text-slate-400">
            Vx: {vx.toFixed(2)} | Vy: {vy.toFixed(2)}
        </div>
      </div>

      <div className="lg:w-2/3 flex justify-center">
        <SwerveCanvas 
            modules={currentModules} 
            chassisVelocity={{x: vx * 200, y: vy * 200}} 
            width={450} 
            height={450} 
        />
      </div>
    </div>
  );
};

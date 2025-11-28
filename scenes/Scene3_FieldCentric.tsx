
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Joystick } from '../components/Joystick';
import { SwerveCanvas } from '../components/SwerveCanvas';
import { calculateSwerveStates, optimizeModuleState, normalizeAngle } from '../utils/kinematics';
import { SwerveModuleState, RobotPose } from '../types';

export const Scene3_Combined: React.FC = () => {
  // Inputs (Field Centric)
  const [fieldVx, setFieldVx] = useState(0); // Field Up (+X)
  const [fieldVy, setFieldVy] = useState(0); // Field Left (+Y)
  const [omega, setOmega] = useState(0); // CCW

  // Simulation State
  const [pose, setPose] = useState<RobotPose>({ x: 0, y: 0, heading: 0 });
  const [trail, setTrail] = useState<{x: number, y: number}[]>([]);
  const [currentModules, setCurrentModules] = useState<SwerveModuleState[]>([]);

  // Refs for animation loop
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const poseRef = useRef<RobotPose>({ x: 0, y: 0, heading: 0 });
  const trailRef = useRef<{x: number, y: number}[]>([]);
  const lastTrailUpdateRef = useRef<number>(0);
  const moduleStateCacheRef = useRef<SwerveModuleState[] | undefined>(undefined);
  
  // Need refs for inputs to access inside animation frame
  const inputsRef = useRef({ fieldVx, fieldVy, omega });
  
  useEffect(() => {
    inputsRef.current = { fieldVx, fieldVy, omega };
  }, [fieldVx, fieldVy, omega]);

  // Constants
  const WIDTH = 200;
  const LENGTH = 200;
  const MAX_SPEED = 150; // pixels per second
  const MAX_OMEGA = 90; // degrees per second
  
  // Field Bounds for Clamping (approximate based on canvas size 600x500)
  // Screen Width 600 = Field Y range +/- 300
  // Screen Height 500 = Field X range +/- 250
  const BOUNDS = { x: 200, y: 250 }; 

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      const dt = Math.min(deltaTime, 0.1); 

      const { fieldVx: inVx, fieldVy: inVy, omega: inOmega } = inputsRef.current;
      
      // 1. Inputs are Field Centric Velocities
      const fVx = inVx * MAX_SPEED; // Field Up
      const fVy = inVy * MAX_SPEED; // Field Left
      const rOmegaDeg = inOmega * MAX_OMEGA; // degrees/sec
      
      // 2. Update Pose Integration (Field Centric)
      let nextX = poseRef.current.x + fVx * dt;
      let nextY = poseRef.current.y + fVy * dt;

      // Simple clamp to keep robot in view
      if (nextX > BOUNDS.x) nextX = BOUNDS.x;
      if (nextX < -BOUNDS.x) nextX = -BOUNDS.x;
      if (nextY > BOUNDS.y) nextY = BOUNDS.y;
      if (nextY < -BOUNDS.y) nextY = -BOUNDS.y;

      poseRef.current = {
        x: nextX,
        y: nextY,
        heading: normalizeAngle(poseRef.current.heading + rOmegaDeg * dt)
      };

      // 3. Trail Logic
      if (time - lastTrailUpdateRef.current > 100 && (Math.abs(fVx) > 1 || Math.abs(fVy) > 1)) {
          trailRef.current = [...trailRef.current, { x: poseRef.current.x, y: poseRef.current.y }].slice(-100); 
          lastTrailUpdateRef.current = time;
      }

      // 4. Kinematics: Transform Field Velocity to Robot Velocity
      // We need Robot-Relative translation to calculate wheel states.
      // Rotate Field Vector by -Heading.
      // vx_robot = Vx_field * cos(theta) + Vy_field * sin(theta)
      // vy_robot = -Vx_field * sin(theta) + Vy_field * cos(theta)
      
      const thetaRad = poseRef.current.heading * Math.PI / 180;
      const cosT = Math.cos(thetaRad);
      const sinT = Math.sin(thetaRad);

      const rVx = fVx * cosT + fVy * sinT;
      const rVy = -fVx * sinT + fVy * cosT;
      
      // Omega in radians/sec for kinematics function?
      // calculateSwerveStates uses linear velocity form: vx - omega * y.
      // If y is pixels, vx is pixels/s. omega must be radians/s.
      const omegaRad = rOmegaDeg * Math.PI / 180;
      
      // 5. Calculate and Optimize Modules
      if (!moduleStateCacheRef.current) {
          moduleStateCacheRef.current = calculateSwerveStates(0, 0, 0, WIDTH, LENGTH);
      }
      
      const rawTargets = calculateSwerveStates(rVx, rVy, omegaRad, WIDTH, LENGTH);
      const optimized = rawTargets.map((t, i) => {
          const prev = moduleStateCacheRef.current?.[i] || t;
          const opt = optimizeModuleState(t.angle, t.speed, prev.angle);
          return { ...t, angle: opt.angle, speed: opt.speed };
      });
      
      moduleStateCacheRef.current = optimized;
      setCurrentModules(optimized);
    }
    previousTimeRef.current = time;
    
    setPose({ ...poseRef.current });
    setTrail([...trailRef.current]);

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  const handleReset = () => {
      poseRef.current = { x: 0, y: 0, heading: 0 };
      trailRef.current = [];
      setPose({ x: 0, y: 0, heading: 0 });
      setTrail([]);
  };

  // Robot Frame Velocity for visualization (arrow on chassis)
  // We need to re-calculate this for the render pass outside the loop or store it.
  // We can just calculate it on the fly from current state + inputs for display.
  // Or, cleaner: just use the inputsRef + pose.
  const getRobotVelocityForDisplay = () => {
     const { fieldVx, fieldVy } = inputsRef.current;
     const fVx = fieldVx * MAX_SPEED;
     const fVy = fieldVy * MAX_SPEED;
     const thetaRad = pose.heading * Math.PI / 180;
     const rVx = fVx * Math.cos(thetaRad) + fVy * Math.sin(thetaRad);
     const rVy = -fVx * Math.sin(thetaRad) + fVy * Math.cos(thetaRad);
     return { x: rVx, y: rVy };
  };

  const robotVel = getRobotVelocityForDisplay();

  return (
    <div className="flex flex-col lg:flex-row h-full w-full items-center justify-center p-6 gap-8">
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
             <h2 className="text-xl font-bold text-purple-900 mb-2">Scene C: Field-Centric Control</h2>
             <p className="text-purple-800 text-sm">
                 The Joystick moves the robot North/South/East/West on the field, regardless of which way the robot is facing.
             </p>
        </div>
        
        <div className="flex flex-col gap-6 pt-4 items-center">
            {/* Joystick Inputs are Field Centric: Up is Field Up (+X) */}
            <Joystick 
                onMove={(x, y) => { 
                    setFieldVx(y); // Joystick Up -> Field +X
                    setFieldVy(-x); // Joystick Left -> Field +Y
                }} 
                label="Field Translation" 
            />
            
            <div className="w-full max-w-[200px]">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">Rotation (ω)</label>
                 <input 
                    type="range" 
                    min="-1" max="1" step="0.01"
                    value={omega}
                    onChange={(e) => setOmega(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-robot-accent"
                 />
                 <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                     <span>CW</span>
                     <span>STOP</span>
                     <span>CCW</span>
                 </div>
            </div>

            <button 
                onClick={handleReset}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-sm font-bold transition-colors"
            >
                Reset Position
            </button>

            <div className="text-xs text-slate-400 font-mono text-center">
                Heading: {Math.round(pose.heading)}°<br/>
                Pos: ({Math.round(pose.x)}, {Math.round(pose.y)})
            </div>
        </div>
      </div>

      <div className="lg:w-2/3 flex justify-center">
        <SwerveCanvas 
            modules={currentModules} 
            chassisVelocity={robotVel} 
            pose={pose}
            trail={trail}
            width={600} 
            height={500} 
        />
      </div>
    </div>
  );
};

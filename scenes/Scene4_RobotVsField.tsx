
import React, { useState, useEffect } from 'react';
import { normalizeAngle, optimizeModuleState } from '../utils/kinematics';

export const Scene4_Optimization: React.FC = () => {
  const [targetAngle, setTargetAngle] = useState(0);
  
  // State for Optimized Module simulation
  // We store the continuous angle to show the smooth transition logic
  const [optAngle, setOptAngle] = useState(0);
  const [optSpeed, setOptSpeed] = useState(1);

  // Naive module just follows target directly
  const naiveAngle = targetAngle;

  useEffect(() => {
    // Run optimization against the previous optimized state
    const result = optimizeModuleState(targetAngle, 1, optAngle);
    setOptAngle(result.angle);
    setOptSpeed(result.speed);
  }, [targetAngle]);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6 gap-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl">
        <h2 className="text-2xl font-bold text-robot-wheel">Scene D: Minimal Steering Angle</h2>
        <p className="text-slate-600 mt-2">
            If the target is > 90° away, the wheel flips drive direction instead of turning all the way around.
        </p>
      </div>

      {/* Control */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-sm font-bold text-slate-700 mb-2">Desired Direction: <span className="text-robot-accent">{targetAngle}°</span></label>
        <input 
            type="range" 
            min="-180" max="180" 
            value={targetAngle} 
            onChange={(e) => setTargetAngle(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-robot-accent"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
            <span>-180°</span>
            <span>0° (Forward)</span>
            <span>+180°</span>
        </div>
      </div>

      {/* Comparison Display */}
      <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full">
        
        {/* Naive Module */}
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center shadow-lg">
                <div className="absolute top-2 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Naive Steering</div>
                
                {/* Module Visualization */}
                {/* Visual Rotate: -Angle (since Angle is CCW, CSS is CW) */}
                <div 
                    className="w-12 h-24 bg-robot-wheel rounded border-2 border-slate-600 relative transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${-naiveAngle}deg)` }} 
                >
                    {/* Direction Arrow */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white"></div>
                    
                    {/* Velocity Vector (Always Forward for naive) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[2px] h-16 bg-red-400">
                         <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-red-400"></div>
                    </div>
                </div>
            </div>
            <p className="text-sm text-slate-500 text-center w-48">
                Always rotates to match exact angle.<br/>
                <span className="text-red-500 font-mono">Steering: {naiveAngle}°</span>
            </p>
        </div>

        <div className="hidden md:block w-px h-32 bg-slate-200"></div>

        {/* Optimized Module */}
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48 bg-white rounded-full border-2 border-green-200 ring-4 ring-green-50 flex items-center justify-center shadow-lg">
                <div className="absolute top-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Optimized</div>
                
                {/* Module Visualization */}
                <div 
                    className="w-12 h-24 bg-robot-wheel rounded border-2 border-slate-600 relative transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${-optAngle}deg)` }} 
                >
                     {/* Direction Arrow on wheel (always points "front" of wheel) */}
                     <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white"></div>

                    {/* Velocity Vector (Can flip!) */}
                    {/* If speed is negative, vector points down relative to wheel */}
                    <div 
                        className={`absolute left-1/2 -translate-x-1/2 w-[2px] h-16 bg-green-500 transition-all duration-300 origin-bottom`}
                        style={{
                            top: 0,
                            transform: `translateY(-100%) rotate(${optSpeed < 0 ? 180 : 0}deg)`
                        }}
                    >
                         <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-green-500"></div>
                    </div>
                </div>
            </div>
             <p className="text-sm text-slate-500 text-center w-48">
                Turns shortest distance.<br/>
                <span className="text-green-600 font-mono">Steering: {Math.round(optAngle)}°</span><br/>
                <span className="text-green-600 font-mono">Drive: {optSpeed > 0 ? 'FWD' : 'REV'}</span>
            </p>
        </div>

      </div>
    </div>
  );
};

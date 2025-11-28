
import React from 'react';
import { SwerveModuleState, Vector2, RobotPose } from '../types';

interface SwerveCanvasProps {
  modules: SwerveModuleState[];
  chassisVelocity: Vector2; // Vx (Forward), Vy (Left) in Robot Frame
  pose?: RobotPose; // If provided, renders in Field Mode
  trail?: { x: number; y: number }[]; // Trail history in Field Coordinates
  width?: number;
  height?: number;
  showLabels?: boolean;
}

export const SwerveCanvas: React.FC<SwerveCanvasProps> = ({ 
  modules, 
  chassisVelocity,
  pose,
  trail = [],
  width = 500, 
  height = 500,
  showLabels = true
}) => {
  // Coordinate Transform
  // Robot/Field Frame: +X Up, +Y Left. Center (0,0)
  // Screen Frame: +X Right, +Y Down. Center (cx, cy)
  
  const cx = width / 2;
  const cy = height / 2;
  const scale = 1; // Pixels per unit

  // Transform Field/Robot coordinates (rx, ry) to Screen coordinates (sx, sy)
  // Field X (Up) -> Screen -Y (Up)
  // Field Y (Left) -> Screen -X (Left)
  const toScreen = (rx: number, ry: number) => ({
    x: cx - ry * scale,
    y: cy - rx * scale
  });

  // Calculate robot screen position and rotation
  // If pose is missing, we center the robot (Scene 1 & 2 behavior)
  const robotScreenPos = pose 
    ? toScreen(pose.x, pose.y) 
    : { x: cx, y: cy };
    
  const robotRotation = pose ? pose.heading : 0;

  // Trail Points (Only relevant if pose is present)
  const trailPoints = trail.map(p => {
    const s = toScreen(p.x, p.y);
    return `${s.x},${s.y}`;
  }).join(' ');

  return (
    <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden select-none" style={{ width, height }}>
      {/* Grid Background */}
      <div className="absolute inset-0" 
           style={{ 
             backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             backgroundPosition: 'center'
           }}>
      </div>
      
      {/* Coordinate Axis Legend (Fixed on screen) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10 bg-white/80 p-2 rounded backdrop-blur-sm border border-slate-100">
          <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-slate-600"></div>
                  <div className="w-0.5 h-6 bg-slate-600"></div>
              </div>
              <span className="text-xs font-bold text-slate-600">+X (Forward)</span>
          </div>
          <div className="flex items-center gap-2 -mt-2">
              <div className="flex items-center">
                   <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[8px] border-r-slate-600"></div>
                   <div className="w-6 h-0.5 bg-slate-600"></div>
              </div>
              <span className="text-xs font-bold text-slate-600">+Y (Left)</span>
          </div>
      </div>

      {/* Trail Layer */}
      {trail.length > 1 && (
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          <polyline 
            points={trailPoints} 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-60"
          />
        </svg>
      )}

      {/* Robot Container */}
      <div 
        className="absolute w-0 h-0 transition-transform duration-75 linear will-change-transform"
        style={{
            left: robotScreenPos.x,
            top: robotScreenPos.y,
            // Rotate the robot container.
            // Robot Angle is CCW (+). Screen Rotation is CW (+).
            // So we rotate by -heading.
            transform: `rotate(${-robotRotation}deg)`
        }}
      >
          {/* Robot Body Visuals (Relative to robot center) */}
          {modules.length > 0 && (
              <div className="absolute border-2 border-slate-400 bg-slate-100/80 rounded-lg shadow-sm backdrop-blur-[2px]"
                style={{
                    // Dimensions 200x200 centered
                    width: 200,
                    height: 200,
                    left: -100,
                    top: -100,
                }}
              >
                  {/* Front Indicator */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-300">
                      FRONT
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  </div>
              </div>
          )}

          {/* Modules (Relative to robot center) */}
          {modules.map((mod) => {
            // Internal coordinate mapping:
            // mod.position.x is Up (+X). In CSS relative to center, this is -top.
            // mod.position.y is Left (+Y). In CSS relative to center, this is -left.
            const left = -mod.position.y; 
            const top = -mod.position.x;
            
            return (
              <div key={mod.id} className="absolute w-0 h-0" style={{ left, top }}>
                 
                 {/* Module Label */}
                 {showLabels && (
                     <div className={`absolute text-[10px] text-slate-500 font-mono w-16 text-center select-none
                         ${mod.id.includes('F') ? '-top-10' : 'top-6'}
                         ${mod.id.includes('L') ? '-left-8' : '-left-8'}
                     `}>
                         {mod.id}
                     </div>
                 )}

                 {/* Wheel Container */}
                 {/* Rotation: 
                     Robot Angle 0 is Up (+X).
                     CSS Rotate 0 is Up.
                     Robot Angle 90 is Left (+Y).
                     CSS Rotate -90 is Left.
                     So CSS = -mod.angle.
                  */}
                 <div 
                    className="absolute w-6 h-12 bg-robot-wheel rounded-sm border border-slate-600 -translate-x-1/2 -translate-y-1/2 shadow-md transition-transform duration-300 ease-out"
                    style={{ 
                        transform: `translate(-50%, -50%) rotate(${-mod.angle}deg)` 
                    }}
                 >
                     {/* Wheel Direction Arrow (White Triangle Pointing Up relative to wheel) */}
                     <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-white"></div>
                     
                     {/* Wheel Stripe */}
                     <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-600"></div>
                 </div>

                 {/* Velocity Vector (Orange Arrow) */}
                 {Math.abs(mod.speed) > 0.1 && (
                     <div 
                        className="absolute top-0 left-0 bg-robot-vector origin-bottom h-full w-[2px] z-20 pointer-events-none transition-transform duration-300 ease-out"
                        style={{
                            height: Math.min(80, Math.abs(mod.speed) * 0.4),
                            // See comments in Scene 1/2 regarding speed/angle flip.
                            // The angle passed in is already optimized (flipped if needed).
                            // If speed is negative, it means we are driving backwards relative to the flipped angle.
                            // BUT optimizeModuleState returns angle + 180 and speed * -1.
                            // So the vector should point along `angle` but backwards?
                            // No. If angle is 180 away, and we drive -speed, we drive towards original target.
                            // Let's rely on the fact that if we rotate by angle, and speed is negative,
                            // we should just flip the arrow 180 deg?
                            // Actually: If mod.speed < 0, we add 180 to rotation.
                            transform: `rotate(${-mod.angle + (mod.speed < 0 ? 180 : 0)}deg) translateY(-100%)` 
                        }}
                     >
                         <div className="absolute -top-[4px] -left-[3px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-robot-vector"></div>
                     </div>
                 )}
              </div>
            );
          })}

          {/* Chassis Velocity Vector (Blue Arrow from Center) */}
          {/* This is in Robot Frame. Since this div is rotated by Robot Heading,
              this vector will visually rotate with the robot, which is correct
              (Robot-Relative Chassis Velocity). 
          */}
          {Math.sqrt(chassisVelocity.x**2 + chassisVelocity.y**2) > 0.1 && (
              <div 
                className="absolute top-0 left-0 w-[4px] bg-blue-500 z-30 origin-bottom rounded-full pointer-events-none transition-transform duration-100 opacity-80"
                style={{ 
                    height: Math.min(200, Math.sqrt(chassisVelocity.x**2 + chassisVelocity.y**2) * 1),
                    // atan2(y, x). 0 is Up (+X). 
                    // CSS Rotate 0 is Up.
                    // Robot Left (+Y) -> CSS -90.
                    // So CSS = -RobotAngle.
                    transform: `rotate(${-Math.atan2(chassisVelocity.y, chassisVelocity.x) * 180 / Math.PI}deg) translateY(-100%)` 
                }}
              >
                <div className="absolute -top-[8px] -left-[6px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-blue-500"></div>
              </div>
          )}
      </div>

    </div>
  );
};


import { SwerveModuleState } from '../types';

const RAD_TO_DEG = 180 / Math.PI;

export const normalizeAngle = (degrees: number): number => {
  let angle = degrees % 360;
  if (angle > 180) angle -= 360;
  if (angle <= -180) angle += 360;
  return angle;
};

/**
 * Optimizes the target module state to minimize rotation.
 * If target is > 90deg from current, flips the wheel direction and speed.
 * Returns an angle closest to currentAngle (continuous) for smooth animation.
 */
export const optimizeModuleState = (
  targetAngle: number, 
  targetSpeed: number, 
  currentAngle: number
): { angle: number; speed: number } => {
  
  // Calculate the minimal rotation to get to targetAngle
  let delta = normalizeAngle(targetAngle - currentAngle);
  
  let finalAngle = targetAngle;
  let finalSpeed = targetSpeed;

  // If we have to turn more than 90 degrees, flip the wheel instead
  if (Math.abs(delta) > 90) {
    // The target angle is 180 deg away from the raw target
    finalAngle = targetAngle + 180;
    finalSpeed = -targetSpeed;
    // Re-calculate delta to the flipped angle
    delta = normalizeAngle(finalAngle - currentAngle);
  }
  
  // Return the angle relative to currentAngle so CSS transitions don't spin wildly
  return {
    angle: currentAngle + delta,
    speed: finalSpeed
  };
};

export const calculateSwerveStates = (
  vx: number, // Robot X velocity (Forward/Up)
  vy: number, // Robot Y velocity (Left/Left)
  omega: number, // Rotation (CCW +)
  width: number,
  length: number
): SwerveModuleState[] => {
  // Robot Geometry in Robot Frame (X Forward, Y Left):
  const L = length / 2;
  const W = width / 2;

  // FL: Front (+X) Left (+Y)
  // FR: Front (+X) Right (-Y)
  // RL: Rear (-X) Left (+Y)
  // RR: Rear (-X) Right (-Y)
  const modules = [
    { id: 'FL', x: L, y: W },
    { id: 'FR', x: L, y: -W },
    { id: 'RL', x: -L, y: W },
    { id: 'RR', x: -L, y: -W },
  ];

  return modules.map((mod) => {
    // Velocity of wheel = V_robot + Omega x R
    // V_robot = (vx, vy)
    // Omega = (0, 0, w)
    // R = (mod.x, mod.y, 0)
    // Omega x R = (-w*mod.y, w*mod.x, 0)
    
    // vx_i = vx - w * ry
    // vy_i = vy + w * rx
    const vx_i = vx - omega * mod.y;
    const vy_i = vy + omega * mod.x;

    const speed = Math.sqrt(vx_i * vx_i + vy_i * vy_i);
    
    // Angle: 0 is +X (Forward), 90 is +Y (Left)
    // atan2(y, x) gives angle from X axis towards Y axis (if we map X->X, Y->Y)
    let angle = Math.atan2(vy_i, vx_i) * RAD_TO_DEG;

    return {
      id: mod.id,
      position: { x: mod.x, y: mod.y },
      velocity: { x: vx_i, y: vy_i },
      angle,
      speed,
    };
  });
};


export interface Vector2 {
  x: number; // Forward (+X is Up on screen)
  y: number; // Left (+Y is Left on screen)
}

export interface SwerveModuleState {
  id: string; // 'FL', 'FR', 'RL', 'RR'
  position: Vector2; // Relative to robot center in Robot Frame (X Up, Y Left)
  velocity: Vector2; // Velocity vector in Robot Frame
  angle: number; // Degrees, 0 is +X (Forward), Positive is CCW (towards +Y Left)
  speed: number; // Magnitude
}

export interface RobotPose {
  x: number; // Field X (Up)
  y: number; // Field Y (Left)
  heading: number; // Degrees CCW
}

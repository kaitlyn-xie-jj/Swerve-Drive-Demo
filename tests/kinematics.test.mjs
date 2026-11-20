import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSwerveStates, optimizeModuleState, normalizeAngle } from '../utils/kinematics.ts';

const byId = (modules, id) => modules.find((module) => module.id === id);

test('all four modules receive identical velocity during pure translation', () => {
  const modules = calculateSwerveStates(1, 0, 0, 0.5, 0.5);
  assert.deepEqual(modules.map((module) => module.id), ['FL', 'FR', 'RL', 'RR']);
  for (const module of modules) {
    assert.deepEqual(module.velocity, { x: 1, y: 0 });
    assert.equal(module.speed, 1);
    assert.equal(module.angle, 0);
  }
});

test('CCW rotation gives tangential wheel velocities at all four corners', () => {
  const modules = calculateSwerveStates(0, 0, 1, 2, 2);
  assert.deepEqual(byId(modules, 'FL').velocity, { x: -1, y: 1 });
  assert.deepEqual(byId(modules, 'FR').velocity, { x: 1, y: 1 });
  assert.deepEqual(byId(modules, 'RL').velocity, { x: -1, y: -1 });
  assert.deepEqual(byId(modules, 'RR').velocity, { x: 1, y: -1 });
  for (const module of modules) {
    assert.ok(Math.abs(module.speed - Math.SQRT2) < 1e-12);
  }
});

test('translation and rotation combine in robot coordinates', () => {
  const modules = calculateSwerveStates(0.5, -0.25, 2, 0.5, 0.5);
  assert.deepEqual(byId(modules, 'FL').velocity, { x: 0, y: 0.25 });
  assert.equal(byId(modules, 'FL').speed, 0.25);
  assert.equal(byId(modules, 'FL').angle, 90);
});

test('steering optimization reverses wheel direction only beyond 90 degrees', () => {
  assert.deepEqual(optimizeModuleState(170, 1, 0), { angle: -10, speed: -1 });
  assert.deepEqual(optimizeModuleState(45, 1, 0), { angle: 45, speed: 1 });
  assert.deepEqual(optimizeModuleState(-179, 1, 179), { angle: 181, speed: 1 });
});

test('angles wrap into (-180, 180] consistently', () => {
  assert.equal(normalizeAngle(190), -170);
  assert.equal(normalizeAngle(-190), 170);
  assert.equal(normalizeAngle(-180), 180);
});

test('steering optimization preserves the velocity vector and limits steering travel', () => {
  const radians = angle => angle * Math.PI / 180;
  for (const current of [-720, -180, -90, 0, 90, 179, 720]) {
    for (let target = -360; target <= 360; target += 15) {
      const state = optimizeModuleState(target, 2.5, current);
      assert.ok(Math.abs(state.angle - current) <= 90 + 1e-10);
      assert.ok(Math.abs(state.speed * Math.cos(radians(state.angle)) - 2.5 * Math.cos(radians(target))) < 1e-10);
      assert.ok(Math.abs(state.speed * Math.sin(radians(state.angle)) - 2.5 * Math.sin(radians(target))) < 1e-10);
    }
  }
});

test('rectangular chassis has tangential speeds and zero net translation in pure yaw', () => {
  const modules = calculateSwerveStates(0, 0, -2, 0.4, 0.8);
  for (const m of modules) {
    assert.ok(Math.abs(m.velocity.x * m.position.x + m.velocity.y * m.position.y) < 1e-12);
    assert.ok(Math.abs(m.speed - 2 * Math.hypot(0.2, 0.4)) < 1e-12);
  }
  assert.ok(Math.abs(modules.reduce((sum, m) => sum + m.velocity.x, 0)) < 1e-12);
  assert.ok(Math.abs(modules.reduce((sum, m) => sum + m.velocity.y, 0)) < 1e-12);
});

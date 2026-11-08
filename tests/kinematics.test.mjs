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

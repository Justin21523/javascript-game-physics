// js/physics.js
import { Vector2D }              from './vector2d.js';

/**
 * computeAcceleration
 * 計算加速度 a = F / m
 * @param {Vector2D} force 合力向量 (N)
 * @param {number} mass   質量 (kg)
 * @returns {Vector2D}     加速度向量 (m/s²)
 */
export function computeAcceleration(force, mass) {
  // a = F/m
  return force.multiply(1 / mass);
}

/**
 * eulerIntegrate
 * 單步 Euler 積分
 *  v_{n+1} = v_n + a_n * dt
 *  x_{n+1} = x_n + v_{n+1} * dt
 * @param {Vector2D} position     當前位置 x_n
 * @param {Vector2D} velocity     當前速度 v_n
 * @param {Vector2D} acceleration 當前加速度 a_n
 * @param {number} dt             時間步長 (秒)
 * @returns {{ position: Vector2D, velocity: Vector2D }}
 */
export function eulerIntegrate(position, velocity, acceleration, dt) {
  const vNew = velocity.add(acceleration.multiply(dt));     // v_{n+1}
  const xNew = position.add(vNew.multiply(dt));             // x_{n+1}
  return { position: xNew, velocity: vNew };
}

/**
 * verletIntegrate
 * 單步 Verlet 積分（更穩定，保留前一位置）
 *  x_{n+1} = 2 x_n - x_{n-1} + a_n * dt²
 *  v 可從 (x_{n+1} - x_{n-1}) / (2 dt) 計算
 * @param {Vector2D} prevPos      前一步位置 x_{n-1}
 * @param {Vector2D} currPos      當前位置 x_n
 * @param {Vector2D} acceleration 當前加速度 a_n
 * @param {number} dt             時間步長 (秒)
 * @returns {Vector2D}            下一步位置 x_{n+1}
 */
export function verletIntegrate(prevPos, currPos, acceleration, dt) {
  // x_{n+1} = 2x_n - x_{n-1} + a_n * dt²
  const term1 = currPos.multiply(2).subtract(prevPos);
  const term2 = acceleration.multiply(dt * dt);
  return term1.add(term2);
}

/**
 * computeSpringForce
 * 彈簧力：Hooke’s Law F = -k (|d| - restLength) · unit(d)
 * @param {Vector2D} posA       質點 A 位置
 * @param {Vector2D} posB       質點 B 位置
 * @param {number} k            彈簧常數
 * @param {number} restLength   自然長度
 * @returns {Vector2D}           作用在 A 上的力 (指向 B)
 */
export function computeSpringForce(posA, posB, k, restLength) {
  const d = posB.subtract(posA);             // 相對位移向量
  const extension = d.length() - restLength; // 拉伸量 Δx
  // F = -k Δx · unit(d)
  return d.unit().multiply(-k * extension);
}

/**
 * computeFrictionForce
 * 粘滯摩擦力：F = -μ v
 * @param {Vector2D} velocity  速度向量
 * @param {number} mu          摩擦係數
 * @returns {Vector2D}          摩擦力向量
 */
export function computeFrictionForce(velocity, mu) {
  return velocity.multiply(-mu);
}

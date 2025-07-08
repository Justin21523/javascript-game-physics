// src/chapter3/js/geometry.js
import { Vector2D } from './vector2d.js';

/** 計算兩點距離 */
export function distance(a, b) {
  return a.sub(b).length();
}

/** 向量線性插值：t ∈ [0,1] */
export function lerp(a, b, t) {
  return a.scale(1 - t).add(b.scale(t));
}

/** 將數值限制在 [min, max] */
export function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

/** 將 point 繞 origin 旋轉 angle 弧度 */
export function rotate(point, angle, origin = new Vector2D(0, 0)) {
  const p = point.sub(origin);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const x = p.x * cos - p.y * sin;
  const y = p.x * sin + p.y * cos;
  return new Vector2D(x, y).add(origin);
}

// src/chapter3/js/vector2d.js

/**
 * 2D 向量類別
 */
export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  scale(s) {
    return new Vector2D(this.x * s, this.y * s);
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length();
    return len === 0 ? new Vector2D(0, 0) : this.scale(1 / len);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  static fromAngle(angle, length = 1) {
    return new Vector2D(Math.cos(angle) * length, Math.sin(angle) * length);
  }
}

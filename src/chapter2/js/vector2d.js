// js/vector2d.js
// Vector2D 類別：二維向量運算封裝
export class Vector2D {
  /**
   * 建構子：建立新的向量
   * @param {number} x  X 分量
   * @param {number} y  Y 分量
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /** 向量加法：v + this */
  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }
  /** 向量減法：this – v */
  subtract(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }
  /**
   * 以 k 縮放後再加到自己：this + k·v
   * 對應 F=ma 中的 a = F/m 時，可寫成 addScaled(force, 1/m)
   */
  addScaled(v, k) {
    return this.add(v.multiply(k));
  }
  /** 純量乘法：k·this */
  multiply(k) {
    return new Vector2D(this.x * k, this.y * k);
  }
  /** 向量長度（大小）||v|| = sqrt(x²+y²) */
  length() {
    return Math.hypot(this.x, this.y);
  }
  // 向量長度平方 (x²+y²)，計算效率較高
  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }
  /** 點積：this · v = x1·x2 + y1·y2 */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  /** 單位向量 (unit vector)：v / ||v|| */
  unit() {
    const len = this.length();
    return len > 0 ? this.multiply(1 / len) : new Vector2D(0, 0);
  }
  /** 反向向量：-this */
  negate() {
    return new Vector2D(-this.x, -this.y);
  }
  /** 靜態：零向量 */
  static zero() {
    return new Vector2D(0, 0);
  }
  /** 依角度建立單位向量，theta 單位為弧度 */
  static fromAngle(theta) {
    return new Vector2D(Math.cos(theta), Math.sin(theta));
  }
}


/**
 * 計算點 p 到線段 v→w 的最短距離
 * - p, v, w 都是 Vector2D
 * - 回傳一個純量距離
 */
export function distancePointToSegment(p, v, w) {
  const vw = w.subtract(v);
  const l2 = vw.lengthSquared();
  if (l2 === 0) {
    // 若線段退化成一點，直接回傳 p↔v 距離
    return p.subtract(v).length();
  }
  // 將 p 投影到無限線 vw 上的參數 t
  let t = p.subtract(v).dot(vw) / l2;
  t = Math.max(0, Math.min(1, t));  // 鉛錘限制在 [0,1] 線段之內
  const projection = v.add(vw.multiply(t));
  return p.subtract(projection).length();
}

/**
 * 判定點 p 是否位於三角形 ABC 內部（排除邊界情況也可）
 * - 使用重心座標法 (barycentric coordinates)
 */
export function pointInTriangle(p, a, b, c) {
  const v0 = c.subtract(a);
  const v1 = b.subtract(a);
  const v2 = p.subtract(a);
  const dot00 = v0.dot(v0);
  const dot01 = v0.dot(v1);
  const dot02 = v0.dot(v2);
  const dot11 = v1.dot(v1);
  const dot12 = v1.dot(v2);
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  return u >= 0 && v >= 0 && (u + v < 1);
}

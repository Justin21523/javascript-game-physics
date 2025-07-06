// js/physicsSystem.js
/**
 * 更新一組 PhysicsObject 物件，並剔除跑出邊界的
 * @param {PhysicsObject[]} objs
 * @param {number} dt
 * @param {object} config
 * @param {HTMLCanvasElement} canvas
 * @returns {PhysicsObject[]} 還在畫布內的物件
 */
export function updateDynamics(objs, dt, config, canvas, ui) {
  const survivors = [];
  for (const obj of objs) {
    obj.update(dt, config);                // 物件自己累 Force + 積分
    if (!obj.isOutOfBounds(canvas)) {
      survivors.push(obj);                // 還沒出界就留下來
    }else{
      ui.removeFromSelection(obj);
    }
  }
  return survivors;
}

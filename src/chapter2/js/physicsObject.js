// js/physicsObject.js
import { Vector2D } from './vector2d.js';
import {
  computeAcceleration,
  eulerIntegrate,
  verletIntegrate,
  computeSpringForce,
  computeFrictionForce
} from './physics.js';

export class PhysicsObject {
  constructor(mass = 1, type) {
    this.mass     = mass;
    this.type = type;
    this.position = new Vector2D(0, 0);
    this.prevPos  = this.position;
    this.velocity = new Vector2D(0, 0);
    this.force    = new Vector2D(0, 0);
    this.thrust   = 0;   // ← 每个物件自己的推力

  }

  applyForce(f) {
    this.force = this.force.add(f);
  }

  /**
   * 每一帧：
   *  1) 重置合力
   *  2) 加入水平推力 this.thrust
   *  3) 加入重力、摩擦、弹簧
   *  4) F→a, a→v,x→x
   */
  update(dt, config) {
    // 1. 重置
    this.force = Vector2D.zero();

    // 2. 水平推力 (每帧都作用)
    //    如果不想持续推，就只在新建或选中时更新 velocity 即可，
// 这里示范持续推：
    if (this.thrust !== 0) {
      this.applyForce(new Vector2D(this.thrust, 0));
    }

    // 3. 重力
    if (config.enableGravity) {
      this.applyForce(new Vector2D(0, config.gravity * this.mass));
    }

    // 4. 摩擦
    if (config.enableFriction) {
      this.applyForce(
        computeFrictionForce(this.velocity, config.muGround)
      );
    }

    // 5. 弹簧
    if (config.enableSpring) {
      const center = new Vector2D(
        config.canvasWidth / 2,
        config.canvasHeight / 2
      );
      this.applyForce(
        computeSpringForce(
          this.position,
          center,
          config.springK,
          config.restLength
        )
      );
    }

    // 6. F = m a
    const a = computeAcceleration(this.force, this.mass);

    // 7. 积分
    let nextPos, nextVel;
    if (config.integration === 'euler') {
      ({ position: nextPos, velocity: nextVel } =
        eulerIntegrate(this.position, this.velocity, a, dt)
      );
    } else {
      nextPos = verletIntegrate(this.prevPos, this.position, a, dt);
      nextVel = nextPos
        .subtract(this.prevPos)
        .multiply(1 / (2 * dt));
    }

    // 8. 更新
    this.prevPos  = this.position;
    this.position = nextPos;
    this.velocity = nextVel;
  }

  isOutOfBounds(canvas) {
    const { x, y } = this.position;
    return x < 0 || x > canvas.width || y < 0 || y > canvas.height;
  }

  draw(ctx) {
    throw new Error('Subclasses must implement draw()');
  }
}

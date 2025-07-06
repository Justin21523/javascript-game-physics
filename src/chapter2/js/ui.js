// js/ui.js
import { config } from './config.js';
import { Vector2D } from './vector2d.js';

export class UIController {
  /**
   * @param {object} config 全域設定 (含 template 子欄位)
   */
  constructor(config) {
    this.config = config;

    // 目前選取的動態物件陣列
    this.selectedObjects = [];
    this.inSelectionMode = false;

    // 先把所有 DOM 元件抓下來
    this.elems = {
      // — Chapter1：Shape & 斜坡／摩擦／回彈 —
      friction:       document.getElementById('enable-friction'),
      muGround:       document.getElementById('mu-ground'),
      muGroundVal:    document.getElementById('mu-ground-val'),
      thrust:         document.getElementById('thrust'),        // 原本平台推力
      thrustVal:      document.getElementById('thrust-val'),
      restitution:    document.getElementById('restitution'),
      restitutionVal: document.getElementById('restitution-val'),

      // — Chapter2：模板相關（放置時用）—
      templateColor:  document.getElementById('template-color'),
      templateWidth:  document.getElementById('template-width'),
      templateHeight: document.getElementById('template-height'),
      templateRadius: document.getElementById('template-radius'),
      templateLine:   document.getElementById('template-line'),
      templateAngle:  document.getElementById('template-angle'),
      // ← mass 與 thrust 同時用於「放置後物件」及「選取時調整」
      objectMass:     document.getElementById('param-objectMass'),
      initialThrust:  document.getElementById('param-initialThrust'),
      initialThrustVal: document.getElementById('param-initialThrust-val'),

      // — Chapter2：全域 Physics 開關 —
      integration:    document.getElementById('param-integration'),
      enableGravity:  document.getElementById('param-enableGravity'),
      enableFriction: document.getElementById('param-enableFriction'),
      enableSpring:   document.getElementById('param-enableSpring'),
      springK:        document.getElementById('param-springK'),
      restLength:     document.getElementById('param-restLength'),

      // — Chapter2：Canvas & 動畫  —
      canvasWidth:    document.getElementById('param-canvasWidth'),
      canvasHeight:   document.getElementById('param-canvasHeight'),
      clearColor:     document.getElementById('param-clearColor'),
      showFPS:        document.getElementById('param-showFPS'),
      showAxes:       document.getElementById('param-showAxes'),
      gridSpacing:    document.getElementById('param-gridSpacing'),
      gridSpacingVal: document.getElementById('param-gridSpacing-val'),
      timeScale:      document.getElementById('param-timeScale'),
      timeScaleVal:   document.getElementById('param-timeScale-val'),
    };

    this._bindAll();

    // ESC 鍵取消選取 & 隱藏預覽
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.clearSelectionMode();
        window.dispatchEvent(new CustomEvent('selectionCleared'));
      }
    });

  }

  /** 綁定所有 UI 事件 */
  _bindAll() {
    // —— Chapter1: Shape & 基本參數 ——
    this.elems.friction.addEventListener('change', e => {
      this.config.enableFriction = e.target.checked;
    });
    this.elems.muGround.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      this.config.muGround = v;
      this.elems.muGroundVal.textContent = v.toFixed(2);
    });

    this.elems.restitution.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      this.config.restitution = v;
      this.elems.restitutionVal.textContent = v.toFixed(2);
    });

    // —— Chapter2: 模板參數 （放置時用） ——
    this.elems.templateColor.addEventListener('input', e => {
      this.config.template.color = e.target.value;
    });
    this.elems.templateWidth.addEventListener('input', e => {
      this.config.template.width = parseFloat(e.target.value);
    });
    this.elems.templateHeight.addEventListener('input', e => {
      this.config.template.height = parseFloat(e.target.value);
    });
    this.elems.templateRadius.addEventListener('input', e => {
      this.config.template.radius = parseFloat(e.target.value);
    });
    this.elems.templateLine.addEventListener('input', e => {
      this.config.template.lineLength = parseFloat(e.target.value);
    });
    this.elems.templateAngle.addEventListener('input', e => {
      this.config.template.angle = parseFloat(e.target.value);
    });

    // —— Chapter2: Mass & Thrust ——
    // mass：若在選取模式，就改選取物件；否則改模板設定
    this.elems.objectMass.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (this.inSelectionMode) {
        this.selectedObjects.forEach(o => o.mass = v);
      } else {
        this.config.template.mass = v;
      }
    });

    // thrust：同 mass，但立即更新初速
    this.elems.initialThrust.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      this.elems.initialThrustVal.textContent = v;
      if (this.inSelectionMode) {
        // 只改被选物件的 thrust
        this.selectedObjects.forEach(o => o.thrust = v);
      } else {
        // 改模板，下一次放置才生效
        this.config.template.thrust = v;
      }
    });

    // —— Chapter2: 全域 Physics ——
    this.elems.integration.addEventListener('change', e => {
      this.config.integration = e.target.value;
    });
    this.elems.enableGravity.addEventListener('change', e => {
      this.config.enableGravity = e.target.checked;
    });
    this.elems.enableFriction.addEventListener('change', e => {
      this.config.enableFriction = e.target.checked;
    });
    this.elems.enableSpring.addEventListener('change', e => {
      this.config.enableSpring = e.target.checked;
    });
    this.elems.springK.addEventListener('input', e => {
      this.config.springK = parseFloat(e.target.value);
    });
    this.elems.restLength.addEventListener('input', e => {
      this.config.restLength = parseFloat(e.target.value);
    });

    // —— Chapter2: Canvas & 動畫 ——
    this.elems.canvasWidth.addEventListener('change', e => {
      this.config.canvasWidth = parseInt(e.target.value, 10);
    });
    this.elems.canvasHeight.addEventListener('change', e => {
      this.config.canvasHeight = parseInt(e.target.value, 10);
    });
    this.elems.clearColor.addEventListener('input', e => {
      this.config.clearColor = e.target.value;
    });
    this.elems.showFPS.addEventListener('change', e => {
      this.config.showFPS = e.target.checked;
    });
    this.elems.showAxes.addEventListener('change', e => {
      this.config.showAxes = e.target.checked;
    });
    this.elems.gridSpacing.addEventListener('input', e => {
      const v = parseInt(e.target.value, 10);
      this.config.gridSpacing = v;
      this.elems.gridSpacingVal.textContent = v;
    });
    this.elems.timeScale.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      this.config.timeScale = v;
      this.elems.timeScaleVal.textContent = v.toFixed(1);
    });
  }


  /**
   * 單一加入選取，保留原本選取
   * @param {PhysicsObject} o
   */
  addToSelection(o) {
    if (!this.inSelectionMode) {
      this.inSelectionMode = true;
      this.selectedObjects = [];
      window.dispatchEvent(new CustomEvent('selectionStarted'));
    }
    if (!this.selectedObjects.includes(o)) {
      this.selectedObjects.push(o);
    }
  }

  /**
   * 從選取中移除
   * @param {PhysicsObject} o
   */
  removeFromSelection(o) {
    const i = this.selectedObjects.indexOf(o);
    if (i !== -1) this.selectedObjects.splice(i, 1);
    if (this.selectedObjects.length === 0) {
      this.clearSelectionMode();
      window.dispatchEvent(new CustomEvent('selectionCleared'));
    }
  }

  /** ESC 或明確取消時呼叫，退出選取模式 */
  clearSelectionMode() {
    if (!this.inSelectionMode) return;
    this.inSelectionMode = false;
    this.selectedObjects = [];
    // 恢復控制 UI 到模板設定
    this.elems.objectMass.value       = this.config.template.mass;
    this.elems.initialThrust.value    = this.config.template.thrust;
    this.elems.initialThrustVal.textContent = this.config.template.thrust;

  }
}

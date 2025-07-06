// js/shapePalette.js
import { config }         from './config.js';
import { Ball }           from './ball.js';
import { Box }            from './box.js';
import { Line }           from './lineShape.js';
import { Triangle }       from './triangle.js';
import {
  Vector2D,
  distancePointToSegment,
  pointInTriangle
} from './vector2d.js';

/**
 * ShapePalette：模板選擇與放置
 */
export class ShapePalette {
  constructor(uiController, shapesArray, dynamicsArray, canvas) {
    this.ui = uiController;     // 可存取 config
    this.shapes = shapesArray;  // 全域 shapes 陣列
    this.dynamics = dynamicsArray;   // 全域 dynamics 陣列
    this.currentTool = null;    // 'rect', 'rectangle', 'circle', 'line'
    this.currentAngle = 0;      // 直線放置角度 (rad)
    // 新增：canvas 與 ctx
    this.canvas = canvas;
    this.ctx      = this.canvas.getContext('2d');
    this.previewEl = document.getElementById('template-preview');
    this.mx = 0;
    this.my = 0;              // 滑鼠在 canvas 上的座標

    // 準備一個 params 物件並立刻從表單讀一次預設值
    this.params = {};
    this._readParams();
    // this._bindPalette();
    this._bindPaletteButtons();
    this._bindCanvasHandlers();  // ← 綁定 click / dblclick

    this._bindParams();
    this._bindGlobalMouse();

  }

  // 綁定模板按鈕
  _bindPaletteButtons() {
    document.querySelectorAll('#shape-palette .tool').forEach(el => {
      el.addEventListener('click', () => {
        // 樣式
        document.querySelectorAll('#shape-palette .tool')
          .forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        // 設定工具
        this.currentTool = el.dataset.tool;
        // 重新讀一次所有參數
        this._readParams();
        if (this.currentTool !== 'select'){
          // 顯示 preview
          this._showPreview();
        }
      });
    });
  }


  _bindCanvasHandlers() {
    // 點一下：放模板 + 建立動態物件
    this.canvas.addEventListener('click', e => {
      if (!this.currentTool) return;
      // 1. 先重新讀一次所有模板參數
      this._readParams();
      // 計算在 canvas 上的位置
      const rect = this.canvas.getBoundingClientRect();
      // 假設 canvas 實際解析度與 CSS 不同
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      // 測試
      const ctx = this.canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();

      console.log('Canvas click, currentTool=', this.currentTool);

      // —— 選取模式 ——
      if (this.currentTool === 'select') {
        // 反向遍歷，只選第一個命中
        for (let i = this.dynamics.length - 1; i >= 0; i--) {
          const o = this.dynamics[i];
          if (hitTest(o, x, y)) {
            this.ui.addToSelection(o);
            this.hidePreview();
            break;
          }
        }
        return;
      }

      // 1. 靜態放模板
      const tpl = config.template;

      // // each shape
      // const s = { type: this.currentTool, color: tpl.color };
      // const angle = tpl.angle * Math.PI/180;
      // switch (this.currentTool) {
      //   case 'circle':
      //     s.x = x; s.y = y; s.r = tpl.radius;
      //     break;
      //   case 'rect':
      //     s.x = x; s.y = y; s.w = tpl.width; s.h = tpl.height;
      //     break;
      //   case 'square':
      //     s.x = x; s.y = y; s.w = tpl.width; s.h = tpl.width;
      //     break;
      //   case 'line':
      //     s.x1 = x; s.y1 = y;
      //     s.x2 = x + tpl.lineLength * Math.cos(angle);
      //     s.y2 = y + tpl.lineLength * Math.sin(angle);
      //     s.lineWidth = 2;
      //     break;
      //   case 'triangle':
      //     s.x = x; s.y = y; s.w = tpl.width; s.h = tpl.height;
      //     break;
      // }
      // this.shapes.push(s);

      // 2. 動態物件：用同樣的模板參數建立 PhysicsObject
      let obj;
      const m = tpl.mass, F0 = tpl.thrust;
      const width = tpl.width, height = tpl.height;
      const color = tpl.color, radius = tpl.radius, lineLength = tpl.lineLength;

      switch (this.currentTool) {
        case 'circle':
          obj = new Ball(radius, color, m);
          obj.position = new Vector2D(x, y);
          break;
        case 'rect':
          obj = new Box(width, height, color, m, 'rect');
          obj.position = new Vector2D(x - obj.w / 2, y - obj.h / 2);
           break;
        case 'square':
          obj = new Box(width, width, color, m, 'square');
          obj.position = new Vector2D(x - obj.w / 2, y - obj.w / 2);
          break;
        case 'line':
          obj = new Line(lineLength, angle, color, m);
          obj.position = new Vector2D(x - obj.length / 2, y - obj.lineWidth / 2);
          break;
        case 'triangle':
          obj = new Triangle(width, height, color, m);
          obj.position = new Vector2D(x - obj.w / 2, y + obj.h / 2);
          break;
        default:
          return;
      }

      obj.prevPos  = obj.position;
      obj.thrust   = F0;                      // 每顆物件專屬推力
      obj.velocity = new Vector2D(F0 / m, 0); // 一次性初速 初始推力當水平初速：vₓ = F₀ / m
      this.dynamics.push(obj);
      this._clearSelection();
    });

    // 雙擊：反向遍歷，依照形狀判定 click 命中並移除
    this.canvas.addEventListener('dblclick', e => {
      // 計算在 canvas 上的位置
      const rect = this.canvas.getBoundingClientRect();
      // 假設 canvas 實際解析度與 CSS 不同
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      for (let i = this.dynamics.length - 1; i >= 0; i--) {
        const o = this.dynamics[i];
        if (hitTest(o, x, y)) {
          this.dynamics.splice(i, 1);
          this.ui.removeFromSelection(o);
          break;
        }
      }

    });

    /**
     * 命中測試：
     * - Ball：點到圓心距≤半徑
     * - Box：中心對齊的矩形，水平／垂直絕對差 ≤ w/2, h/2
     * - Line：計算點到線段最短距離 ≤ 5px
     * - Triangle：重心座標法判定
     */
    function hitTest(o, px, py) {
      if (o instanceof Ball) {
      // 1) 先算滑鼠點 (px,py) 到圓心 o.position 的向量
      const d = o.position.subtract(new Vector2D(px, py));
      // 2) 如果平方距離 ≤ 半徑平方，代表點在圓內
      return d.lengthSquared() <= o.radius * o.radius;
      }
      if (o instanceof Box) {
        const center = new Vector2D(o.position.x + o.w/2, o.position.y + o.h/2)
        return Math.abs(px - center.x) <= o.w/2
            && Math.abs(py - center.y) <= o.h/2;
      }
      if (o instanceof Line) {
        const v1 = o.position;
        const v2 = new Vector2D(
          v1.x + o.length*Math.cos(o.angle),
          v1.y + o.length*Math.sin(o.angle)
        );
        return distancePointToSegment(new Vector2D(px,py), v1, v2) <= 5;
      }
      if (o instanceof Triangle) {
        // 三角形三頂點
        const A = new Vector2D(o.position.x - o.w/2, o.position.y);
        const B = new Vector2D(o.position.x + o.w/2, o.position.y);
        const C = new Vector2D(o.position.x, o.position.y - o.h);
        return pointInTriangle(new Vector2D(px,py), A, B, C);
      }
      return false;
    }

  }

  /**綁定參數欄位的 input 事件
   * 綁定#template-... 的 input 事件，
   * 任何變動都會重新讀取參數到 this.params
   */
  _bindParams() {
    ['color','width','height','radius','line','angle'].forEach(id => {
      const inp = document.getElementById(`template-${id}`);
      inp.addEventListener('input', () => {
        this._readParams();  // 更新參數
        this._updatePreviewStyle();
      });
    });
  }

  // 監聽全域鼠標移動
  _bindGlobalMouse() {
    document.addEventListener('mousemove', e => {
      if (!this.currentTool) return;
      // 跟隨滑鼠 12px 偏移 隨時移動
      this.previewEl.style.left = e.pageX + 12 + 'px';
      this.previewEl.style.top  = e.pageY + 12 + 'px';
    });
  }

  // 讀取更新所有參數到 this.params
  _readParams() {
    this.params.color   = document.getElementById('template-color').value;
    this.params.w       = document.getElementById('template-width').value;
    this.params.h       = document.getElementById('template-height').value;
    this.params.radius  = document.getElementById('template-radius').value;
    this.params.len     = document.getElementById('template-line').value;
    this.params.angle   = document.getElementById('template-angle').value * Math.PI/180;
  }

  // 顯示並更新 preview 樣式
  _showPreview() {
    // 更新預覽樣式（尺寸、顏色、旋轉、glow 邊框）
    this._updatePreviewStyle();
    this.previewEl.style.display = 'block';
  }

  // 隱藏 preview
  hidePreview() {
    this.previewEl.style.display = 'none';
  }


  // 根據 this.currentTool 與 this.params 更新 DOM 樣式
  _updatePreviewStyle() {
    const p = this.params, el = this.previewEl;
    // 初始清除
    el.innerHTML = '';
    el.style.transform = '';
    // 公用邊框與 glow
    el.style.boxShadow       = '0 0 8px rgba(255,255,0,0.8)';
    el.style.border          = '2px solid ' + p.color;
    el.style.backgroundColor = (this.currentTool ==='line' ? 'transparent' : p.color);

    if (this.currentTool === 'rect' ) {
      el.style.width  = p.w + 'px';
      el.style.height = p.h + 'px';
      el.style.borderRadius = '4px';
    }
    else if (this.currentTool === 'square' ) {
      el.style.width  = p.w + 'px';
      el.style.height = p.w + 'px';
      el.style.borderRadius = '4px';
    }
    else if (this.currentTool === 'circle') {
      el.style.width  = p.radius*2 + 'px';
      el.style.height = p.radius*2 + 'px';
      el.style.borderRadius = '50%';
    }
    else if (this.currentTool === 'line') {
      // 直線：寬度 = len，高度 = 2px
      el.style.width  = p.len + 'px';
      el.style.height = '2px';
      el.style.border = 'none';
      el.style.backgroundColor = p.color;
      // 旋轉 同時保留CSS裡的 translate(-50%,-50%)
      el.style.transform = `translate(-50%,-50%) rotate(${p.angle}rad)`;
    }
  }

  _clearSelection() {
    this.currentTool = null;
    this.hidePreview();
    document.querySelectorAll('#shape-palette .tool')
      .forEach(e => e.classList.remove('selected'));
  }

  /**
   * drawShape：靜態繪製使用者放置的 shapes
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} shape   // 要繪製的 shape 物件
   */
  drawShape(ctx, shape) {
    // 1. 設定顏色（支援填充與線條）
    ctx.fillStyle   = shape.color || '#3498db';
    ctx.strokeStyle = shape.color || '#3498db';
    // 2. 根據 shape.type 決定繪製方式
    switch (shape.type) {
      case 'square':
        // 正方形：x, y, w, w
        ctx.fillRect(shape.x, shape.y, shape.w, shape.w);
        break;
      case 'rect':
        // 矩形：x, y, w, h
        ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
        break;
      case 'circle':
        // 圓形：x, y, r
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.r, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'line':
        // 線段：x1, y1 → x2, y2
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        // 可自訂線寬，否則預設 2px
        ctx.lineWidth = shape.lineWidth || 2;
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x + shape.w/2, shape.y - shape.h);
        ctx.lineTo(shape.x + shape.w, shape.y);
        ctx.closePath();
        ctx.fill();
        break;

      default:
        // 未知類型，可放警告或留空
        console.warn('Unknown shape type:');
    }
  }


}

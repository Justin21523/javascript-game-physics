// js/main.js

import { getDeltaTime }       from './utils.js';
import { UIController }       from './ui.js';
import { config }             from './config.js';
import { ShapePalette }       from './shapePalette.js';
import { updateDynamics }        from './physicsSystem.js';
import { drawGrid, drawAxes } from './renderUtils.js';


// ---------------------------
// 全域物件與初始設定
// ---------------------------
const canvas       = document.getElementById('gameCanvas');
const ctx          = canvas.getContext('2d');
const ui           = new UIController(config);  // UI 綁定

// 物件放置工具：靜態 shapes 陣列 + Palette
const shapes       = [];
// 動態圖形樣式陣列
const dynamics = [];
const palette      = new ShapePalette(ui, shapes, dynamics, canvas);


// 隱藏預覽：選取開始／結束都要
window.addEventListener('selectionStarted',  () => palette.hidePreview());
window.addEventListener('selectionCleared',  () => palette.hidePreview());

// 主動畫迴圈
// ---------------------------
let lastTime = performance.now();

function loop(now) {
  // 0. 計算 rawDt（秒）與套用 timeScale
  const rawDt = getDeltaTime(lastTime, now);
  const dt    = rawDt * config.timeScale;
  lastTime    = now;

  // 同步畫布尺寸
  canvas.width  = config.canvasWidth;
  canvas.height = config.canvasHeight;
  // 1. 同步 UI → config (Physics 控制、Canvas 控制)
  Object.assign(config, ui.config);

  // 2. 清空畫布（保留 CSS 背景色）
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 3. 格線與座標軸（疊加繪製）
  if (config.gridSpacing) drawGrid(ctx, canvas.width, canvas.height, config.gridSpacing);
  if (config.showAxes)    drawAxes(ctx, canvas.width, canvas.height);

  // 先畫靜態模板
  // shapes.forEach(s => palette.drawShape(ctx, s));

  // 更新 & 繪製動態物件
  //（含自動剔除出界）
  const survivors = updateDynamics(dynamics, dt, config, canvas, ui);
  dynamics.length = 0;   // 清空
  dynamics.push(...survivors);
  dynamics.forEach(obj => obj.draw(ctx));

  //  高亮被選取物件
  if (ui.inSelectionMode) {
    ctx.save();
    ctx.lineWidth   = 3;
    ctx.strokeStyle = 'orange';
    ui.selectedObjects.forEach(o => {
      if (o.position) {
        if (o.radius != null) {
          // Ball
          ctx.beginPath();
          ctx.arc(o.position.x, o.position.y, o.radius+4, 0, 2*Math.PI);
          ctx.stroke();
        } else if (o.w != null && o.h != null) {
          // Box or Triangle
          ctx.strokeRect(o.position.x-4, o.position.y-4, o.w+8, o.h+8);
        } else if (o.length != null) {
          // Line
          const x1 = o.position.x, y1 = o.position.y;
          const x2 = x1 + o.length*Math.cos(o.angle);
          const y2 = y1 + o.length*Math.sin(o.angle);
          ctx.beginPath();
          ctx.moveTo(x1,y1);
          ctx.lineTo(x2,y2);
          ctx.stroke();
        }
      }
    });
    ctx.restore();
  }

  // 顯示 FPS
  if (config.showFPS) {
    ctx.font = '16px sans-serif';
    ctx.strokeStyle = '#000'; // 黑色輪廓
    ctx.lineWidth = 2;
    ctx.strokeText(`FPS: ${(1/rawDt).toFixed(1)}`, 10, 20);

    ctx.fillStyle = '#fff'; // 白色填充
    ctx.fillText(`FPS: ${(1/rawDt).toFixed(1)}`, 10, 20);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

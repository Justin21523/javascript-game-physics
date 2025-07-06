// js/renderUtils.js

/**
 * 繪製背景格線
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width  畫布寬度
 * @param {number} height 畫布高度
 * @param {number} spacing 格線間距
 * @param {string} color  線條顏色
 */
export function drawGrid(ctx, width, height, spacing, color = '#333') {
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1;
  for (let x = 0; x <= width;  x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * 繪製畫布中心座標軸
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width  畫布寬度
 * @param {number} height 畫布高度
 * @param {string} color  線條顏色
 */
export function drawAxes(ctx, width, height, color = '#f00') {
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  // 垂直 Y 軸
  ctx.beginPath();
  ctx.moveTo(width/2, 0);
  ctx.lineTo(width/2, height);
  ctx.stroke();
  // 水平 X 軸
  ctx.beginPath();
  ctx.moveTo(0, height/2);
  ctx.lineTo(width, height/2);
  ctx.stroke();
}

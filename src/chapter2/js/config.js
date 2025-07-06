// js/config.js
export const config = {
  // … 你現有的 canvas, physics, template 設定 …
  // ——畫布 & 動畫——
  canvasWidth:   800,
  canvasHeight:  600,
  clearColor:    '#000',
  showFPS:       true,
  showAxes:      false,
  gridSpacing:   50,
  timeScale:     1.0,

  // 全域物理開關
  enableGravity: false,
  enableThrust:  true,
  gravity:       1,
  enableFriction:false,
  muGround:      0.8,
  enableSpring:  false,
  springK:       0.1,
  restLength:    100,
  integration:   'euler',
  thrust:  300,

  // 模板參數
  template: {
    color:      '#3498db',
    width:      100,
    height:     100,
    radius:     50,
    lineLength: 100,
    angle:      0,
    mass:       100,
    thrust:     0,
  }

};

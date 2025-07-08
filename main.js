// src/chapter3/js/main.js
import { Vector2D } from "./src/chapter3/js/vector2d.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let origin = new Vector2D(200, 200);
let mouse = new Vector2D(0, 0);

canvas.addEventListener("mousemove", (e) => {
  mouse = new Vector2D(e.offsetX, e.offsetY);
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const v = mouse.sub(origin);
  const unit = v.normalize().scale(100);

  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0077ff";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(origin.x + unit.x, origin.y + unit.y);
  ctx.stroke();

  requestAnimationFrame(draw);
}

draw();

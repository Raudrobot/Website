const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let DPR = Math.max(1, window.devicePixelRatio || 1);
let W=0,H=0;

function resize(){
  DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth+'px';
  canvas.style.height = window.innerHeight+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  W=window.innerWidth;H=window.innerHeight;
}
window.addEventListener('resize',resize,{passive:true});
resize();

const colors=['#06b6d4','#8b5cf6','#facc15'];
const particles=[];
const NUM=Math.floor(Math.min(80,Math.max(24,W/12)));
for(let i=0;i<NUM;i++){
  particles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.6,vy:(Math.random()-0.5)*0.6,size:Math.random()*6+2,color:colors[Math.floor(Math.random()*colors.length)],alpha:Math.random()*0.6+0.3});
}

let mouse={x:W/2,y:H/2};
window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;},{passive:true});
window.addEventListener('touchmove',e=>{if(e.touches&&e.touches[0]){mouse.x=e.touches[0].clientX;mouse.y=e.touches[0].clientY;}},{passive:true});

function hexToRgba(hex,a){const c=hex.replace('#','');const r=parseInt(c.substring(0,2),16);const g=parseInt(c.substring(2,4),16);const b=parseInt(c.substring(4,6),16);return `rgba(${r},${g},${b},${a})`;}

function drawParticles(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(6,10,20,0.12)';
  ctx.fillRect(0,0,W,H);
  particles.forEach(p=>{
    let dx=mouse.x-p.x,dy=mouse.y-p.y;
    let d=Math.sqrt(dx*dx+dy*dy)||1;
    let force=Math.max(0,180-d)/180;
    p.vx+=(dx/d)*0.06*force+(Math.random()-0.5)*0.02;
    p.vy+=(dy/d)*0.06*force+(Math.random()-0.5)*0.02;
    p.vx*=0.96;p.vy*=0.96;
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<-40)p.x=W+40;if(p.x>W+40)p.x=-40;if(p.y<-40)p.y=H+40;if(p.y>H+40)p.y=-40;
    let grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*6);
    grd.addColorStop(0,hexToRgba(p.color,p.alpha));
    grd.addColorStop(1,hexToRgba(p.color,0));
    ctx.beginPath();ctx.fillStyle=grd;ctx.arc(p.x,p.y,p.size*3,0,Math.PI*2);ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// scroll reveal
const sections=document.querySelectorAll('.section');
const obs=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting)en.target.classList.add('visible');});},{threshold:0.12});
sections.forEach(s=>obs.observe(s));

// theme toggle
const themeBtn=document.getElementById('theme-toggle');
if(themeBtn){theme

import {useEffect,useRef} from 'react';

// Falling gold glitter that trails the pointer. 2D canvas, additive blending.
// Disabled on touch / no-hover devices and when reduced motion is requested.
const MAX=320;

function makeSprite(){
  const s=64,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');
  const glow=g.createRadialGradient(32,32,0,32,32,32);
  glow.addColorStop(0,'rgba(255,236,190,.9)');glow.addColorStop(.25,'rgba(214,176,100,.35)');glow.addColorStop(1,'rgba(180,140,70,0)');
  g.fillStyle=glow;g.fillRect(0,0,s,s);
  g.fillStyle='rgba(255,244,214,1)';g.beginPath();
  g.moveTo(32,4);g.quadraticCurveTo(34,30,60,32);g.quadraticCurveTo(34,34,32,60);g.quadraticCurveTo(30,34,4,32);g.quadraticCurveTo(30,30,32,4);g.fill();
  return c;
}

export default function Sparkles(){
  const ref=useRef(null);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||window.matchMedia('(hover: none)').matches)return;
    const canvas=ref.current,ctx=canvas.getContext('2d'),sprite=makeSprite(),parts=[];
    let w=0,h=0,raf=0,last=0,lx=null,ly=null;
    const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);};
    resize();
    const spawn=(x,y,n)=>{for(let i=0;i<n&&parts.length<MAX;i++)parts.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,vx:(Math.random()-.5)*.7,vy:-Math.random()*.6,size:5+Math.random()*11,rot:Math.random()*6.28,spin:(Math.random()-.5)*.08,life:50+Math.random()*50,age:0});};
    const frame=t=>{
      const dt=Math.min(2,(t-(last||t))/16.67);last=t;
      ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
      for(let i=parts.length-1;i>=0;i--){
        const p=parts[i];p.age+=dt;if(p.age>=p.life){parts.splice(i,1);continue;}
        p.vy+=.035*dt;p.vx*=.995;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.spin*dt;
        const k=1-p.age/p.life,tw=.6+.4*Math.sin(p.age*.5+i);
        ctx.globalAlpha=k*tw;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);const s=p.size*(.5+k*.5);ctx.drawImage(sprite,-s/2,-s/2,s,s);ctx.restore();
      }
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      raf=parts.length?requestAnimationFrame(frame):0;last=raf?last:0;
    };
    const move=e=>{
      if(e.pointerType&&e.pointerType!=='mouse')return;
      const d=lx==null?20:Math.hypot(e.clientX-lx,e.clientY-ly);
      if(d<6)return;lx=e.clientX;ly=e.clientY;
      spawn(lx,ly,Math.min(3,1+(d/25|0)));
      if(!raf)raf=requestAnimationFrame(frame);
    };
    addEventListener('pointermove',move,{passive:true});addEventListener('resize',resize);
    return()=>{removeEventListener('pointermove',move);removeEventListener('resize',resize);cancelAnimationFrame(raf);};
  },[]);
  return <canvas ref={ref} className="sparkle-layer" aria-hidden="true"/>;
}

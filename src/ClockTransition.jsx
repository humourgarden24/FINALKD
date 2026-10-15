import {useEffect,useRef} from 'react';
import gsap from 'gsap';

const DURATION=1.5;

function gearPath(cx,cy,teeth,rOuter,rInner){
  const pts=[],step=Math.PI*2/teeth;
  for(let i=0;i<teeth;i++){
    const a=i*step;
    [[a,rInner],[a+step*.18,rOuter],[a+step*.5,rOuter],[a+step*.68,rInner]].forEach(([ang,r])=>pts.push(`${(cx+Math.cos(ang)*r).toFixed(2)} ${(cy+Math.sin(ang)*r).toFixed(2)}`));
  }
  return 'M'+pts.join(' L')+' Z';
}

const gearBig=gearPath(200,200,24,150,132);
const gearSmall=gearPath(200,200,12,52,42);

// Antique brass clock overlay. Runs for exactly 1.5s: fades in, spins, fades out.
// onMid fires while the overlay is fully opaque (the page swaps behind it); onDone fires at 1.5s.
export default function ClockTransition({label,onMid,onDone}){
  const root=useRef(null),callbacks=useRef({onMid,onDone});
  useEffect(()=>{callbacks.current={onMid,onDone};},[onMid,onDone]);
  useEffect(()=>{
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'none'}});
      tl.fromTo(root.current,{opacity:0},{opacity:1,duration:.4,ease:'power2.out'},0)
        .to(root.current,{opacity:0,duration:.5,ease:'power2.in'},DURATION-.5)
        .fromTo('.clock-gear-big',{rotation:0,svgOrigin:'200 200'},{rotation:120,svgOrigin:'200 200',duration:DURATION},0)
        .fromTo('.clock-gear-small',{rotation:0,svgOrigin:'200 200'},{rotation:-240,svgOrigin:'200 200',duration:DURATION},0)
        .fromTo('.clock-minute',{rotation:0,svgOrigin:'200 200'},{rotation:720,svgOrigin:'200 200',duration:DURATION,ease:'power1.inOut'},0)
        .fromTo('.clock-hour',{rotation:-60,svgOrigin:'200 200'},{rotation:60,svgOrigin:'200 200',duration:DURATION,ease:'power1.inOut'},0)
        .fromTo('.clock-face',{scale:.92,svgOrigin:'200 200'},{scale:1.04,svgOrigin:'200 200',duration:DURATION,ease:'power1.out'},0)
        .call(()=>callbacks.current.onMid?.(),null,.75)
        .call(()=>callbacks.current.onDone?.(),null,DURATION);
    },root);
    return()=>ctx.revert();
  },[]);
  return <div className="clock-transition" role="status" aria-label={'Travelling through time to '+label} ref={root}>
    <svg className="clock-svg" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d1b27a"/><stop offset=".5" stopColor="#8f6f3f"/><stop offset="1" stopColor="#5d4527"/></linearGradient>
        <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#1a130b"/><stop offset="1" stopColor="#0a0706"/></radialGradient>
      </defs>
      <g className="clock-face">
        <circle cx="200" cy="200" r="190" fill="url(#faceGlow)" stroke="url(#brass)" strokeWidth="6"/>
        <circle cx="200" cy="200" r="176" fill="none" stroke="#6e5530" strokeWidth="1"/>
        <path className="clock-gear-big" d={gearBig} fill="none" stroke="#8f6f3f" strokeWidth="1.4" opacity=".55"/>
        <path className="clock-gear-small" d={gearSmall} fill="none" stroke="#b79a62" strokeWidth="1.2" opacity=".6"/>
        {Array.from({length:60},(_,i)=><line key={i} x1="200" y1={i%5===0?30:36} x2="200" y2="44" stroke={i%5===0?'#c9a96a':'#7a6039'} strokeWidth={i%5===0?2.4:1} transform={`rotate(${i*6} 200 200)`}/>)}
        <g className="clock-hour"><path d="M200 214 L194 200 L200 118 L206 200 Z" fill="url(#brass)"/></g>
        <g className="clock-minute"><path d="M200 218 L196.5 200 L200 62 L203.5 200 Z" fill="#c9a96a"/></g>
        <circle cx="200" cy="200" r="9" fill="url(#brass)" stroke="#3d2d17" strokeWidth="1.5"/>
        <circle cx="200" cy="200" r="3" fill="#0a0706"/>
      </g>
    </svg>
    <p className="clock-label">TRAVELLING THROUGH TIME</p>
    <h2 className="clock-title">{label}</h2>
  </div>;
}

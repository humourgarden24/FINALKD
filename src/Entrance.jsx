import {useEffect,useRef} from 'react';
import gsap from 'gsap';

function Split({text,unit='char'}){
  const words=text.split(' ');
  return words.map((word,w)=><span className="split-word" key={w}>{unit==='char'?[...word].map((ch,i)=><span className="split-unit" key={i}>{ch}</span>):<span className="split-unit">{word}</span>}{w<words.length-1&&unit!=='char'?' ':''}</span>);
}

function Dial(){
  const ticks=Array.from({length:60},(_,i)=>i);
  const marks=Array.from({length:12},(_,i)=>i);
  return <svg className="cover-dial" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
    <g className="dial-outer">
      <circle cx="300" cy="300" r="286" className="d-line"/>
      <circle cx="300" cy="300" r="270" className="d-dash"/>
      {ticks.map(i=><line key={i} x1="300" y1={i%5===0?20:26} x2="300" y2="34" className={i%5===0?'d-tick major':'d-tick'} transform={`rotate(${i*6} 300 300)`}/>)}
    </g>
    <g className="dial-mid">
      <circle cx="300" cy="300" r="210" className="d-dash fine"/>
      <circle cx="300" cy="300" r="196" className="d-line"/>
      {marks.map(i=><g key={i} transform={`rotate(${i*30} 300 300)`}><path d="M300 92 l7 14 l-7 14 l-7 -14 z" className="d-petal"/></g>)}
    </g>
    <g className="dial-inner">
      <circle cx="300" cy="300" r="140" className="d-line"/>
      {Array.from({length:24},(_,i)=><path key={i} d="M300 168 Q312 210 300 236 Q288 210 300 168 Z" className="d-lotus" transform={`rotate(${i*15} 300 300)`}/>)}
      <circle cx="300" cy="300" r="6" className="d-dot"/>
    </g>
  </svg>;
}

export default function Entrance({onEnter}){
  const root=useRef(null);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power3.out'}});
      tl.from('.cover-dial',{opacity:0,scale:.94,duration:2.4,ease:'power2.out'},0)
        .from('.cover-eyebrow .split-unit',{opacity:0,y:14,duration:.7,stagger:.07},.2)
        .from('.cover-rule',{scaleX:0,duration:1.1,ease:'power2.inOut'},.4)
        .from('.cover-title .split-unit',{opacity:0,yPercent:80,rotateX:-70,filter:'blur(6px)',duration:1.1,stagger:.07,transformOrigin:'50% 100%'},.5)
        .from('.cover-deva .split-unit',{opacity:0,y:16,duration:.9,stagger:.18},1.5)
        .from('.cover-tagline .split-unit',{opacity:0,y:10,duration:.6,stagger:.035},1.8)
        .from('.cover-cta',{opacity:0,y:14,duration:.9},2.5)
        .from('.cover-foot span',{opacity:0,duration:1,stagger:.2},2.7);
    },root);
    return()=>ctx.revert();
  },[]);
  return <main className="cover" ref={root}>
    <Dial/>
    <section className="cover-content">
      <p className="cover-eyebrow" aria-label="Indian Heritage • Interactive History"><span aria-hidden="true"><Split text="INDIAN HERITAGE • INTERACTIVE HISTORY" unit="word"/></span></p>
      <div className="cover-rule" aria-hidden="true"/>
      <h1 className="cover-title" aria-label="Kaal Darpan"><span aria-hidden="true"><Split text="KAAL DARPAN"/></span></h1>
      <p className="cover-deva" lang="hi" aria-label="काल दर्पण"><span aria-hidden="true"><Split text="काल दर्पण" unit="word"/></span></p>
      <p className="cover-tagline" aria-label="Explore India's monuments through immersive 3D reconstruction, architecture, and historical context."><span aria-hidden="true"><Split text="Explore India's monuments through immersive 3D reconstruction, architecture, and historical context." unit="word"/></span></p>
      <button className="cover-cta" onClick={onEnter}>BEGIN EXPLORATION <span aria-hidden="true">→</span></button>
      <div className="entrance-note">A museum of stories. Three places to begin.</div>
    </section>
    <div className="cover-foot"><span>KAAL DARPAN / 001</span><span>INDIAN KNOWLEDGE SYSTEMS</span></div>
  </main>;
}

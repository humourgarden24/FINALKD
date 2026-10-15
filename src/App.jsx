import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
const ThreeScene=lazy(()=>import('./Scene'));
function Scene(props){return <Suspense fallback={<div className='scene scene-loading' role='status'>Opening the 3D experience…</div>}><ThreeScene {...props}/></Suspense>;}
import Chatbot from './Chatbot.jsx';
import {monuments} from './data';
import './App.css';

const storageKey='kaal-darpan-progress-v2';
function loadProgress(){
  try{const data=JSON.parse(localStorage.getItem(storageKey));if(!data||typeof data!=='object')return {};return Object.fromEntries(monuments.map(m=>{const entry=data[m.id];return [m.id,{visited:entry?.visited===true,hotspots:Array.isArray(entry?.hotspots)?entry.hotspots.filter(id=>m.hotspots.some(h=>h.id===id)):[],score:Number.isInteger(entry?.score)?Math.max(0,Math.min(m.quiz.length,entry.score)):null}];}));}catch{return {};}
}
function Entrance({onEnter}){
  const titleRef=useRef(null),subtitleRef=useRef(null),buttonRef=useRef(null);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const ctx=gsap.context(()=>{gsap.timeline().fromTo(titleRef.current,{opacity:0,y:40},{opacity:1,y:0,duration:1.2,ease:'power3.out'}).fromTo(subtitleRef.current,{opacity:0,y:20},{opacity:1,y:0,duration:.8},'-=.6').fromTo(buttonRef.current,{opacity:0,scale:.9},{opacity:1,scale:1,duration:.6,ease:'back.out(1.7)'},'-=.3');});return()=>ctx.revert();
  },[]);
  return <main className="hero"><div className="background-grid"/><section className="hero-content"><div className="eyebrow">INDIAN HERITAGE • INTERACTIVE HISTORY</div><h1 ref={titleRef}>HISTORY<br/><span>COMES ALIVE.</span></h1><p ref={subtitleRef}>Explore India's monuments through immersive 3D reconstruction, architecture, and historical context.</p><button ref={buttonRef} className="explore-button" onClick={onEnter}>BEGIN EXPLORATION <span>→</span></button><div className="entrance-note">A museum of stories. Three places to begin.</div></section><div className="hero-footer"><span>KAAL DARPAN / 001</span><span>INDIAN KNOWLEDGE SYSTEMS</span></div></main>;
}
function Quiz({monument,onComplete}){
  const [answers,setAnswers]=useState({}),[submitted,setSubmitted]=useState(false);
  const score=monument.quiz.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
  return <div className="quiz"><p className="muted">Use what you discovered in the model and history panels.</p>{monument.quiz.map((q,i)=><fieldset key={i}><legend>{i+1}. {q.question}</legend>{q.options.map((option,j)=><label key={j} className={'answer '+(submitted&&j===q.answer?'correct':'')}><input type="radio" name={monument.id+'-'+i} checked={answers[i]===j} disabled={submitted} onChange={()=>setAnswers({...answers,[i]:j})}/>{option}</label>)}{submitted&&<p className="feedback">{answers[i]===q.answer?'✓ Correct.':'Review: '} {q.why}</p>}</fieldset>)}{submitted?<div className="quiz-result" role="status"><strong>{score} / {monument.quiz.length} correct</strong><p>Your best score has been saved.</p><button className="secondary" onClick={()=>{setAnswers({});setSubmitted(false);}}>Try again</button></div>:<button className="explore-button" disabled={Object.keys(answers).length<monument.quiz.length} onClick={()=>{setSubmitted(true);onComplete(score);}}>CHECK ANSWERS →</button>}</div>;
}
export default function App(){
  const [page,setPage]=useState('home'),[selected,setSelected]=useState(null),[transition,setTransition]=useState(null),[modal,setModal]=useState(null),[tab,setTab]=useState('architecture'),[hotspot,setHotspot]=useState(null),[resetCount,setResetCount]=useState(0),[progress,setProgress]=useState(loadProgress),[storageNotice,setStorageNotice]=useState(false);
  const timer=useRef(null),mainRef=useRef(null),dialogRef=useRef(null);
  const monument=monuments.find(m=>m.id===selected);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{queueMicrotask(()=>setStorageNotice(true));}},[progress]);
  useEffect(()=>{mainRef.current?.focus();},[page,selected]);
  useEffect(()=>{
    if(!modal)return;const previouslyFocused=document.activeElement;const dialog=dialogRef.current;dialog?.showModal();
    const close=e=>{e.preventDefault();setModal(null);};dialog?.addEventListener('cancel',close);
    return ()=>{dialog?.removeEventListener('cancel',close);dialog?.close();previouslyFocused?.focus();};
  },[modal]);
  function patch(id,change){setProgress(old=>({...old,[id]:{...old[id],...change(old[id]||{})}}));}
  function enter(id){
    if(transition)return;setTransition(monuments.find(m=>m.id===id).name);
    timer.current=setTimeout(()=>{setSelected(id);setPage('monument');setTab('architecture');setHotspot(null);setResetCount(0);patch(id,()=>({visited:true}));setTransition(null);},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:850);
  }
  function openHotspot(id){setHotspot(id);setTab('architecture');patch(selected,p=>({hotspots:[...new Set([...(p.hotspots||[]),id])]}));}
  const visited=monuments.filter(m=>progress[m.id]?.visited).length;
  return <>
    <header className={'navbar '+(page==='hall'?'gallery-navbar':'')}><button className="logo" onClick={()=>setPage('home')}>KAAL DARPAN</button><nav className="nav-links" aria-label="Main navigation"><button onClick={()=>setPage('hall')}>EXPLORE</button><button onClick={()=>setModal('progress')}>MY JOURNEY <span className="count">{visited}/3</span></button><button onClick={()=>setModal('about')}>ABOUT</button></nav></header>
    {page==='home'?<Entrance onEnter={()=>setPage('hall')}/>:<main className={'museum-main '+(page==='hall'?'gallery-main':'')} ref={mainRef} tabIndex={-1}>
      {page==='hall'?<><div className="page-heading"><div><div className="eyebrow">THE HERITAGE COLLECTION / 01</div><h1>Step into the museum.</h1><p>Explore the gallery. Select a monument miniature. Step into its story.</p></div><div className="collection-count">03<span>MONUMENTS</span></div></div><Scene onSelect={enter}/><div className="exhibit-cards">{monuments.map((m,i)=><button key={m.id} className="exhibit-card" onClick={()=>enter(m.id)}><span className="exhibit-number">0{i+1}</span><div><h2>{m.name}</h2><p>{m.location}</p><span className="era">{m.era} {progress[m.id]?.visited?'· Visited':''}</span></div><span className="card-arrow">↗</span></button>)}</div><p className="model-note">Simplified learning models · Detailed monument assets will be added in a later version.</p></>:<>
        <div className="detail-heading"><button className="secondary" onClick={()=>setPage('hall')}>← MUSEUM</button><div><div className="eyebrow">{monument.location} / {monument.period}</div><h1>{monument.name}</h1></div><button className="secondary" onClick={()=>setResetCount(n=>n+1)}>RESET VIEW</button></div>
        <div className="exploration"><div className="model-wrap"><Scene key={monument.id} mode="monument" monument={monument} onHotspot={openHotspot} activeHotspot={hotspot} resetCount={resetCount}/><div className="model-caption"><span>INTERACTIVE SCALE MODEL</span><span>{progress[selected]?.hotspots?.length||0} / 3 features explored</span></div></div><aside className="learning-panel"><div className="panel-tabs" role="tablist" aria-label="Learning panels">{['architecture','history','challenge'].map(t=><button key={t} id={'tab-'+t} role="tab" aria-selected={tab===t} aria-controls="learning-content" onClick={()=>setTab(t)}>{t}</button>)}</div><div className="panel-body" id="learning-content" role="tabpanel" aria-labelledby={'tab-'+tab}>
          {tab==='architecture'&&<><div className="eyebrow">HOLOGRAPHIC FIELD NOTES</div><h2>{hotspot?monument.hotspots.find(h=>h.id===hotspot).title:'Look closer.'}</h2><p className="field-note">{hotspot?monument.hotspots.find(h=>h.id===hotspot).text:'Select a glowing marker or an architectural part in the scene. Each feature opens a story about the building.'}</p><div className="feature-list">{monument.hotspots.map((h,i)=><button key={h.id} className={hotspot===h.id?'selected':''} onClick={()=>openHotspot(h.id)}><span className="feature-number">{i+1}</span>{h.title}<span className="feature-check">{progress[selected]?.hotspots?.includes(h.id)?'✓':'↗'}</span></button>)}</div><p className="muted small">This simplified model illustrates overall form. It does not reproduce interiors, carvings or exact dimensions.</p></>}
          {tab==='history'&&<><div className="eyebrow">PEOPLE · PLACE · TIME</div><h2>A place in history.</h2><p>{monument.summary}</p><ol className="timeline">{monument.timeline.map(([year,text])=><li key={year}><strong>{year}</strong><p>{text}</p></li>)}</ol></>}
          {tab==='challenge'&&<><div className="eyebrow">YOUR LEARNING CHALLENGE</div><h2>What did you discover?</h2><Quiz key={monument.id} monument={monument} onComplete={score=>patch(selected,p=>({score:Math.max(p.score??0,score)}))}/></>}
          <a className="source-link" href={monument.source} target="_blank" rel="noreferrer">Historical reference: UNESCO ↗</a>
        </div></aside></div></>}
      {storageNotice&&<p className="storage-notice" role="status">This browser is blocking saved progress. Your journey is available for this session.</p>}
    </main>}
    {transition&&<div className="teleport" role="status"><div className="portal-ring"/><div className="eyebrow">TRAVELLING THROUGH TIME</div><h2>{transition}</h2></div>}
    {modal&&<dialog className="modal" ref={dialogRef}><button className="close-button" onClick={()=>setModal(null)} aria-label="Close">×</button>{modal==='progress'?<><div className="eyebrow">YOUR HERITAGE JOURNEY</div><h2>{visited} of 3 monuments visited.</h2><p className="muted">Saved on this browser and device.</p>{monuments.map(m=><div className="journey-row" key={m.id}><div><strong>{m.name}</strong><p>{progress[m.id]?.visited?'Visited':'Not yet visited'} · {progress[m.id]?.hotspots?.length||0}/3 features</p></div><span>{progress[m.id]?.score!=null?progress[m.id].score+'/2 correct':'Quiz pending'}</span></div>)}{storageNotice&&<p>Saving is blocked by your browser settings.</p>}</>:<><div className="eyebrow">ABOUT KAAL DARPAN</div><h2>History you can explore.</h2><p>Enter a museum of Indian heritage, choose a miniature and explore architectural form through 3D models, contextual notes, timelines and learning activities.</p><p>This first development stage uses simplified models. Detailed monument assets, walking through interiors, QR access, accounts and AR are future stages.</p></>}</dialog>}
    <Chatbot/>
  </>;
}

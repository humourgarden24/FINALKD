import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {makeHall,makeMonument,makePedestal,galleryPositions} from './models';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {monuments} from './data';

export default function Scene({mode='hall',monument,onSelect,onHotspot,resetCount=0,activeHotspot}){
  const host=useRef(null),markers=useRef([]),callbacks=useRef({onSelect,onHotspot}),controlsRef=useRef(null);
  const [error,setError]=useState('');
  useEffect(()=>{callbacks.current={onSelect,onHotspot};},[onSelect,onHotspot]);
  useEffect(()=>{controlsRef.current?.reset();},[resetCount]);
  const id=monument?.id;
  useEffect(()=>{
    const container=host.current;let renderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{
      const failedFrame=requestAnimationFrame(()=>setError('3D could not start. Enable hardware acceleration in your browser, or use the monument buttons below to read and learn.'));return()=>cancelAnimationFrame(failedFrame);
    }
    const scene=new THREE.Scene();scene.background=new THREE.Color(mode==='hall'?'#d9e5ed':'#1b2727');
    const camera=new THREE.PerspectiveCamera(48,1,.1,140);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=mode==='hall'?.9:1.25;
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label',mode==='hall'?'Interactive museum. Drag to look around and click a miniature.':'Interactive monument. Drag to rotate, scroll to zoom, or select a numbered hotspot.');
    container.appendChild(canvas);
    const controls=new OrbitControls(camera,canvas);controlsRef.current=controls;controls.enableDamping=true;controls.dampingFactor=.07;controls.maxPolarAngle=Math.PI*.47;
    let selectable=[],environmentTarget;
    if(mode==='hall'){
      scene.add(new THREE.HemisphereLight('#edf3fc','#a7997e',1.35));
      const sun=new THREE.DirectionalLight('#fff7e8',2.8);sun.position.set(18,14,5);sun.target.position.set(-5,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:.1,far:70});sun.shadow.bias=-.00012;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
      const fill=new THREE.DirectionalLight('#f4f5f4',1.15);fill.position.set(-7,6,13);scene.add(fill);
      const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environmentTarget=pmrem.fromScene(room,.04);scene.environment=environmentTarget.texture;scene.environmentIntensity=.3;room.dispose();pmrem.dispose();
      scene.add(makeHall());
      monuments.forEach((m,i)=>{const p=makePedestal(m.id,i);p.position.set(...galleryPositions[i]);scene.add(p);selectable.push(p);});
      controls.target.set(-.5,1.8,-3);controls.minDistance=11;controls.maxDistance=20;controls.enablePan=false;controls.minPolarAngle=Math.PI*.43;controls.maxPolarAngle=Math.PI*.493;controls.minAzimuthAngle=-.37;controls.maxAzimuthAngle=.37;
    }else{
      scene.add(new THREE.HemisphereLight('#fff0db','#30343d',2.2));
      const sun=new THREE.DirectionalLight('#ffe7be',3);sun.position.set(8,16,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20});scene.add(sun);
      const fill=new THREE.DirectionalLight('#84e3ec',1.3);fill.position.set(-10,7,-6);scene.add(fill);
      const floor=new THREE.Mesh(new THREE.CircleGeometry(24,80),new THREE.MeshStandardMaterial({color:'#314239',roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.01;floor.receiveShadow=true;scene.add(floor);
      const model=makeMonument(id);scene.add(model);selectable=[model];controls.target.set(0,2,id==='taj'?2:0);controls.minDistance=7;controls.maxDistance=38;
      const grid=new THREE.GridHelper(42,28,'#51644a','#384c41');grid.position.y=.01;scene.add(grid);
    }
    let firstResize=true;
    const resize=()=>{
      const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
      if(firstResize){if(mode==='hall'){camera.fov=w/h<1?70:58;camera.position.set(w/h<1?0:3.1,w/h<1?5.3:4.1,w/h<1?15.4:15.6);camera.updateProjectionMatrix();}else{camera.position.set(13,9,w/h<1?26:17);}controls.update();controls.saveState();firstResize=false;}
    };
    const observer=new ResizeObserver(resize);observer.observe(container);resize();
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
    function target(event){
      const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
      const hits=raycaster.intersectObjects(selectable,true);
      for(const hit of hits){let obj=hit.object;while(obj){if(mode==='hall'&&obj.userData.monument)return {type:'monument',id:obj.userData.monument};if(mode!=='hall'&&obj.userData.hotspot)return {type:'hotspot',id:obj.userData.hotspot};obj=obj.parent;}}
      return null;
    }
    const pointerdown=e=>{down={x:e.clientX,y:e.clientY};};
    const pointerup=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return;}down=null;const hit=target(e);if(hit?.type==='monument')callbacks.current.onSelect?.(hit.id);if(hit?.type==='hotspot')callbacks.current.onHotspot?.(hit.id);};
    const pointermove=e=>{canvas.style.cursor=target(e)?'pointer':'grab';};
    const keydown=e=>{if(e.key.toLowerCase()==='r')controls.reset();};
    const contextlost=e=>{e.preventDefault();setError('The browser lost the 3D connection. Refresh this page to restore the scene. Your saved progress remains available.');};
    canvas.addEventListener('pointerdown',pointerdown);canvas.addEventListener('pointerup',pointerup);canvas.addEventListener('pointermove',pointermove);canvas.addEventListener('keydown',keydown);canvas.addEventListener('webglcontextlost',contextlost);
    let animation;const v=new THREE.Vector3();let disposed=false;
    function animate(){
      if(disposed)return;animation=requestAnimationFrame(animate);controls.update();
      if(mode!=='hall')monument.hotspots.forEach((hotspot,i)=>{const button=markers.current[i];if(!button)return;v.set(...hotspot.position).project(camera);button.style.left=((v.x+1)/2*container.clientWidth)+'px';button.style.top=((-v.y+1)/2*container.clientHeight)+'px';const visible=v.z>-1&&v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.9;button.style.visibility=visible?'visible':'hidden';});
      renderer.render(scene,camera);
    }animate();
    return ()=>{
      disposed=true;cancelAnimationFrame(animation);observer.disconnect();controls.dispose();controlsRef.current=null;
      canvas.removeEventListener('pointerdown',pointerdown);canvas.removeEventListener('pointerup',pointerup);canvas.removeEventListener('pointermove',pointermove);canvas.removeEventListener('keydown',keydown);canvas.removeEventListener('webglcontextlost',contextlost);
      const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>{materials.add(m);if(m.map)textures.add(m.map);});});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environmentTarget?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    };
  },[mode,id,monument]);
  return <div className={'scene '+mode}>
    <div className="canvas-host" ref={host}/>
    {!error&&<div className="scene-hint">{mode==='hall'?'Drag to look around · Scroll to move closer · Click an exhibit':'Drag to rotate · Scroll / pinch to zoom'}</div>}
    {!error&&mode!=='hall'&&monument.hotspots.map((h,i)=><button key={h.id} ref={el=>markers.current[i]=el} className={'hotspot '+(h.id===activeHotspot?'active':'')} onClick={()=>onHotspot(h.id)} title={h.title} aria-label={h.title}>{i+1}</button>)}
    {error&&<div className="scene-error" role="status">{error}</div>}
  </div>;
}

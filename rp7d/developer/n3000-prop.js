import * as THREE from 'three';
// Native console and matching controller; compact footprint matches the existing upstairs furniture.
export function createN3000Prop() {
  const root = new THREE.Group(); root.name = 'N3000';
  const mat = (color, metalness = .65, emissive = '#000000', intensity = 0) => new THREE.MeshStandardMaterial({ color, metalness, roughness: .35, emissive, emissiveIntensity: intensity, flatShading: true });
  const navy = mat('#101c31'), black = mat('#080d16'), gold = mat('#d4a654'), cyan = mat('#64ddff', .2, '#10bfff', 1.7), purple = mat('#5720ae', .3, '#6f22df', 1.2), chrome = mat('#8092ab');
  function mesh(geo, m, x, y, z, parent = root) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
  const box = (w, h, d, m, x, y, z, parent) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent);
  const bevel = (w,h,d,m,x,y,z,parent=root) => { const s = new THREE.Shape(), cut=.08; s.moveTo(-w/2+cut,-h/2); s.lineTo(w/2-cut,-h/2); s.lineTo(w/2,-h/2+cut); s.lineTo(w/2,h/2-cut); s.lineTo(w/2-cut,h/2); s.lineTo(-w/2+cut,h/2); s.lineTo(-w/2,h/2-cut); s.lineTo(-w/2,-h/2+cut); s.closePath(); const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,steps:1});return mesh(geo,m,x,y,z-d/2,parent); };
  bevel(1.78,.46,.78,navy,0,.43,0); bevel(1.82,.075,.80,gold,0,.23,0); bevel(1.82,.05,.80,gold,0,.66,0);
  for(const x of [-.84,.84]) { box(.065,.43,.79,gold,x,.43,0); for(let i=0;i<4;i++)box(.035,.04,.22,cyan,x*1.065,.32+i*.075,0); }
  box(1.27,.025,.53,black,0,.704,0); for(let i=0;i<4;i++)box(1.12,.03,.045,chrome,0,.722,-.18+i*.115);
  for(const x of [-.7,.7]){bevel(.1,.5,.1,gold,x,.96,-.28);box(.065,.43,.11,navy,x,.96,-.28);for(let i=0;i<3;i++)box(.025,.065,.012,cyan,x,.88+i*.09,-.218);}
  function disc(r,m,x,y,z,parent=root){const o=mesh(new THREE.CylinderGeometry(r,r,.025,32),m,x,y,z,parent);o.rotation.x=Math.PI/2;return o;}
  disc(.255,gold,0,.44,.425);disc(.22,black,0,.44,.445);disc(.195,purple,0,.44,.465);
  for(let n=0;n<3;n++){const points=[];for(let i=0;i<36;i++){const a=i*.16+n*2.094,r=.024+i*.0046;points.push(new THREE.Vector3(Math.cos(a)*r,.44+Math.sin(a)*r,.487));}root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#a769ff'})));}
  const star=new THREE.Shape();for(let i=0;i<8;i++){const a=i*Math.PI/4, r=i%2?.025:.115; const x=Math.cos(a)*r,y=Math.sin(a)*r;i?star.lineTo(x,y):star.moveTo(x,y);}star.closePath();mesh(new THREE.ShapeGeometry(star),cyan,0,.44,.496);
  box(.47,.075,.025,black,-.52,.4,.415);box(.21,.018,.01,cyan,-.52,.4,.435);
  for(const [x,m]of[[.55,cyan],[.73,purple]])bevel(.075,.07,.03,m,x,.36,.427);
  const label=document.createElement('canvas');label.width=256;label.height=80;const c=label.getContext('2d');c.fillStyle='#d8b56d';c.font='bold 48px sans-serif';c.textAlign='center';c.fillText('N3000',128,57);const tx=new THREE.CanvasTexture(label);const lm=new THREE.MeshBasicMaterial({map:tx,transparent:true});mesh(new THREE.PlaneGeometry(.45,.14),lm,.61,.52,.431);
  // Controller rests beside the console, with twin sticks, D-pad and the reference's four face colours.
  const pad=new THREE.Group();root.add(pad);pad.position.set(0,.11,.75);pad.rotation.x=-.5;
  bevel(.65,.26,.14,gold,0,0,0,pad);bevel(.61,.23,.16,navy,0,.01,.01,pad);
  for(const x of [-.22,.22]){const grip=bevel(.17,.24,.15,black,x,-.12,0,pad);grip.rotation.z=Math.sign(x)*.25;}
  for(const x of [-.11,.11]){disc(.067,gold,x,-.035,.11,pad);disc(.05,black,x,-.035,.128,pad);}
  box(.095,.03,.025,black,-.22,.07,.112,pad);box(.03,.09,.025,black,-.22,.07,.113,pad);
  for(const [x,y,col]of[[.21,.13,'#47bbff'],[.26,.07,'#a347e7'],[.21,.01,'#e83739'],[.16,.07,'#54b73f']])disc(.027,mat(col,.4,col,.35),x,y,.116,pad);
  disc(.07,gold,0,.075,.107,pad);disc(.05,purple,0,.075,.125,pad);
  for(const x of [-.58,.58])box(.16,.025,.05,purple,x,.16,0);
  return root;
}

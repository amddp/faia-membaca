import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Latar 3D ringan: langit pastel, pulau, awan dan bintang dekoratif.
const sceneHost = document.querySelector('#scene');
let renderer, scene, camera, animationId;
try {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#f8f0ff');
  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 4.2, 11); camera.lookAt(0, 1, 0);
  renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  sceneHost.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcab9e9, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(5,8,6); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(7,64), new THREE.MeshStandardMaterial({color:'#d9f5e9',roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-1.15; ground.scale.set(1.6,1,1); scene.add(ground);
  const colors=['#ffd6e8','#d9ccff','#bdeeff','#ffe9a8','#c7f2d8'];
  for(let i=0;i<18;i++){
    const geo=new THREE.SphereGeometry(.25+Math.random()*.3,16,12);
    const mat=new THREE.MeshStandardMaterial({color:colors[i%colors.length],roughness:.8});
    const mesh=new THREE.Mesh(geo,mat); mesh.position.set((Math.random()-.5)*18,Math.random()*5-1,(Math.random()-.5)*8-2);
    mesh.scale.y=.6; scene.add(mesh);
  }
  const cloudMat=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1});
  for(let i=0;i<5;i++){
    const cloud=new THREE.Group();
    for(let j=0;j<3;j++){const m=new THREE.Mesh(new THREE.SphereGeometry(.55,18,14),cloudMat);m.position.x=j*.48-.48;m.scale.set(1,.65,.6);cloud.add(m);}
    cloud.position.set((i-2)*4,2.8+(i%2),-3);scene.add(cloud);
  }
  function animate(){animationId=requestAnimationFrame(animate);scene.rotation.y=Math.sin(performance.now()*.00015)*.025;renderer.render(scene,camera);}
  animate();
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
} catch(e) { console.warn('3D dekorasi tidak tersedia di browser ini.',e); }

// -------------------- Data dan progres --------------------
const $=s=>document.querySelector(s);
const screens=['homeScreen','levelsScreen','gameScreen','winScreen'];
function show(id){screens.forEach(x=>$('#'+x).classList.toggle('active',x===id));}
const storeKey='faya-learning-progress-v1';
let progress={math:{},read:{}};
try{progress={...progress,...JSON.parse(localStorage.getItem(storeKey)||'{}')};}catch{}
function save(){localStorage.setItem(storeKey,JSON.stringify(progress));}
const totalStars=()=>Object.values(progress).reduce((sum,mode)=>sum+Object.values(mode).reduce((a,b)=>a+(b?.stars||0),0),0);
function refreshStars(){$('#totalStars').textContent=totalStars();$('#gameStars').textContent=totalStars();}
refreshStars();

let mode='math', level=1, questionIndex=0, correctCount=0, questions=[], answered=false, soundOn=true;
const mathGroups=[
  {name:'Mengenal angka',from:1,to:8},
  {name:'Petualangan penjumlahan',from:9,to:16},
  {name:'Petualangan pengurangan',from:17,to:24},
  {name:'Misi matematika hebat',from:25,to:25}
];
const readGroups=[
  {name:'Kenalan dengan huruf A–Z',from:1,to:26},
  {name:'Huruf awal dan gambar',from:27,to:35},
  {name:'Membaca kata pendek',from:36,to:45},
  {name:'Kata hebat (maksimal 5 huruf)',from:46,to:50}
];
const words=['IBU','AYAH','BUKU','BOLA','MATA','SAPI','KAKI','SUSU','MEJA','TOPI','APEL','IKAN','ROTI','KUDA','PITA','JARI','GIGI','BEBEK','KUE','RUMAH'];
const wordEmoji={IBU:'👩',AYAH:'👨',BUKU:'📘',BOLA:'⚽',MATA:'👀',SAPI:'🐄',KAKI:'🦶',SUSU:'🥛',MEJA:'🪑',TOPI:'👒',APEL:'🍎',IKAN:'🐟',ROTI:'🍞',KUDA:'🐴',PITA:'🎀',JARI:'☝️',GIGI:'🦷',BEBEK:'🦆',KUE:'🧁',RUMAH:'🏠'};
const emojiPool=['🍎','🌼','⭐','🦋','🍓','⚽','🐞','🐠','🍐','🌈'];
function shuffle(a){return [...a].sort(()=>Math.random()-.5);}
function optionsFor(answer,pool){
  const wrong=shuffle(pool.filter(x=>String(x)!==String(answer))).slice(0,2);
  return shuffle([answer,...wrong]);
}
function makeMathQuestions(lv){
  const qs=[];
  for(let i=0;i<5;i++){
    let type, a,b,answer;
    if(lv<=8){type='count';answer=Math.min(10,1+((lv-1)*2+i)%10);}
    else if(lv<=16){type='add';a=1+((lv+i)%5);b=1+((lv*2+i)%Math.max(1,10-a));answer=a+b;}
    else if(lv<=24){type='subtract';a=2+((lv+i)%8);b=1+((lv*2+i)%a);answer=a-b;}
    else {type=['count','add','subtract'][i%3];if(type==='count')answer=1+(lv+i)%10;else if(type==='add'){a=1+(i%4);b=1+(i%Math.max(1,10-a));answer=a+b;}else{a=3+i;b=1+i%a;answer=a-b;}}
    qs.push({type,a,b,answer,choices:optionsFor(answer,[0,1,2,3,4,5,6,7,8,9,10].filter(n=>n!==answer))});
  }
  return qs;
}
function makeReadQuestions(lv){
  const qs=[];
  for(let i=0;i<5;i++){
    if(lv<=26){
      const letter=String.fromCharCode(65+((lv-1+i)%26));
      const choices=optionsFor(letter,'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
      qs.push({type:'letter',answer:letter,choices});
    }else if(lv<=35){
      const letter=String.fromCharCode(65+((lv-27+i*3)%26));
      const map={A:'🍎',B:'⚽',C:'🐱',D:'🐬',E:'🐘',F:'🐟',G:'🦒',H:'🏠',I:'🐟',J:'🧃',K:'🪁',L:'🦁',M:'🌙',N:'☁️',O:'🍊',P:'✏️',Q:'👑',R:'🌹',S:'🐍',T:'🐯',U:'☂️',V:'🎻',W:'🪱',X:'❌',Y:'🪀',Z:'🦓'};
      qs.push({type:'letterImage',answer:letter,emoji:map[letter]||'🌟',choices:optionsFor(letter,'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))});
    }else{
      const word=words[(lv-36+i+(lv>45?10:0))%words.length];
      qs.push({type:'word',answer:word,emoji:wordEmoji[word]||'📖',choices:optionsFor(word,words)});
    }
  }
  return qs;
}
function buildLevels(){
  const groups=mode==='math'?mathGroups:readGroups;
  $('#levelEyebrow').textContent=mode==='math'?'DUNIA ANGKA':'DUNIA HURUF';
  $('#levelTitle').textContent=mode==='math'?'Game Berhitung':'Game Membaca';
  $('#levelDescription').textContent=mode==='math'?'25 level seru untuk belajar angka, tambah, dan kurang.':'50 level seru untuk mengenal huruf dan membaca kata.';
  const root=$('#levelGroups');root.innerHTML='';
  groups.forEach(g=>{
    const section=document.createElement('div');section.className='level-group';
    const title=document.createElement('h3');title.className='group-title';title.textContent=g.name;section.append(title);
    const grid=document.createElement('div');grid.className='level-grid';
    for(let n=g.from;n<=g.to;n++){
      const btn=document.createElement('button');btn.className='level-btn';btn.textContent=n;
      if(progress[mode][n])btn.classList.add('done');
      btn.title=`Level ${n}`;btn.addEventListener('click',()=>startLevel(n));grid.append(btn);
    }
    section.append(grid);root.append(section);
  });
}
document.querySelectorAll('[data-menu]').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.menu;buildLevels();show('levelsScreen');}));
$('#backHome').addEventListener('click',()=>show('homeScreen'));
$('#backLevels').addEventListener('click',()=>{buildLevels();show('levelsScreen');});
$('#homeBtn').addEventListener('click',()=>show('homeScreen'));
$('#soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('#soundBtn').textContent=soundOn?'🔊':'🔇';if(!soundOn)speechSynthesis.cancel();});

function speak(text){
  if(!soundOn||!('speechSynthesis'in window))return;
  speechSynthesis.cancel();
  const utter=new SpeechSynthesisUtterance(text);utter.lang='id-ID';utter.rate=.82;utter.pitch=1.12;
  const voices=speechSynthesis.getVoices();const v=voices.find(x=>x.lang.toLowerCase().startsWith('id'));if(v)utter.voice=v;
  speechSynthesis.speak(utter);
}
function startLevel(n){
  level=n;questionIndex=0;correctCount=0;
  questions=mode==='math'?makeMathQuestions(n):makeReadQuestions(n);
  $('#levelPill').textContent=`Level ${n} / ${mode==='math'?25:50}`;
  show('gameScreen');renderQuestion();
}
function renderQuestion(){
  answered=false;const q=questions[questionIndex];
  $('#feedback').textContent='';$('#nextBtn').classList.add('hidden');
  $('#gameBubble').textContent=mode==='math'?'🔢':'📖';
  $('#questionLabel').textContent=`SOAL ${questionIndex+1} DARI ${questions.length}`;
  const visual=$('#visualQuestion');visual.innerHTML='';
  let prompt='';
  if(mode==='math'){
    if(q.type==='count'){
      prompt='FAYA, ada berapa benda?';
      visual.innerHTML=`<div class="object-row">${Array.from({length:q.answer},()=>'<span class="object">'+emojiPool[(level+questionIndex)%emojiPool.length]+'</span>').join('')}</div>`;
    }else if(q.type==='add'){
      prompt='Yuk, hitung semuanya!';
      visual.innerHTML=`<div class="number-display">${q.a} <span style="color:#a99acb">+</span> ${q.b} <span style="color:#a99acb">= ?</span></div><div style="font-size:24px">${emojiPool[(level+questionIndex)%emojiPool.length].repeat(Math.min(q.a,5))} + ${emojiPool[(level+questionIndex+3)%emojiPool.length].repeat(Math.min(q.b,5))}</div>`;
    }else{
      prompt='Berapa benda yang tersisa?';
      visual.innerHTML=`<div class="number-display">${q.a} <span style="color:#a99acb">−</span> ${q.b} <span style="color:#a99acb">= ?</span></div><div style="font-size:27px">${emojiPool[(level+questionIndex)%emojiPool.length].repeat(Math.min(q.a,10))}<div style="font-size:14px;color:#a99acb">Ada ${q.b} yang pergi ✨</div></div>`;
    }
    $('#questionText').textContent=prompt;
  }else if(q.type==='letter'){
    prompt='FAYA, ini huruf apa?';$('#questionText').textContent=prompt;visual.innerHTML=`<div class="word-display">${q.answer}</div>`;
  }else if(q.type==='letterImage'){
    prompt='Huruf awal gambar ini apa?';$('#questionText').textContent=prompt;visual.innerHTML=`<div style="font-size:65px">${q.emoji}</div>`;
  }else{
    prompt='Yuk, baca kata ini!';$('#questionText').textContent=prompt;visual.innerHTML=`<div style="font-size:65px">${q.emoji}</div><div class="word-display">${q.answer}</div>`;
  }
  const opts=$('#answerOptions');opts.innerHTML='';
  q.choices.forEach(choice=>{
    const b=document.createElement('button');b.className='answer-btn';b.textContent=choice;b.addEventListener('click',()=>checkAnswer(choice,b));opts.append(b);
  });
  if(questionIndex===0)speak(prompt);
}
function checkAnswer(choice,button){
  if(answered)return;const q=questions[questionIndex];
  if(String(choice)===String(q.answer)){
    answered=true;correctCount++;button.classList.add('correct');
    $('#feedback').textContent=['Hebat, FAYA! 🌟','Pintar sekali! 💖','Jawaban FAYA benar! 🎉'][questionIndex%3];
    speak(['Hebat, FAYA!','Pintar sekali!','Jawaban FAYA benar!'][questionIndex%3]);
    $('#answerOptions').querySelectorAll('button').forEach(b=>b.disabled=true);
    $('#nextBtn').classList.remove('hidden');
  }else{
    button.classList.add('wrong');$('#feedback').textContent='Hampir benar! Yuk, coba lagi 😊';speak('Yuk, coba lagi, FAYA.');
    setTimeout(()=>button.classList.remove('wrong'),450);
  }
}
$('#nextBtn').addEventListener('click',()=>{
  questionIndex++;
  if(questionIndex>=questions.length){finishLevel();}else renderQuestion();
});
function finishLevel(){
  const stars=correctCount===5?3:correctCount>=3?2:1;
  const old=progress[mode][level]?.stars||0;
  progress[mode][level]={stars:Math.max(stars,old),completed:true};save();refreshStars();
  $('#winText').textContent=`FAYA menyelesaikan ${mode==='math'?'Game Berhitung':'Game Membaca'} Level ${level}!`;
  $('#winStars').textContent='⭐'.repeat(Math.max(stars,old));
  $('#continueBtn').textContent=level===(mode==='math'?25:50)?'Selesai 🎉':'Level berikutnya →';
  show('winScreen');speak('Selamat, FAYA! Kamu berhasil menyelesaikan level. Hebat sekali!');
  burstConfetti();
}
function burstConfetti(){
  const card=$('.win-card');
  for(let i=0;i<22;i++){
    const el=document.createElement('span');el.textContent=['✨','⭐','🎊','💖'][i%4];
    el.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-30px;font-size:${18+Math.random()*18}px;z-index:10;pointer-events:none;animation:fall ${1.5+Math.random()*1.5}s linear forwards`;
    document.body.append(el);setTimeout(()=>el.remove(),3200);
  }
}
const style=document.createElement('style');style.textContent='@keyframes fall{to{transform:translateY(110vh) rotate(540deg);opacity:.2}}';document.head.append(style);
$('#retryBtn').addEventListener('click',()=>startLevel(level));
$('#continueBtn').addEventListener('click',()=>{const max=mode==='math'?25:50;if(level<max)startLevel(level+1);else{buildLevels();show('levelsScreen');}});
$('#winLevelsBtn').addEventListener('click',()=>{buildLevels();show('levelsScreen');});

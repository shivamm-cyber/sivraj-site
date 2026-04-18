// ═══════════════════════════════════════════════════════════
// SIVRAJ.IN — Cockpit Scripts
// ═══════════════════════════════════════════════════════════

// ── Uptime Counter ──
const BOOT=Date.now()-(12*86400+4*3600+22*60+11)*1000;
function tick(){const s=Math.floor((Date.now()-BOOT)/1000);const d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sec=s%60;document.getElementById('uptimeStr').textContent=d+'d '+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m '+String(sec).padStart(2,'0')+'s'}
tick();setInterval(tick,1000);

// ── Particles ──
(function(){
const c=document.getElementById('particles'),ctx=c.getContext('2d');
function resize(){c.width=innerWidth;c.height=innerHeight}
resize();window.addEventListener('resize',resize);
const N=Math.min(50,Math.floor(innerWidth/20));
const pts=Array.from({length:N},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,s:Math.random()*1+.3,a:Math.random()*.15+.03}));
(function loop(){
ctx.clearRect(0,0,c.width,c.height);
pts.forEach((p,i)=>{
p.x+=p.vx;p.y+=p.vy;
if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;
if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;
ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);
ctx.fillStyle='rgba(124,58,237,'+p.a+')';ctx.fill();
for(let j=i+1;j<pts.length;j++){
const q=pts[j],dx=p.x-q.x,dy=p.y-q.y,dist=Math.sqrt(dx*dx+dy*dy);
if(dist<100){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
ctx.strokeStyle='rgba(124,58,237,'+(0.03*(1-dist/100))+')';ctx.lineWidth=.5;ctx.stroke()}}
});requestAnimationFrame(loop)})();
})();

// ── Orb Spring Physics ──
(function(){
const orb=document.getElementById('orb');
let tx=0,ty=0,cx=0,cy=0,vx=0,vy=0;
window.addEventListener('mousemove',function(e){
const r=orb.getBoundingClientRect();
tx=(e.clientX-(r.left+r.width/2))*.04;
ty=(e.clientY-(r.top+r.height/2))*.04;
});
(function loop(){
const k=0.06,d=0.85;
vx+=(tx-cx)*k;vy+=(ty-cy)*k;
vx*=d;vy*=d;cx+=vx;cy+=vy;
orb.style.transform='translate('+cx.toFixed(2)+'px,'+cy.toFixed(2)+'px)';
requestAnimationFrame(loop)})();
})();

// ── Command Demo ──
(function(){
const log=document.getElementById('cmdLog'),inp=document.getElementById('cmdInput');
let paused=false;
const phs=['try: open chrome and spotify...','try: what\'s on my screen?','try: set volume to 40%','try: room temp?','try: remind me in 10 minutes'];
let pi=0;
setInterval(function(){if(!inp.value){pi=(pi+1)%phs.length;inp.placeholder=phs[pi]}},3000);

function ts(){return new Date().toLocaleTimeString('en',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'})}

function addRow(type,text,lat){
const old=log.querySelectorAll('.log-row:not(.old)');
if(old.length>14)old[0].classList.add('old');
const r=document.createElement('div');r.className='log-row';
const tc={CMD:'lt-cmd',ACTION:'lt-action',VISION:'lt-vision',LLM:'lt-llm',RESP:'lt-resp',ESP32:'lt-esp'};
r.innerHTML='<span class="log-ts">['+ts()+']</span><span class="log-type '+(tc[type]||'lt-resp')+'">'+type+'</span><span class="log-text">'+text+'</span>'+(lat?'<span class="log-lat">'+lat+'</span>':'');
log.appendChild(r);log.scrollTop=log.scrollHeight;
}

function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}

function typeIt(text){
return new Promise(function(resolve){
inp.value='';let i=0;
function next(){
if(paused){resolve(false);return}
if(i<text.length){inp.value+=text[i];i++;setTimeout(next,38+Math.random()*28)}
else resolve(true);
}next();
});
}

const demos=[
function(){return typeIt('open chrome and spotify').then(function(ok){if(!ok)return;return sleep(350).then(function(){addRow('CMD','open chrome and spotify');inp.value='';return sleep(250)}).then(function(){addRow('ACTION','[open:chrome] ✓','12ms');return sleep(180)}).then(function(){addRow('ACTION','[open:spotify] ✓','18ms');return sleep(380)}).then(function(){addRow('RESP','Launched. Enjoy your session.')})})},
function(){return typeIt("what's on my screen?").then(function(ok){if(!ok)return;return sleep(350).then(function(){addRow('CMD',"what's on my screen?");inp.value='';return sleep(280)}).then(function(){addRow('VISION','[capture:screen] ✓','22ms');return sleep(500)}).then(function(){addRow('LLM','[gpt-4o-vision] analyzing...');return sleep(700)}).then(function(){addRow('RESP','I see VS Code open with a Python file — looks like a Flask app.')})})},
function(){return typeIt('set volume to 40%').then(function(ok){if(!ok)return;return sleep(350).then(function(){addRow('CMD','set volume to 40%');inp.value='';return sleep(200)}).then(function(){addRow('ACTION','[volume:40] ✓','8ms');return sleep(280)}).then(function(){addRow('RESP','Done.')})})},
function(){return typeIt('room temp?').then(function(ok){if(!ok)return;return sleep(350).then(function(){addRow('CMD','room temp?');inp.value='';return sleep(250)}).then(function(){addRow('ESP32','[DHT22:read] ✓','5ms');return sleep(350)}).then(function(){addRow('RESP','28.4°C, humidity 62%. Fan is off.')})})},
function(){return typeIt('remind me in 10 minutes').then(function(ok){if(!ok)return;return sleep(350).then(function(){addRow('CMD','remind me in 10 minutes');inp.value='';return sleep(200)}).then(function(){addRow('ACTION','[timer:600s] set ✓','9ms');return sleep(280)}).then(function(){addRow('RESP','Timer set. I will remind you in 10 minutes.')})})}
];

var di=0;
function runLoop(){
if(paused){setTimeout(runLoop,200);return}
demos[di%demos.length]().then(function(){di++;return sleep(2800)}).then(runLoop);
}
runLoop();

inp.addEventListener('keydown',function(e){
if(e.key==='Enter'&&inp.value.trim()){
paused=true;var cmd=inp.value.trim();addRow('CMD',cmd);inp.value='';
sleep(280).then(function(){
var rs=['Processing...','Executing now.','Done.','On it.','Command received.'];
addRow('RESP',rs[Math.floor(Math.random()*rs.length)]);
setTimeout(function(){paused=false},4000);
});
}
if(e.key==='Escape'){inp.value='';paused=false}
});
inp.addEventListener('input',function(){if(inp.value)paused=true});
})();

// ── Command Palette (⌘K) ──
(function(){
var ov=document.getElementById('cmdOverlay'),pi=document.getElementById('cmdPaletteInput'),pl=document.getElementById('cmdPaletteLog');
function open(){ov.classList.add('open');setTimeout(function(){pi.focus()},50)}
function close(){ov.classList.remove('open');pi.value='';pl.innerHTML=''}
document.getElementById('navCmdBtn').addEventListener('click',open);
ov.addEventListener('click',function(e){if(e.target===ov)close()});
window.addEventListener('keydown',function(e){
if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();open()}
if(e.key==='Escape'&&ov.classList.contains('open'))close();
});
pi.addEventListener('keydown',function(e){
if(e.key==='Enter'&&pi.value.trim()){
var cmd=pi.value.trim();pi.value='';
var t=new Date().toLocaleTimeString('en',{hour12:false});
var r1=document.createElement('div');r1.className='log-row';
r1.innerHTML='<span class="log-ts">['+t+']</span><span class="log-type lt-cmd">CMD</span><span class="log-text">'+cmd+'</span>';
pl.appendChild(r1);
setTimeout(function(){
var r2=document.createElement('div');r2.className='log-row';
r2.innerHTML='<span class="log-ts">['+t+']</span><span class="log-type lt-resp">RESP</span><span class="log-text">Command received: '+cmd+'</span>';
pl.appendChild(r2);pl.scrollTop=pl.scrollHeight;
},500);
}});
})();

// ── Scroll Reveal ──
var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('vis')})},{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(function(el){ro.observe(el)});

// ── Latency Bars ──
(function(){
var data=[{n:'Groq/Llama',ms:120,p:22,fast:true},{n:'Gemini Flash',ms:210,p:38},{n:'DeepSeek',ms:280,p:52},{n:'GPT-4o',ms:380,p:70},{n:'Claude 3.5',ms:420,p:78}];
var w=document.getElementById('latencyBars');
data.forEach(function(d){
var col=d.fast?'var(--green)':d.p>65?'var(--amber)':'var(--purple2)';
w.innerHTML+='<div class="lat-row"><span class="lat-name">'+d.n+'</span><div class="lat-bar-wrap"><div class="lat-bar" data-w="'+d.p+'" style="background:'+col+'"></div></div><span class="lat-ms">'+d.ms+'ms</span>'+(d.fast?'<span class="lat-badge">fastest</span>':'')+'</div>';
});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){document.querySelectorAll('.lat-bar').forEach(function(b){b.style.width=b.dataset.w+'%'});io.disconnect()}})},{threshold:0.3});
io.observe(w);
})();

// ── Freq Bars ──
(function(){
var data=[{n:'open app',c:847},{n:'set volume',c:623},{n:'screen?',c:412},{n:'search web',c:389},{n:'remind me',c:201},{n:'lock PC',c:178},{n:'room temp',c:156},{n:'write file',c:134},{n:'play music',c:119},{n:'brightness',c:98}];
var w=document.getElementById('freqBars');
data.forEach(function(d,i){
w.innerHTML+='<div class="freq-row"><span class="freq-rank">'+(i+1)+'</span><span class="freq-name">'+d.n+'</span><div class="freq-bar-wrap"><div class="freq-bar" data-w="'+Math.round(d.c/847*100)+'"></div></div><span class="freq-count">'+d.c+'x</span></div>';
});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){document.querySelectorAll('.freq-bar').forEach(function(b){b.style.width=b.dataset.w+'%'});io.disconnect()}})},{threshold:0.3});
io.observe(w);
})();

// ── Metric Counters ──
(function(){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
document.querySelectorAll('.metric-val[data-target]').forEach(function(el){
var tgt=parseFloat(el.dataset.target),suf=el.dataset.suffix,dec=String(tgt).includes('.');
var dur=1200,t0=performance.now();
(function f(now){var p=Math.min((now-t0)/dur,1),ease=1-Math.pow(1-p,3);
el.textContent=(dec?(tgt*ease).toFixed(1):Math.round(tgt*ease))+suf;
if(p<1)requestAnimationFrame(f)})(t0);
});io.disconnect()}})},{threshold:0.5});
var m=document.querySelector('.metric-row');if(m)io.observe(m);
})();

// ── Sparklines ──
(function(){
function spark(id,vals){var w=document.getElementById(id);if(!w)return;var mx=Math.max.apply(null,vals),mn=Math.min.apply(null,vals);
w.innerHTML=vals.map(function(v){return'<div class="spark-bar" style="height:'+Math.round(4+((v-mn)/(mx-mn||1))*14)+'px"></div>'}).join('')}
spark('sparkTemp',[28.1,28.3,28.4,28.2,28.5,28.6,28.4,28.3,28.7,28.4,28.5,28.6]);
spark('sparkHum',[61,62,61,63,62,64,62,61,62,63,62,62]);
var t=28.4,h=62,snd=42;
setInterval(function(){
t=+(t+(Math.random()-.5)*.3).toFixed(1);
h=Math.max(40,Math.min(90,h+Math.round((Math.random()-.5)*2)));
snd=Math.max(30,Math.min(70,snd+Math.round((Math.random()-.5)*4)));
document.getElementById('sTemp').textContent=t+'°C';
document.getElementById('sHum').textContent=h+'%';
document.getElementById('sSound').textContent=snd+' dB';
document.getElementById('sMotion').textContent=Math.random()>.88?'Motion detected':'No activity';
},5000);
})();

// ── Temp Chart ──
(function(){
var c=document.getElementById('tempChart'),ctx=c.getContext('2d');
function setSize(){c.width=c.parentElement.offsetWidth-48;c.height=120}
setSize();window.addEventListener('resize',function(){setSize();draw()});
var labels=[],data=[];
for(var i=0;i<24;i++){labels.push(String(i).padStart(2,'0')+':00');var b=i<6?24.5:i<12?26:i<18?29:27;data.push(+(b+(Math.random()-.5)*1.2).toFixed(1))}
function draw(){
var w=c.width,h=c.height,pd={t:10,b:24,l:36,r:10};
ctx.clearRect(0,0,w,h);
var mn=Math.min.apply(null,data)-1,mx=Math.max.apply(null,data)+1;
function sx(i){return pd.l+(i/(data.length-1))*(w-pd.l-pd.r)}
function sy(v){return h-pd.b-((v-mn)/(mx-mn))*(h-pd.t-pd.b)}
ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;
[25,27,29].forEach(function(v){ctx.beginPath();ctx.moveTo(pd.l,sy(v));ctx.lineTo(w-pd.r,sy(v));ctx.stroke();ctx.fillStyle='rgba(255,255,255,0.22)';ctx.font='9px JetBrains Mono,monospace';ctx.fillText(v+'°',2,sy(v)+4)});
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='9px JetBrains Mono,monospace';
[0,6,12,18,23].forEach(function(i){ctx.fillText(labels[i],sx(i)-12,h-4)});
var g=ctx.createLinearGradient(0,pd.t,0,h-pd.b);g.addColorStop(0,'rgba(124,58,237,0.14)');g.addColorStop(1,'rgba(124,58,237,0)');
ctx.beginPath();ctx.moveTo(sx(0),sy(data[0]));
for(var i=1;i<data.length;i++){var x0=sx(i-1),y0=sy(data[i-1]),x1=sx(i),y1=sy(data[i]),cpx=(x0+x1)/2;ctx.bezierCurveTo(cpx,y0,cpx,y1,x1,y1)}
ctx.lineTo(sx(data.length-1),h-pd.b);ctx.lineTo(sx(0),h-pd.b);ctx.closePath();ctx.fillStyle=g;ctx.fill();
ctx.beginPath();ctx.strokeStyle='rgba(124,58,237,0.65)';ctx.lineWidth=2;ctx.lineJoin='round';ctx.moveTo(sx(0),sy(data[0]));
for(var i=1;i<data.length;i++){var x0=sx(i-1),y0=sy(data[i-1]),x1=sx(i),y1=sy(data[i]),cpx=(x0+x1)/2;ctx.bezierCurveTo(cpx,y0,cpx,y1,x1,y1)}
ctx.stroke();
}draw();
})();

// ── Pipeline Dots ──
(function(){
var canvas=document.getElementById('dotsCanvas'),wrap=document.getElementById('pipelineWrap');
if(!canvas||!wrap)return;
var ctx=canvas.getContext('2d'),nodes=[];
function resize(){canvas.width=wrap.offsetWidth;canvas.height=wrap.offsetHeight;
var boxes=wrap.querySelectorAll('.pipe-node-box'),wr=wrap.getBoundingClientRect();
nodes=Array.from(boxes).map(function(b){var r=b.getBoundingClientRect();return{x:r.left-wr.left+r.width/2,y:r.top-wr.top+r.height/2}})}
resize();window.addEventListener('resize',resize);setTimeout(resize,400);
var dots=[];for(var i=0;i<4;i++)for(var j=0;j<3;j++)dots.push({seg:i,t:Math.random(),speed:0.003+Math.random()*.004});
(function loop(){ctx.clearRect(0,0,canvas.width,canvas.height);
dots.forEach(function(d){if(nodes.length<2)return;d.t+=d.speed;if(d.t>1)d.t=0;
var a=nodes[d.seg],b=nodes[d.seg+1];if(!a||!b)return;
var x=a.x+(b.x-a.x)*d.t,y=a.y+(b.y-a.y)*d.t;
var al=d.t<0.1?d.t*10:d.t>0.9?(1-d.t)*10:1;
ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fillStyle='rgba(139,92,246,'+al*.8+')';ctx.fill()});
requestAnimationFrame(loop)})();
wrap.querySelectorAll('.pipe-node').forEach(function(node){
var tip=node.querySelector('.pipe-tooltip');if(!tip)return;
tip.innerHTML='<div class="pipe-tooltip-title">'+node.dataset.tip+'</div><div class="pipe-tooltip-lat">'+node.dataset.lat+'</div><div class="pipe-tooltip-tech">'+node.dataset.tech+'</div>';
node.addEventListener('mouseenter',function(){tip.classList.add('show')});
node.addEventListener('mouseleave',function(){tip.classList.remove('show')});
});
})();

// ── System Log ──
(function(){
var body=document.getElementById('syslogBody');
var entries=[
{tag:'VOICE ',cls:'tag-voice',msgs:['wake word detected — confidence 0.97','listening...','audio captured — 1.2s']},
{tag:'STT   ',cls:'tag-stt',msgs:['transcribing...','transcription complete','sending to LLM']},
{tag:'LLM   ',cls:'tag-llm',msgs:['intent: open_app | entity: spotify | provider: groq','context window: 4,821 tokens','streaming response...']},
{tag:'ACTION',cls:'tag-action',msgs:['executing: open_app(spotify)','executing: volume_set(40)','executing: search_web(weather)']},
{tag:'SYSTEM',cls:'tag-system',msgs:['✓ spotify launched (18ms)','✓ volume set to 40% (8ms)','✓ command complete']},
{tag:'ESP32 ',cls:'tag-esp32',msgs:['temp: 28.4°C | humidity: 62% | motion: none','sensor poll complete','relay state: lights ON, fan OFF']},
{tag:'MEMORY',cls:'tag-memory',msgs:['context window: 4,821 tokens','storing conversation turn','cache hit: previous context']},
{tag:'VISION',cls:'tag-vision',msgs:['screen captured → sending to gpt-4o-vision','vision analysis complete','detected: VS Code + terminal']}
];
function add(){
var e=entries[Math.floor(Math.random()*entries.length)];
var msg=e.msgs[Math.floor(Math.random()*e.msgs.length)];
var t=new Date().toLocaleTimeString('en',{hour12:false});
if(body.children.length>=20){var old=body.firstChild;if(old){old.classList.add('faded');setTimeout(function(){if(old.parentNode)old.remove()},1500)}}
var row=document.createElement('div');row.className='syslog-entry';
row.innerHTML='<span class="slog-ts">['+t+']</span><span class="slog-tag '+e.cls+'">'+e.tag+'</span><span class="slog-msg">'+msg+'</span>';
body.appendChild(row);body.scrollTop=body.scrollHeight;
}
for(var i=0;i<8;i++)add();
function schedNext(){setTimeout(function(){add();schedNext()},1800+Math.random()*2200)}
schedNext();
})();

// ── Nav Scroll ──
window.addEventListener('scroll',function(){
document.getElementById('mainNav').style.borderBottomColor=scrollY>40?'rgba(255,255,255,0.09)':'rgba(255,255,255,0.04)';
},{passive:true});

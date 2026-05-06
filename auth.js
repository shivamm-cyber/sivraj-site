// ═══════════════════════════════════════════════════════════════
// SIVRAJ CIC — Access Control Module
// ═══════════════════════════════════════════════════════════════

const _0x={
  _h:'34d36176b537eb1cb1c4cfe505df37bf4c60c77263e28579bff6b55c39f3fb60',
  _e:['14d66774c34e9f8e797a302e5058230e7e235b37c9bb6015a7956c55ba8fa417','400d0b327b5b4ba9f238dc7187735c2e745bdc9c7754df268dc54bc9e690df11'],
  _d:604800000,
  _k:'sivraj_auth_session',
};

async function _hash(s){
  const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function getSession(){
  try{
    const r=localStorage.getItem(_0x._k);
    if(!r)return null;
    const s=JSON.parse(r);
    if(Date.now()>s.x){localStorage.removeItem(_0x._k);return null;}
    return s;
  }catch{return null;}
}

function createSession(e){
  const s={e,c:Date.now(),x:Date.now()+_0x._d,t:crypto.randomUUID()};
  localStorage.setItem(_0x._k,JSON.stringify(s));
  return s;
}

function destroySession(){localStorage.removeItem(_0x._k);}
function isAuthenticated(){return getSession()!==null;}

async function attemptLogin(email,pass){
  const eh=await _hash(email.toLowerCase().trim());
  if(!_0x._e.includes(eh))return{success:false,error:'Access denied'};
  const ph=await _hash(pass);
  if(ph!==_0x._h)return{success:false,error:'Access denied'};
  return{success:true,session:createSession(email.toLowerCase().trim())};
}

function requireAuth(){
  if(!isAuthenticated()){window.location.href='/login';document.documentElement.style.display='none';return false;}
  return true;
}

function logout(){destroySession();window.location.href='/login';}

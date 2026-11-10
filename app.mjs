import {initialState,interpret} from './engine.mjs';
const $=s=>document.querySelector(s), iframe=$('#site-preview'), conversation=$('#conversation');
let state={...initialState}, history=[], revisions=0, ready=false;
function message(text,role='assistant'){
 const item=document.createElement('div'); item.className=`${role}-message`;
 if(role==='assistant'){const icon=document.createElement('span');icon.className='assistant-symbol';icon.textContent='✳';item.append(icon);const p=document.createElement('p');p.textContent=text;item.append(p);}else{item.textContent=text;}
 conversation.append(item);while(conversation.children.length>40)conversation.firstElementChild.remove();conversation.scrollTop=conversation.scrollHeight;
}
function render(changes={},scroll=false){
 if(!ready)return;const doc=iframe.contentDocument;
 doc.documentElement.dataset.theme=state.theme;
 const heading=doc.querySelector('#hero-title');heading.textContent=state.headline;
 const grid=doc.querySelector('#service-grid');const first=grid.querySelector(`[data-category="${state.first}"]`);const order=['wedding','coming','children'];[state.first,...order.filter(x=>x!==state.first)].forEach(category=>grid.append(grid.querySelector(`[data-category="${category}"]`)));
 const target=changes.first?first:changes.headline?heading:doc.querySelector('.hero');
 if(scroll){target.classList.remove('change-flash');void target.offsetWidth;target.classList.add('change-flash');iframe.contentWindow.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+iframe.contentWindow.scrollY-35),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 $('#undo').disabled=!history.length;$('#reset').disabled=JSON.stringify(state)===JSON.stringify(initialState);$('#revision').textContent=revisions?`EDIT ${String(revisions).padStart(2,'0')}`:'ORIGINAL';
 $('#preview-status').textContent=revisions?'変更を反映しました · この見本だけに適用されます':'変更は、この画面の見本だけに反映されます';
}
function submit(text){
 if(!ready){message('ページを読み込んでいます。少し待ってから、もう一度お試しください。');return;}
 const command=interpret(text);if(command.kind==='empty')return;message(text,'user');
 if(command.kind==='unsupported'){message(command.message);return;}
 if(command.kind==='undo'){undo();return;}
 if(command.kind==='reset'){reset();return;}
 if(JSON.stringify({...state,...command.changes})===JSON.stringify(state)){message('すでにその設定になっています。別の見出しや配色も試してみてください。');return;}
 history.push({...state});if(history.length>20)history.shift();state={...state,...command.changes};revisions++;render(command.changes,true);message(command.message);
}
function undo(){if(!history.length){message('まだ戻せる変更がありません。');return;}state=history.pop();revisions++;render({},false);message('ひとつ前の状態に戻しました。');}
function reset(){if(JSON.stringify(state)===JSON.stringify(initialState)){message('すでに最初の状態です。');return;}history.push({...state});if(history.length>20)history.shift();state={...initialState};revisions++;render({},false);iframe.contentWindow.scrollTo({top:0,behavior:'smooth'});message('配色・見出し・掲載順を最初の状態に戻しました。');}
function initialize(){ready=true;render();iframe.contentWindow.scrollTo({top:0,behavior:'instant'});}
iframe.addEventListener('load',initialize);
if(iframe.contentDocument?.readyState==='complete'&&iframe.contentDocument.querySelector('#hero-title'))initialize();
$('#chat-form').addEventListener('submit',event=>{event.preventDefault();const value=$('#prompt').value;submit(value);$('#prompt').value='';});
$('#prompt').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229){event.preventDefault();$('#chat-form').requestSubmit();}});
document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>submit(button.dataset.prompt)));
$('#undo').addEventListener('click',undo);$('#reset').addEventListener('click',reset);
document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-device]').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});$('.preview-stage').classList.toggle('mobile',button.dataset.device==='mobile');}));
$('#expand').addEventListener('click',()=>{const expanded=$('.workspace').classList.toggle('focus');$('#expand').textContent=expanded?'編集画面に戻る ↙':'サイトを広く見る ↗';$('#expand').setAttribute('aria-pressed',String(expanded));});
const hint=$('.mobile-hint');new IntersectionObserver(entries=>{for(const entry of entries)hint.classList.toggle('hidden',entry.isIntersecting);},{threshold:.05}).observe($('.editor-panel'));

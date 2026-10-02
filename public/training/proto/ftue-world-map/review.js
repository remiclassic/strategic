const file=location.pathname.split('/').pop();
document.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')?.startsWith('/')){if(a.textContent.trim()==='MAP')a.href='04-map.html';else {a.href='#';a.onclick=e=>{e.preventDefault();note('This navigation is outside the FTUE scene preview.');}}}});
function note(message){let n=document.querySelector('#review-status');if(!n){n=document.createElement('div');n.id='review-status';n.setAttribute('role','status');n.style.cssText='position:fixed;left:24px;bottom:20px;z-index:9999;background:#07141e;border:1px solid #9ae8d9;color:#dcebea;padding:18px;max-width:550px;font:16px Rajdhani,sans-serif';document.body.append(n)}n.textContent=message;}
document.querySelectorAll('button').forEach(b=>{b.onclick=()=>{const t=b.textContent.trim(),label=b.getAttribute('aria-label')||'';
if(t.includes('Browse certification'))location.href='02-programs.html';
else if(t.includes('Browse learning'))location.href='02-paths.html';
else if(t==='Back'||label==='Close selection console'||t==='SOC Control')location.href='01-choose.html';
else if(/^(Start this|Activate )/.test(t)||label.startsWith('Activate ')){
 const context=b.closest('article')?.textContent||b.closest('aside')?.textContent||b.closest('[class*=card]')?.textContent||label;
 if(/Cybersecurity Basics/.test(context)||(/Start this program/.test(t)&&/Cyber Defense Analyst/.test(context)))location.href='03-briefing.html';
 else note('This preview follows Cybersecurity Basics. Choose its Start control to see the matching briefing.');
}
else if(/Back to map|^Close$/.test(t)||label==='Close')location.href='04-map.html';
else if(/Begin activity|BEGIN ACTIVITY/.test(t))note('Design preview complete. The real app opens the prepared activity here; no live attempt is created in this preview.');
else if(t==='View briefing')location.href='03-briefing.html';
else if(/details/i.test(label)||t==='Details')document.querySelector('#experimental-path-details')?.scrollIntoView({block:'nearest'});
else note('Scene review: this control is shown as it appears on ux/world-map. Use the live branch preview to exercise the full interaction.');
};});
document.querySelectorAll('[inert]').forEach(n=>n.removeAttribute('inert'));
document.querySelectorAll('[data-review-scroll]').forEach(n=>n.scrollTop=Number(n.dataset.reviewScroll));

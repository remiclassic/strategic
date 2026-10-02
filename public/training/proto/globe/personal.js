function notice(message){let n=document.getElementById('preview-status');if(!n){n=document.createElement('div');n.id='preview-status';n.setAttribute('role','status');document.body.append(n)}n.textContent=message}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.href=b.dataset.go);
document.querySelectorAll('[data-begin]').forEach(b=>b.onclick=()=>notice('Preview complete. The real app opens the prepared activity here. No live attempt is created.'));
document.querySelectorAll('[data-preview-only]:not([data-go]):not([data-begin]),a[href="#"]').forEach(b=>b.onclick=e=>{e.preventDefault();notice('This control belongs to the full app. This preview focuses on choosing training and beginning your first activity.');});

const operatorHelp = {
  level: {
    title: 'How my level works',
    body: `<p>My operator badge represents my overall training progression. My level is calculated from my total earned XP across activities, not from the number of modules in this path.</p>
      <h3>Earn XP. Reach the next level.</h3>
      <p>I earn XP through training activities. Mission awards can vary with performance, hints, and repeat attempts. I advance when my total XP reaches the next level threshold.</p>
      <div class="help-levels"><div><small>LEVEL 3 · TRAINEE</small><strong>2,500 XP</strong></div><div class="current"><small>LEVEL 4 · ANALYST</small><strong>5,000 XP</strong></div><div><small>LEVEL 5 · RESPONDER</small><strong>8,000 XP</strong></div></div>
      <p>For example, at 6,200 total XP I would be Level 4, with 1,200 of the 3,000 XP needed between Levels 4 and 5. That is 40% of the way to Level 5, with 1,800 XP remaining.</p>
      <h3>My level and my path are separate</h3>
      <p>I can start a new path at 0 of 5 modules complete while already having earned a level elsewhere.</p>
      <p class="help-note">I’ve kept Level 4 and “Preview operator” as sample data here. I’m showing the app’s default level thresholds, not a live account balance. This preview does not award XP or change my level.</p>`
  },
  world: {
    title: 'World · My big-picture view',
    body: `<p>I use World to see my learning path on the globe: where the modules are, how the route connects them, and which module is selected.</p><h3>Return to orbit</h3><p>In my interactive branch prototype, World returns the camera from a module’s close-up environment to the globe. If I’m already in the world view, I stay there.</p><p class="help-note">I’m using a static globe in this shared preview, so this button explains the view without moving the camera or changing my progress.</p>`
  },
  environment: {
    title: 'Environment · My module in focus',
    body: `<p>I use Environment to move from the global route into a closer view of the selected, available module’s location.</p><h3>Get oriented before beginning</h3><p>In my interactive branch prototype, the camera moves to the site and reveals its environment and briefing context. I use World to return to orbit. Entering this view does not complete a module or award XP.</p><p class="help-note">I’m explaining the interaction here; the shared preview does not run the 3D camera transition. I can open the module briefing from the map’s View briefing button.</p>`
  },
  route: {
    title: 'Preview route · My guided tour',
    body: `<p>I use Preview route to get a guided look at the learning path before I begin the training.</p><h3>Follow the journey</h3><p>In my interactive branch prototype, this starts an animated tour of the route’s module locations. I can pause, advance, or exit the tour. It is an orientation tool, so it does not complete modules or award XP.</p><p class="help-note">I’ve kept the globe static in this shared preview. The numbered dock shows my five-module example route; the animated tour is not running here.</p>`
  }
};
const guide = document.createElement('dialog');
guide.className = 'operator-help';
guide.setAttribute('aria-labelledby', 'operator-help-title');
guide.innerHTML = `<header><span>OPERATOR GUIDE</span><button type="button" class="help-close" aria-label="Close operator guide">×</button></header><nav aria-label="Guide topics"><button type="button" data-topic="level">My level</button><button type="button" data-topic="world">World</button><button type="button" data-topic="environment">Environment</button><button type="button" data-topic="route">Preview route</button></nav><div class="help-body"><h2 id="operator-help-title"></h2><div id="operator-help-copy"></div></div>`;
document.body.append(guide);
function showOperatorHelp(topic) {
  guide.querySelector('h2').textContent = operatorHelp[topic].title;
  guide.querySelector('#operator-help-copy').innerHTML = operatorHelp[topic].body;
  guide.querySelectorAll('[data-topic]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === topic)));
  guide.querySelector('.help-body').scrollTop = 0;
  if (!guide.open) guide.showModal();
}
guide.querySelector('.help-close').onclick = () => guide.close();
guide.addEventListener('click', e => { if (e.target === guide) { const r = guide.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) guide.close(); } });
guide.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => showOperatorHelp(b.dataset.topic));
for (const [id, topic] of Object.entries({operatorPlate:'level',viewWorld:'world',viewEnvironment:'environment',previewRoute:'route'})) {
  const control = document.getElementById(id);
  if (!control) continue;
  control.setAttribute('aria-haspopup', 'dialog');
  control.title = `Explain ${topic === 'level' ? 'my level' : control.textContent.trim()}`;
  control.onclick = () => showOperatorHelp(topic);
  if (id === 'operatorPlate') {
    control.setAttribute('role', 'button');
    control.setAttribute('tabindex', '0');
    control.setAttribute('aria-label', 'Level 4 Preview operator — how my level works');
    control.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showOperatorHelp('level'); } };
  }
}
const compactGuide = document.createElement('button');
compactGuide.type = 'button';
compactGuide.className = 'compact-operator-guide';
compactGuide.textContent = 'Operator guide';
compactGuide.setAttribute('aria-haspopup', 'dialog');
compactGuide.onclick = () => showOperatorHelp('level');
document.querySelector('.player-tools')?.prepend(compactGuide);

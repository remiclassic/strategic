// The bench: people Remi brings in when a project needs more than one pair of hands.
//
// Cards with a `name` are real people Remi named; the rest are open roles and show the role icon only
// (see Team.astro). Do not invent names here. Backgrounds come from each person's public LinkedIn profile.
export type Member = { role: string; icon: string; group: 'Engineering' | 'Art & design' | 'Delivery'; skills: string[]; name?: string; background?: string; photo?: string };

export const bench: Member[] = [
  { group: 'Engineering', role: 'UI engineer · Unreal', icon: 'code', skills: ['C++', 'UMG', 'CommonUI', 'Slate'] },
  { group: 'Engineering', role: 'UI engineer · Unity', icon: 'cube', skills: ['C#', 'UI Toolkit', 'uGUI'], name: 'Omar Rosario', photo: '/media/services/team/omar-rosario.webp', background: 'Unity3D and C#, with Go services and Kubernetes behind them' },
  { group: 'Engineering', role: 'Gameplay engineer', icon: 'gamepad', skills: ['Systems', 'Tools', 'Input'] },
  { group: 'Engineering', role: 'Backend engineer', icon: 'server', skills: ['Services & APIs', 'Accounts', 'Live ops'] },
  { group: 'Engineering', role: 'Web & full-stack engineer', icon: 'globe', skills: ['TypeScript', 'React', 'Node'], name: 'Brian Díaz', photo: '/media/services/team/brian-diaz.webp', background: 'Senior software engineer, 10+ years building SaaS and AI platforms' },
  { group: 'Art & design', role: 'Game UX/UI designer', icon: 'layout', skills: ['UX flows', 'Spatial UI', 'Design systems'], name: 'Stephan Dube', photo: '/media/services/team/stephan-dube.webp', background: 'Founder of UI Peeps; adjunct professor of UX/UI for games' },
  { group: 'Art & design', role: 'UI artist', icon: 'layout', skills: ['Screens', 'Icons', 'Illustration'], name: 'Victor Del Castillo', photo: '/media/services/team/victor-del-castillo.webp', background: 'Senior UI artist; game UI for Unreal, motion graphics and illustration' },
  { group: 'Art & design', role: 'Motion designer', icon: 'curve', skills: ['UI animation', 'VFX', 'Stingers'] },
  { group: 'Art & design', role: 'Technical artist', icon: 'shader', skills: ['Shaders', 'Materials', 'Optimisation'] },
  { group: 'Delivery', role: 'Producer', icon: 'calendar', skills: ['Planning', 'Milestones', 'Reporting'] },
  { group: 'Delivery', role: 'QA & playtest', icon: 'check', skills: ['Test plans', 'Device coverage', 'Usability'] },
  { group: 'Delivery', role: 'Operations & client coordination', icon: 'contract', skills: ['Scoping', 'Scheduling', 'Client support'], name: 'Ana Cristina Ibarra Villezcas', photo: '/media/services/team/ana-cristina-ibarra-villezcas.webp', background: 'Operations, client service, sales and team coordination' },
  { group: 'Delivery', role: 'New business', icon: 'contract', skills: ['Sales', 'Partnerships', 'Proposals'], name: 'Matthieu Couture', photo: '/media/services/team/matthieu-couture.webp', background: 'Business owner and sales coach; two decades leading customer service' },
];

export const delivers = [
  ['Game UI, end to end', 'Design, motion and engine implementation, with the engineers to wire it to game state.'],
  ['Complete games and prototypes', 'Client, gameplay and interface, from vertical slice to a build you can ship.'],
  ['Apps and web products', 'Front end, back end and the services between them, deployed and documented.'],
  ['Tools and pipelines', 'Editors, exporters and plugins that make your own team faster.'],
];

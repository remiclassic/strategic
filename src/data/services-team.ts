// The bench: people Remi brings in when a project needs more than one pair of hands.
//
// PLACEHOLDERS. `name` and `background` are empty until Remi supplies real people.
// While they are empty the card shows the role and its role icon (see Team.astro); the "to be added" hints appear
// in the dev server and never in a production build. Do not invent names here.
export type Member = { role: string; icon: string; group: 'Engineering' | 'Art & design' | 'Delivery'; skills: string[]; name?: string; background?: string };

export const bench: Member[] = [
  { group: 'Engineering', role: 'UI engineer · Unreal', icon: 'code', skills: ['C++', 'UMG', 'CommonUI', 'Slate'] },
  { group: 'Engineering', role: 'UI engineer · Unity', icon: 'cube', skills: ['C#', 'UI Toolkit', 'uGUI'] },
  { group: 'Engineering', role: 'Gameplay engineer', icon: 'gamepad', skills: ['Systems', 'Tools', 'Input'] },
  { group: 'Engineering', role: 'Backend engineer', icon: 'server', skills: ['Services & APIs', 'Accounts', 'Live ops'] },
  { group: 'Engineering', role: 'Web & full-stack engineer', icon: 'globe', skills: ['TypeScript', 'React', 'Node'] },
  { group: 'Art & design', role: 'UI artist', icon: 'layout', skills: ['Screens', 'Icons', 'Illustration'] },
  { group: 'Art & design', role: 'Motion designer', icon: 'curve', skills: ['UI animation', 'VFX', 'Stingers'] },
  { group: 'Art & design', role: 'Technical artist', icon: 'shader', skills: ['Shaders', 'Materials', 'Optimisation'] },
  { group: 'Delivery', role: 'Producer', icon: 'calendar', skills: ['Planning', 'Milestones', 'Reporting'] },
  { group: 'Delivery', role: 'QA & playtest', icon: 'check', skills: ['Test plans', 'Device coverage', 'Usability'] },
  { group: 'Delivery', role: 'New business', icon: 'contract', skills: ['Scoping', 'Proposals', 'Contracts'] },
];

export const delivers = [
  ['Game UI, end to end', 'Design, motion and engine implementation, with the engineers to wire it to game state.'],
  ['Complete games and prototypes', 'Client, gameplay and interface, from vertical slice to a build you can ship.'],
  ['Apps and web products', 'Front end, back end and the services between them, deployed and documented.'],
  ['Tools and pipelines', 'Editors, exporters and plugins that make your own team faster.'],
];

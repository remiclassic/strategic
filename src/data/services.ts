// Content for the /services/ section: UI/UX design, motion and implementation for games, apps, sites and training products.

// What the studio builds. Every link goes to real work on this site.
export const tracks = [
  { title: 'Games', body: 'HUD, menus and systems UI, designed and implemented in engine, with controller, keyboard and touch support.', links: [['Engine implementation', '#engines'], ['Our games', '/games/']] },
  { title: 'Apps & tools', body: 'Web and desktop products with dense, task-heavy interfaces: editors, dashboards, writing and file tools.', links: [['NarriaFlow', '/work/narriaflow/'], ['Real Estate 3D Home', '/work/real-estate/'], ['DriveDeck', '/drivedeck/']] },
  { title: 'Websites', body: 'Marketing and product sites, designed and built as components, with performance and accessibility checked. This site is one of them.', links: [['This site', '/']] },
  { title: 'Courses & training', body: 'Learning products where the interaction does the teaching: training games, simulations and guided practice with a debrief.', links: [['Training games', '/training/'], ['Learning library', '/learn/']] },
];

export const disciplines = [
  {
    id: 'ux', index: '01', title: 'UX & user flows',
    lead: 'Decide what people need before deciding how it looks.',
    body: 'Flow maps, wireframes and clickable prototypes for the journeys that carry your product: first session, core loop or core task, navigation, checkout and progression.',
    items: [['Flow diagrams', 'Every path, including the way back'], ['Wireframes', 'All states, empty and error too'], ['Clickable prototypes', 'Something to put in front of real users'], ['UX audits', 'Prioritised fixes for a live build'], ['Onboarding & FTUE', 'The first ten minutes, designed'], ['Accessibility review', 'Text size, contrast, input, motion']],
    slides: [
      { image: '/media/services/portfolio/stardust-flow.webp', caption: 'User flow · Stardust Canvas', alt: 'Flowchart connecting mobile screens from splash through play, rewards and sharing' },
      { image: '/media/services/portfolio/figma-canvas.webp', caption: 'Figma working file · mobile word game', alt: 'Figma canvas with word game screens, star tier components and a results screen' },
      { image: '/media/services/portfolio/stardust-sitemap.webp', caption: 'Sitemap · Stardust Canvas', alt: 'Sitemap of a mobile app with screens grouped by section' },
      { image: '/media/services/portfolio/attack-flow.webp', caption: 'Feature flow · mobile strategy study', alt: 'Four mobile screens showing an incoming attack flow' },
      { image: '/media/services/portfolio/style-tests.webp', caption: 'Five styles tested side by side', alt: 'Five visual styles of the same mobile screens laid out for comparison' },
      { image: '/media/services/portfolio/stardust-components.webp', caption: 'Component sheet · Stardust Canvas', alt: 'Sheet of cards, icons and toolbar components' },
    ],
  },
  {
    id: 'ui', index: '02', title: 'UI art & design systems',
    lead: 'A visual language that holds up at screen two hundred.',
    body: 'Look development on representative screens, then a component library with every state drawn, named and ready to slice.',
    items: [['Look development', 'Style frames on real screens'], ['Screen design', 'Dashboards, menus, HUD, store, settings'], ['Component sheets', 'Every state, named and specified'], ['Icon sets', 'One grid, one weight, one voice'], ['Style guides', 'Colour, type and spacing as tokens'], ['Export-ready assets', 'Atlases and nine-slices that fit']],
    slides: [
      { image: '/media/services/portfolio/mw5-mechbay.webp', caption: 'Mech bay · MechWarrior 5: Mercenaries', alt: 'Mech bay interface with a mech, loadout slots and repair status' },
      { image: '/media/services/portfolio/vanguard-class.webp', caption: 'Class selection · Vanguard concept', alt: 'Class selection with a knight, role stats and current loadout' },
      { image: '/media/services/portfolio/mw5-starmap.webp', caption: 'Star map · MechWarrior 5: Mercenaries', alt: 'Star map with planets, travel routes and a news panel' },
      { image: '/media/services/portfolio/hockey-hub.webp', caption: 'Club hub · FACE/OFF concept', alt: 'Hockey club hub with next game and a player in action' },
      { image: '/media/services/portfolio/squad-faction.webp', caption: 'Faction selection · SQUAD concept', alt: 'Faction selection screen with a soldier, flag and equipment categories' },
      { image: '/media/services/portfolio/cards-deckbuilder.webp', caption: 'Deck builder · Gogii Games', alt: 'Deck builder with a card grid and the current deck list' },
      { image: '/images/game-ui/neon-breach/07-fps.webp', caption: 'FPS HUD · Neon Breach concept', alt: 'First-person shooter HUD in a neon city' },
      { image: '/media/services/portfolio/soccer-squad.webp', caption: 'Matchday squad · TOUCHLINE concept', alt: 'Soccer squad screen with a formation and an empty striker slot' },
      { image: '/images/game-ui/fantasy-adventurer/06-hud.webp', caption: 'Adventure HUD · Fantasy Adventurer concept', alt: 'Fantasy adventure HUD over a ruined forest city' },
      { image: '/media/services/portfolio/mw5-mission.webp', caption: 'Mission briefing · MechWarrior 5: Mercenaries', alt: 'Mission briefing with terrain map, objectives and contract terms' },
    ],
  },
  {
    id: 'motion', index: '03', title: 'Motion & feedback',
    lead: 'The part people feel before they read anything.',
    body: 'Transitions, state feedback, stingers and micro-interactions, specified as timing and easing tokens so the build matches the prototype.',
    items: [['Motion prototypes', 'One per interaction, to approve'], ['Timing & easing tokens', 'A spec engineers can use'], ['HUD feedback', 'Damage, cooldowns, pickups'], ['Screen transitions', 'In, out and between'], ['Stingers & rewards', 'Level up, loot, victory'], ['In-engine animation', 'Built, not handed over as video']],
    slides: [
      { video: '/media/services/motion/fpsvictoryscrn.mp4', poster: '/media/services/motion/fpsvictoryscrn.jpg', caption: 'Victory screen · motion concept', alt: 'Victory screen motion concept' },
      { video: '/media/services/motion/fpsscifi.mp4', poster: '/media/services/motion/fpsscifi.jpg', caption: 'Sci-fi inventory · motion concept', alt: 'Sci-fi inventory motion concept' },
      { video: '/media/services/motion/progressionfps.mp4', poster: '/media/services/motion/progressionfps.jpg', caption: 'Progression console · motion concept', alt: 'Progression console motion concept' },
      { video: '/media/services/motion/loading.mp4', poster: '/media/services/motion/loading.jpg', caption: 'Loading screen · motion concept', alt: 'Fantasy loading screen motion concept' },
      { video: '/media/services/motion/diagnostic.mp4', poster: '/media/services/motion/diagnostic.jpg', caption: 'Diagnostic console · motion concept', alt: 'Starship diagnostic console motion concept' },
    ],
  },
  {
    id: 'implementation', index: '04', title: 'Technical UI & implementation',
    lead: 'Built in your engine or codebase, in your repository, to your budget.',
    body: 'Components, layouts, bindings and navigation built directly in the project, so there is no gap between the approved design and the shipped screen.',
    items: [['Widget architecture', 'Components your team can extend'], ['Input & focus', 'Controller, keyboard, mouse, touch'], ['Data binding', 'UI wired to real state'], ['Resolution & safe zones', 'Phone to ultrawide to TV'], ['Localisation', 'Long strings, RTL, font fallbacks'], ['Profiling & optimisation', 'Against a frame and memory budget']],
    slides: [
      { video: '/media/services/editor/sf-export.mp4', poster: '/media/services/editor/sf-export.jpg', caption: 'Export to Unreal UMG · SliceForge', alt: 'SliceForge exporting an interface for Unreal UMG' },
      { image: '/media/services/portfolio/ue-widget-editor.webp', caption: 'UMG widget editor · Unreal Engine', alt: 'Unreal Engine widget blueprint editor with a numbered focus rail' },
      { image: '/media/services/unreal-focus-doctor.webp', caption: 'Focus Doctor · Unreal Engine', alt: 'Unreal Engine designer with a validation panel reporting a navigation warning' },
      { image: '/media/services/portfolio/ue-runtime-settings.webp', caption: 'Running build · Unreal Engine', alt: 'A running Unreal settings menu with device prompts and a focus overlay' },
      { video: '/media/services/editor/sf-edit-preview-export.mp4', poster: '/media/services/editor/sf-edit-preview-export.jpg', caption: 'Edit, preview, export · SliceForge', alt: 'An interface edited, previewed and exported in SliceForge' },
    ],
  },
];

export const codev = [
  ['In your repository', 'Git or Perforce, your branching model, your review process. UI arrives as commits and pull requests.'],
  ['In your sprints', 'Planned with your producers, shown in your reviews, sized to your milestones.'],
  ['One accountable lead', 'Design and implementation answer to the same person, so nothing is lost between them.'],
  ['A clean handover', 'Documented components, source files and a walkthrough, so your team owns it afterwards.'],
];

export const healthBarNote = 'The same component in every runtime: a health bar whose ghost segment waits 450 ms, then drains over 600 ms. It is the bar running in the demo at the top of this page.';

export const engines = [
  {
    slug: 'unreal', name: 'Unreal Engine', short: 'Unreal', tone: 'a',
    stack: ['UMG', 'CommonUI', 'Slate', 'C++ & Blueprint', 'Materials for UI'],
    headline: 'UMG that survives\na controller.',
    summary: 'Widget architecture, CommonUI input routing, focus navigation and UI materials, built in C++ where it matters and left in Blueprint where designers need to iterate.',
    proofLabel: 'Shipped on Fab',
    does: [
      ['Widget architecture', 'C++ base classes with BindWidget, so layout stays in the designer and logic stays reviewable in source control.'],
      ['Input and focus', 'CommonUI activatable stacks, input routing per layer, and predictable controller focus across menus, popups and scroll boxes.'],
      ['UI materials and motion', 'Material-driven fills, masks and glows, with widget animations and sequenced transitions tuned to a timing spec.'],
      ['Performance', 'Invalidation boxes, retainer panels where they pay off, and Slate and Unreal Insights passes against a UI frame budget.'],
    ],
    checklist: ['UE 5.x, C++ and Blueprint', 'CommonUI and Enhanced Input', 'Gamepad, keyboard and mouse, touch', 'DPI scaling and safe zones', 'Localisation and text overflow', 'Console UI platform requirements'],
    lang: 'C++ · UMG', file: 'HealthBarWidget.cpp',
    code: `// Layout and styling stay in the Widget Blueprint; behaviour lives in C++.
UCLASS()
class UHealthBarWidget : public UUserWidget
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintCallable) void SetHealth(float NewPct);
protected:
    virtual void NativeTick(const FGeometry& Geo, float Dt) override;
    UPROPERTY(meta=(BindWidget)) TObjectPtr<UProgressBar> Fill;
    UPROPERTY(meta=(BindWidget)) TObjectPtr<UProgressBar> Ghost;
    UPROPERTY(Transient, meta=(BindWidgetAnim)) TObjectPtr<UWidgetAnimation> HitFlash;
    UPROPERTY(EditAnywhere) float GhostDelay = 0.45f;
    UPROPERTY(EditAnywhere) float GhostSpeed = 1.f / 0.6f;
private:
    float Target = 1.f, Hold = 0.f;
};

void UHealthBarWidget::SetHealth(float NewPct)
{
    NewPct = FMath::Clamp(NewPct, 0.f, 1.f);
    if (NewPct < Target) { Hold = GhostDelay; PlayAnimation(HitFlash); }
    Target = NewPct;
    Fill->SetPercent(Target);
}

void UHealthBarWidget::NativeTick(const FGeometry& Geo, float Dt)
{
    Super::NativeTick(Geo, Dt);
    if ((Hold -= Dt) > 0.f) return;
    Ghost->SetPercent(FMath::FInterpConstantTo(Ghost->GetPercent(), Target, Dt, GhostSpeed));
}`,
  },
  {
    slug: 'unity', name: 'Unity', short: 'Unity', tone: 'b',
    stack: ['UI Toolkit', 'uGUI', 'UXML & USS', 'C#', 'Shader Graph for UI'],
    headline: 'UI Toolkit or uGUI.\nWhichever your project needs.',
    summary: 'Runtime UI in UI Toolkit with UXML and USS, or uGUI with prefabs and canvases where the project already lives there. Structured so a team can extend it without us.',
    proofLabel: 'Implementation approach',
    does: [
      ['Component library', 'Custom VisualElements or prefab variants for every component, with states driven by classes rather than one-off scripts.'],
      ['Styling as tokens', 'USS variables for colour, type and spacing, so a re-skin or a platform variant is a stylesheet change.'],
      ['Navigation', 'Input System actions, explicit focus order, and device-aware button prompts that swap when the player changes input.'],
      ['Performance', 'Canvas splitting, batching and atlas discipline on uGUI; panel settings, usage hints and profiler passes on UI Toolkit.'],
    ],
    checklist: ['Unity 6 and 2022 LTS', 'UI Toolkit and uGUI', 'Input System', 'Addressables-friendly UI assets', 'Safe areas and aspect ratios, mobile to ultrawide', 'TextMesh Pro and localisation'],
    lang: 'C# · UI Toolkit', file: 'HealthBar.cs',
    code: `// Layout in UXML, look in USS. The ghost trails through a USS transition:
//   .health-bar__ghost--trailing { transition: width 0.6s ease-out 0.45s; }
[UxmlElement]
public partial class HealthBar : VisualElement
{
    readonly VisualElement fill = new() { name = "fill" };
    readonly VisualElement ghost = new() { name = "ghost" };
    float target = 1f;

    public HealthBar()
    {
        AddToClassList("health-bar");
        Add(ghost);
        Add(fill);
    }

    public void SetHealth(float pct)
    {
        pct = Mathf.Clamp01(pct);
        bool damage = pct < target;
        target = pct;

        fill.style.width = Length.Percent(target * 100f);
        ghost.EnableInClassList("health-bar__ghost--trailing", damage);
        ghost.style.width = Length.Percent(target * 100f);

        if (!damage) return;
        AddToClassList("is-hit");
        schedule.Execute(() => RemoveFromClassList("is-hit")).StartingIn(120);
    }
}`,
  },
  {
    slug: 'godot', name: 'Godot', short: 'Godot', tone: 'c',
    stack: ['Control nodes', 'Themes', 'GDScript & C#', 'Tweens', 'CanvasItem shaders'],
    headline: 'Control nodes,\nthemed and tweened.',
    summary: 'Scenes built from containers that resize properly, one Theme resource that carries the visual language, and motion written as tweens you can read.',
    proofLabel: 'Implementation approach',
    does: [
      ['Scene structure', 'Each component is its own scene with a small script and exported properties, composed with containers rather than fixed positions.'],
      ['Theme resources', 'Type variations, styleboxes and font sizes in one Theme, so screens inherit the look instead of overriding it.'],
      ['Focus and input', 'Explicit focus neighbours, input actions for every device, and prompts that follow the active controller.'],
      ['Motion and shaders', 'Tweens for transitions and feedback, CanvasItem shaders for fills, dissolves and highlights.'],
    ],
    checklist: ['Godot 4.x', 'GDScript and C#', 'Containers and anchors for any aspect ratio', 'Gamepad, keyboard and touch', 'Translation server and font fallbacks', 'Desktop, mobile and web export'],
    lang: 'GDScript · Godot 4', file: 'health_bar.gd',
    code: `# Fill and Ghost are TextureProgressBars styled by the project Theme.
extends Control

const GHOST_DELAY := 0.45
const GHOST_TIME := 0.6

@onready var fill: TextureProgressBar = %Fill
@onready var ghost: TextureProgressBar = %Ghost
var _tween: Tween

func set_health(pct: float) -> void:
    pct = clampf(pct, 0.0, 1.0)
    var damage := pct < fill.value
    fill.value = pct

    if _tween:
        _tween.kill()
    _tween = create_tween()
    if damage:
        _flash()
        _tween.tween_interval(GHOST_DELAY)
    _tween.tween_property(ghost, "value", pct, GHOST_TIME) \\
        .set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)

func _flash() -> void:
    modulate = Color(1.8, 1.8, 1.8)
    create_tween().tween_property(self, "modulate", Color.WHITE, 0.12)`,
  },
  {
    slug: 'playcanvas', name: 'PlayCanvas', short: 'PlayCanvas', tone: 'd',
    stack: ['Element & Screen components', 'ESM scripts', 'HTML overlay UI', 'WebGL2 & WebGPU', 'Editor or engine-only'],
    headline: '3D in the browser,\nwith UI that keeps up.',
    summary: 'Interfaces for PlayCanvas projects, in the engine’s own element system or as an HTML layer over the canvas, sized for a link that has to load fast on a phone.',
    proofLabel: 'Live on this page',
    does: [
      ['Two UI routes', 'Screen and Element components when the UI must live in the scene; HTML and CSS over the canvas when text, layout and accessibility matter more.'],
      ['World-anchored UI', 'Callouts, markers and tooltips that track a point in 3D space and stay readable as the camera moves.'],
      ['Input everywhere', 'Mouse, touch, keyboard and gamepad through one action layer, with touch targets sized for a thumb.'],
      ['Load and frame budget', 'Lazy-loaded engine and assets, texture atlases, and UI that does not force a redraw of the scene.'],
    ],
    checklist: ['PlayCanvas engine 2.x', 'Editor projects and engine-only builds', 'Element UI and HTML overlay', 'Responsive from phone to desktop', 'Playable ads and embedded web builds', 'Analytics and deep links'],
    lang: 'JavaScript · ESM script', file: 'health-bar.mjs',
    code: `// Attached to a Group element under a Screen; fill and ghost are Image elements.
import { Script, math } from 'playcanvas';

export class HealthBar extends Script {
    static scriptName = 'healthBar';

    /** @attribute @type {import('playcanvas').Entity} */ fill;
    /** @attribute @type {import('playcanvas').Entity} */ ghost;
    /** @attribute */ ghostDelay = 0.45;
    /** @attribute */ ghostTime = 0.6;

    target = 1; shown = 1; hold = 0;

    setHealth(pct) {
        pct = math.clamp(pct, 0, 1);
        if (pct < this.target) this.hold = this.ghostDelay;
        this.target = pct;
        this.fill.element.anchor = [0, 0, pct, 1];
    }

    update(dt) {
        if ((this.hold -= dt) > 0) return;
        const step = dt / this.ghostTime;
        this.shown += math.clamp(this.target - this.shown, -step, step);
        this.ghost.element.anchor = [0, 0, this.shown, 1];
    }
}`,
  },
  {
    slug: 'web', name: 'Web & custom engines', short: 'Web', tone: 'e',
    stack: ['TypeScript', 'DOM & CSS', 'Canvas & WebGL', 'three.js', 'React'],
    headline: 'Games that open\nfrom a link.',
    summary: 'Browser games and custom engines, where the interface is often half the product. Designed and built end to end, from the first wireframe to the deployed build.',
    proofLabel: 'Shipped and playable',
    does: [
      ['DOM, canvas or both', 'DOM and CSS for menus and text-heavy UI, canvas or WebGL for the playfield, and a clean boundary between them.'],
      ['Motion on the compositor', 'Transforms and opacity driven by custom properties and the Web Animations API, so feedback stays smooth while the game works.'],
      ['Input and accessibility', 'Keyboard, pointer, touch and Gamepad API, with real focus management and reduced-motion support.'],
      ['Ship it', 'Bundling, code-splitting, asset compression and hosting, so the game loads quickly from a plain URL.'],
    ],
    checklist: ['TypeScript, Vite', 'React or framework-free', 'three.js, Canvas 2D, WebGL', 'Gamepad API and touch', 'Embeds for courses, LMS and portals', 'Custom and in-house engines'],
    lang: 'TypeScript · DOM + CSS', file: 'health-bar.ts',
    code: `// The compositor does the motion. CSS that goes with it:
//   .fill, .ghost       { transform-origin: left; transform: scaleX(var(--hp)); }
//   .is-damage .ghost   { transition: transform .6s cubic-bezier(.2,.7,.2,1) .45s; }
export function setHealth(bar: HTMLElement, pct: number): void {
  pct = Math.min(1, Math.max(0, pct));
  const previous = Number(bar.style.getPropertyValue('--hp') || 1);
  const damage = pct < previous;

  bar.classList.toggle('is-damage', damage);
  bar.style.setProperty('--hp', String(pct));

  if (damage) {
    bar.animate({ filter: ['brightness(1.8)', 'none'] }, { duration: 120 });
  }
}`,
  },
];

export type Engine = (typeof engines)[number];

// Real work only. `kind` says exactly what the viewer is looking at.
export const work = [
  {
    id: 'norman', engines: ['web'], size: 'wide',
    title: 'Norman Ascension', tech: 'Custom three.js engine · WebGL',
    kind: 'In-engine footage · our own game, in development',
    body: 'An online medieval dynasty RPG running in a browser-based engine we wrote. World, rendering and interface are built in-house.',
    video: '/media/norman-ascension/hero-loop.mp4', poster: '/media/norman-ascension/hero-poster.jpg',
    href: '/norman-ascension/', cta: 'See the game',
  },
  {
    id: 'mission-control', engines: ['web'], size: 'tall',
    title: 'Mission Control', tech: 'Web · TypeScript · 3D globe',
    kind: 'Recorded build · training simulation',
    body: 'A mission hub with a live globe, guided tutorial, progression and debrief screens. Designed and implemented.',
    video: '/training/mission-control/mission-control.mp4', poster: '/training/mission-control/mission-control.jpg',
    href: '/training/', cta: 'Open the case study',
  },
  {
    id: 'narriaflow', engines: [] as string[], size: 'std',
    title: 'NarriaFlow', tech: 'Web app · infinite-canvas writing tool',
    kind: 'Development recording · complete, awaiting launch',
    body: 'A writing workspace with a canvas for relationships, an outline for order and detail views for characters.',
    video: '/media/work/narriaflow-demo.mp4', poster: '/media/work/narriaflow-poster.webp',
    href: '/work/narriaflow/', cta: 'Read the case study',
  },
  {
    id: 'real-estate', engines: [] as string[], size: 'std',
    title: 'Real Estate 3D Home', tech: 'Web application · 2D plan and 3D walkthrough',
    kind: 'Rendered application output · synthetic demonstration property',
    body: 'Plan editing, furnished room views and a walkthrough of the same property, kept in one application.',
    video: '/media/work/real-estate-demo.mp4', poster: '/media/work/real-estate-poster.webp',
    href: '/work/real-estate/', cta: 'Read the case study',
  },
  {
    id: 'network-defense', engines: ['web'], size: 'std',
    title: 'Network Defense', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay · playable in the browser',
    body: 'Isometric strategy with a readable board, evidence panels and a rules editor.',
    video: '/training/my-games/network-defense.mp4', poster: '/training/my-games/network-defense.jpg',
    href: '/training/', cta: 'Play and inspect',
  },
  {
    id: 'soc', engines: ['web'], size: 'std',
    title: 'SOC Dashboard Challenge', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay',
    body: 'A dense investigation console made scannable: evidence, timeline and a decision to defend.',
    video: '/training/my-games/soc.mp4', poster: '/training/my-games/soc.jpg',
    href: '/training/', cta: 'See the set of eight',
  },
  {
    id: 'dispatch', engines: ['web'], size: 'std',
    title: 'Cyber Dispatch', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay',
    body: 'A dispatcher desk: prioritise, assign, and see what each call cost.',
    video: '/training/my-games/dispatch.mp4', poster: '/training/my-games/dispatch.jpg',
    href: '/training/', cta: 'See the set of eight',
  },
  {
    id: 'focusrail', engines: ['unreal'], size: 'wide',
    title: 'Focusrail', tech: 'Unreal Engine 5 · UMG · C++ plugin',
    kind: 'Editor capture · plugin available on Fab',
    body: 'Our controller-navigation plugin for UMG. Focus memory, navigation rails and a Focus Doctor that finds broken navigation before a player does.',
    image: '/media/services/unreal-focus-doctor.webp', imageAlt: 'Unreal Engine widget designer with the Focusrail Focus Doctor panel reporting a duplicate navigation order and offering an automatic fix',
    href: 'https://www.fab.com/listings/47a56c00-ab32-4c20-8aba-04935b4a2578', cta: 'View on Fab', external: true,
  },
  {
    id: 'world-editor', engines: ['web'], size: 'tall',
    title: 'SliceForge World Editor', tech: 'Web · WebGL authoring tool',
    kind: 'Development recording',
    body: 'Paint a grid, watch the 3D world regenerate beside it. Tool UX for game teams.',
    video: '/media/work/world-editor-demo.mp4', poster: '/media/work/world-editor-poster.webp',
    href: '/work/world-editor/', cta: 'Read the case study',
  },
  {
    id: 'sliceforge', engines: ['web'], size: 'std',
    title: 'SliceForge', tech: 'Web app · game UI production tool',
    kind: 'Product screenshot · available now',
    body: 'Our own tool for turning a reference into an editable interface, with component states and a UI kit export.',
    image: '/studio-images/sf-compose.webp', imageAlt: 'A fantasy alchemy game interface arranged in the SliceForge Compose editor',
    href: 'https://www.sliceforge.io/', cta: 'Try SliceForge', external: true,
  },
  {
    id: 'cloud', engines: ['web'], size: 'std',
    title: 'Cloud Command', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay',
    body: 'Arcade flight with a HUD that has to be read at speed.',
    video: '/training/my-games/cloud.mp4', poster: '/training/my-games/cloud.jpg',
    href: '/training/', cta: 'See the set of eight',
  },
  {
    id: 'privilege', engines: ['web'], size: 'std',
    title: 'Privilege Path Puzzle', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay',
    body: 'An access graph you solve by reading it: nodes, paths and the one edge that matters.',
    video: '/training/my-games/privilege.mp4', poster: '/training/my-games/privilege.jpg',
    href: '/training/', cta: 'See the set of eight',
  },
  {
    id: 'queryhunt', engines: ['web'], size: 'std',
    title: 'Query Hunt', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay',
    body: 'A SQL investigation where the query editor, results and case notes share one screen.',
    video: '/training/my-games/queryhunt.mp4', poster: '/training/my-games/queryhunt.jpg',
    href: '/training/', cta: 'See the set of eight',
  },
  {
    id: 'triage', engines: ['web'], size: 'std',
    title: 'Incident Triage Race', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay',
    body: 'An alert board under time pressure: sort, prioritise, and justify the order.',
    video: '/training/my-games/triage.mp4', poster: '/training/my-games/triage.jpg',
    href: '/training/', cta: 'See the set of eight',
  },
  {
    id: 'phishing', engines: ['web'], size: 'std',
    title: 'Phishing Speed Drill', tech: 'Web game · React · TypeScript',
    kind: 'Recorded gameplay',
    body: 'A timed inbox with an inspector for sender, link and tone evidence.',
    video: '/training/my-games/phishing.mp4', poster: '/training/my-games/phishing.jpg',
    href: '/training/', cta: 'See the set of eight',
  },
];

export const directions = [
  ['neon-breach', 'Neon Breach', 'Tactical shooter', '02-main-menu.webp'],
  ['fantasy-adventurer', 'Fantasy Adventurer', 'Action RPG', '02-main-menu.webp'],
  ['orbital-command', 'Orbital Command', 'Sci-fi strategy', '02-main-menu.webp'],
  ['havenworks', 'Havenworks', 'Management sim', '10-workforce.webp'],
  ['duskbound-raiders', 'Duskbound Raiders', 'Mobile RPG', '02-main-menu.webp'],
  ['modern-essentials', 'Modern Essentials', 'Clean and neutral', '02-main-menu.webp'],
];

export const process = [
  ['Brief and audit', 'We use the build, read the docs and map where people hesitate. You get a written scope before any design starts.', 'Scope, flow map, risk list'],
  ['Flows and wireframes', 'Structure first. Every screen and state in grey boxes, tested as a clickable prototype.', 'Wireframes, prototype'],
  ['Look development', 'Visual direction on three or four representative screens, then the component library.', 'Style frames, component library'],
  ['Motion', 'Timing and easing defined as tokens and proven in a motion prototype.', 'Motion spec, prototypes'],
  ['Implementation', 'Built in your engine or codebase, in your repository, reviewed through pull requests like any other code.', 'Components, navigation, bindings'],
  ['Polish and handover', 'Profiling, edge cases, localisation and input passes, then documentation your team can extend.', 'Perf report, docs, source'],
];

export const offers = [
  {
    id: 'review', title: 'UI & UX audit', span: 'About 1 week',
    lead: 'Know what to fix first.',
    body: 'A hands-on review of your current build or designs: hierarchy, navigation, feedback, readability, input and accessibility.',
    outputs: ['Annotated screens and recordings', 'Prioritised fix list by impact and cost', 'A recommended next scope'],
  },
  {
    id: 'prototype', title: 'Vertical slice', span: '2 to 4 weeks',
    lead: 'One journey, designed and running in the product.',
    body: 'Pick the flow that matters most. It is designed, animated and implemented in your project so the team can judge the real thing.',
    outputs: ['Final-quality screens for one flow', 'Motion and input implemented', 'Component foundations to build on'],
  },
  {
    id: 'partner', title: 'Embedded UI partner', span: 'Monthly',
    lead: 'A UI team member through production.',
    body: 'Ongoing design and implementation alongside your team, from pre-production through launch and live updates.',
    outputs: ['Design, motion and implementation', 'Working in your tools and sprints', 'Source, docs and handover included'],
  },
];

export const faqs = [
  ['Do you only work on games?', 'No. Games are the deepest part of the portfolio, and the same team designs and builds web and desktop apps, websites and training products. The work on this page includes a writing tool, a property application and a set of training games.'],
  ['Do you design, implement, or both?', 'Both, and they work best together. We can also take either half: implement another designer’s work, or hand a specified design system to your engineers.'],
  ['Which engines and platforms do you work in?', 'Unreal Engine, Unity, Godot, PlayCanvas, and the web: React and TypeScript apps, sites and custom engines. The design system and motion spec stay the same; the implementation follows each engine’s own UI framework.'],
  ['Can you work inside our repository and pipeline?', 'Yes. Git or Perforce, your branching model, your review process. UI work arrives as commits and pull requests, not as a zip file.'],
  ['Who does the work?', 'Guillaume “Remi” Couture, the studio’s founder, leads every project and does the UI work directly. Everyone calls him Remi. Larger scopes add engineers, artists and production under his lead.'],
  ['What do you need to give a quote?', 'Your engine or stack and target platforms, the stage the product is at, the screens or flows in question, and your timing. A build or a few screenshots help.'],
  ['Are the studio credits Strategic Sloth projects?', 'No. They are Remi’s own credits from two decades of studio roles and agency work, shown with the studio and role for each. Strategic Sloth is the studio he founded to offer that experience directly.'],
];

// Two rows of screens from the ten UI collections. Concept studies, not released games.
const shot = (slug: string, file: string, label: string) => ({ slug, label, src: `/images/game-ui/${slug}/${file}.webp` });
export const conceptRows = [
  [shot('neon-breach', '07-fps', 'Neon Breach · FPS HUD'), shot('fantasy-adventurer', '06-hud', 'Fantasy Adventurer · HUD'), shot('orbital-command', '10-star-map', 'Orbital Command · Star map'), shot('havenworks', '05-build', 'Havenworks · Build mode'), shot('ashfall-outpost', '04-hud', 'Ashfall Outpost · HUD'), shot('duskbound-raiders', '07-combat', 'Duskbound Raiders · Combat'), shot('fieldline', '04-hud', 'Fieldline · HUD'), shot('brass-and-tide', '04-hud', 'Brass & Tide · HUD'), shot('clover-and-clay', '04-hud', 'Clover & Clay · HUD'), shot('modern-essentials', '14-hud', 'Modern Essentials · HUD')],
  [shot('neon-breach', '16-inventory', 'Neon Breach · Inventory'), shot('ashfall-outpost', '09-crafting', 'Ashfall Outpost · Crafting'), shot('orbital-command', '17-shop', 'Orbital Command · Shop'), shot('fantasy-adventurer', '08-world-map', 'Fantasy Adventurer · World map'), shot('duskbound-raiders', '09-skills', 'Duskbound Raiders · Skills'), shot('clover-and-clay', '08-shop-buy', 'Clover & Clay · Shop'), shot('neon-breach', '10-tactical-map', 'Neon Breach · Tactical map'), shot('modern-essentials', '11-inventory', 'Modern Essentials · Inventory'), shot('brass-and-tide', '10-inventory', 'Brass & Tide · Inventory'), shot('fieldline', '10-map', 'Fieldline · Map')],
  [shot('orbital-command', '06-ship', 'Orbital Command · Ship'), shot('brass-and-tide', '08-chart', 'Brass & Tide · Sea chart'), shot('duskbound-raiders', '08-boss', 'Duskbound Raiders · Boss'), shot('havenworks', '12-economy', 'Havenworks · Economy'), shot('fieldline', '06-loadout', 'Fieldline · Loadout'), shot('fantasy-adventurer', '03-inventory', 'Fantasy Adventurer · Inventory'), shot('clover-and-clay', '10-crops', 'Clover & Clay · Crops'), shot('ashfall-outpost', '12-base', 'Ashfall Outpost · Base'), shot('modern-essentials', '16-map', 'Modern Essentials · Map'), shot('neon-breach', '05-gunsmith', 'Neon Breach · Gunsmith')],
];

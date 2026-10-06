import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ENTRIES, ORDER } from './registry';

// One lazy wrapper per component, so each one is fetched the first time it is opened.
const LAZY = Object.fromEntries(ORDER.map(slug => [slug, lazy(() => ENTRIES[slug].load().then(Component => ({ default: Component })))]));

/** Opens the real SliceForge React UI component for any `[data-play="slug"]` button on the page. */
export default function ComponentPlayer() {
  const [slug, setSlug] = useState<string | null>(null);
  const [run, setRun] = useState(0); // bump to remount the component with its default state
  const [scale, setScale] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-play]');
      if (!button || !ENTRIES[button.dataset.play!]) return;
      setSlug(button.dataset.play!);
      setRun(n => n + 1);
    };
    document.addEventListener('click', onClick);
    document.documentElement.dataset.playerReady = 'true';
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (slug && !el.open) el.showModal();
    if (!slug && el.open) el.close();
  }, [slug]);

  // Components have fixed design sizes; shrink the whole thing to fit narrow stages.
  useLayoutEffect(() => {
    const box = stage.current, content = inner.current;
    if (!box || !content || !slug || ENTRIES[slug].fill) { setScale(1); return; }
    const fit = () => {
      const width = content.scrollWidth, height = content.scrollHeight;
      if (!width || !height) return;
      setScale(Math.min(1, (box.clientWidth - 32) / width, (box.clientHeight - 32) / height));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box); observer.observe(content);
    fit();
    return () => observer.disconnect();
  }, [slug, run]);

  const entry = slug ? ENTRIES[slug] : null;
  const Live = slug ? LAZY[slug] : null;
  const index = slug ? ORDER.indexOf(slug) : 0;
  const step = (by: number) => { setSlug(ORDER[(index + by + ORDER.length) % ORDER.length]); setRun(n => n + 1); };

  return (
    <dialog ref={dialog} className="cp" aria-label={entry ? `${entry.name}, live component` : 'Live component'} onClose={() => setSlug(null)} onClick={event => { if (event.target === dialog.current) setSlug(null); }}>
      {entry && Live && (
        <div className="cp-frame">
          <header className="cp-head">
            <div><p className="cp-kicker"><span className="cp-dot"/> Live component · {String(index + 1).padStart(2, '0')} / {ORDER.length}</p><h3>{entry.name}</h3><p className="cp-desc">{entry.description}</p></div>
            <button type="button" className="cp-close" onClick={() => setSlug(null)}>Close ✕</button>
          </header>
          <div ref={stage} className={`cp-stage${entry.fill ? ' is-fill' : ''}`} data-live-component={slug}>
            <div ref={inner} className="cp-inner" style={entry.fill ? undefined : { transform: `scale(${scale})` }}>
              <Suspense fallback={<p className="cp-loading">Loading component…</p>}>
                <Live key={`${slug}-${run}`} {...entry.props}/>
              </Suspense>
            </div>
          </div>
          <footer className="cp-foot">
            <button type="button" onClick={() => step(-1)}>← Previous</button>
            <button type="button" onClick={() => setRun(n => n + 1)}>Reset</button>
            <span>The real component, running with its default props. Click, drag and use the keys it shows.</span>
            <button type="button" onClick={() => step(1)}>Next →</button>
          </footer>
        </div>
      )}
    </dialog>
  );
}

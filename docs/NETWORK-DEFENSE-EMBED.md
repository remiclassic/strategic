# Keep Finance Online: network defense example

The playable section at `/training#minigame-example` uses a static build of
`C:\Users\Remi Couture\Ares Games`. Source remains in that project; the website
ships its compiled HTML, JavaScript, CSS, and sprites in
`public/training/games/network-defense/`.

To refresh the example, run from the game project:

```powershell
npm run build -- --outDir 'C:/Users/Remi Couture/Projects/strategicsloth-hub/website/public/training/games/network-defense'
```

Then run `npm run build` in the website repository. Vite's relative base keeps
scripts and sprite paths under the game directory. No separate game server is needed.

The example loads on demand when Play is selected. It retains the prototype's
mock course entry, learning checkpoints, score, replay, and debrief. The page
handles the game's study/mission navigation messages only from its own iframe
and origin. Completion remains in the game's local browser storage; the website
does not send it to a training backend.

The original game README credits Blender-rendered sprites and the seeded RNG
adaptation to GridWatch: Signal Breach, reused with the owner's go-ahead:
https://github.com/remeadows/gridwatch-signal-breach . Educational rules are from
the Ares prototype and still await SME review and learner playtesting.

---
title: Quantum Mechanics in Frontend Development — The Bug That Vanishes as Soon as You Open F12
date: 2025-06-08 01:22:13
sticky:
index_img: https://static.031130.xyz/uploads/2025/06/08/2798756067653.webp
tags:
- Web
- HTML
- CSS
- JavaScript
- Debug
---

## First Observation of the Frontend "Quantum State" Phenomenon

This story sounds bizarre—even surreal. Half a month ago, while happily coding at my desk (with hotpot and songs in the background 🍲🎤), I stumbled upon a truly uncanny bug. As a bona fide human software engineer, writing bugs is normal—but this one defied all intuition: the moment I opened DevTools (F12) to inspect the relevant DOM structure, the bug *vanished*. Close DevTools, hit Ctrl+F5 to hard-refresh, and *bam*—the bug reappeared.

Below is a live demo embedded via `<iframe>`:
[demo](https://static.031130.xyz/demo/scroll-jump-bug.html)

<iframe src="https://static.031130.xyz/demo/scroll-jump-bug.html" width="100%" height="500" allowfullscreen loading="lazy"></iframe>

![“How to Observe” Guide](https://static.031130.xyz/uploads/2025/06/08/65620d31fce6f.webp)

This bug left me utterly bewildered. I’m no physicist—why did **observer effect** from quantum mechanics show up in my frontend code?! 🤯

> **Observer effect**: the act of *observation* inevitably influences the phenomenon being observed.
>
> In quantum experiments—for example, to measure an electron’s velocity—you might fire two photons at it over a time interval. But the first photon already disturbs the electron’s motion, making the original velocity impossible to determine (Heisenberg’s uncertainty principle). Similarly, rapidly observing a decaying particle can apparently slow its decay rate.
>
> — Wikipedia

## Quantum Fog ❌ → Browser Mechanics ✅

Let’s briefly examine the problematic code snippet from the demo:

```javascript
if (scrollIndex >= groupLength) {
  setTimeout(() => {
    wrapper.style.transition = "none";
    scrollIndex = 0;
    wrapper.style.transform = `translateY(-${scrollIndex * itemHeight}px)`;

    requestAnimationFrame(() => {
      wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
    });
  }, 500);
}
```

The requirement was to implement an *infinite vertical scrolling* title list. Three titles are shown at a time; every 2 seconds, the list scrolls up as a group—the top item exits view, and a new item enters from below (again, the demo clarifies this visually).

When reaching the bottom, we disable CSS transitions, instantly relocate (`transform`) the wrapper back to the “top” of the logical loop (i.e., visually reset to the same three titles), then re-enable transitions—creating a seamless infinite loop illusion.

But here’s the twist: even though we explicitly set `transition: none`, the jump *still exhibited a transition animation*.

Frankly, this was the most despair-inducing bug in my short dev career. Not only was the behavior seemingly supernatural, but searching online felt hopeless—I didn’t even know how to phrase the issue!

![This is Xiao Maicha, the senior who got me into frontend development](https://static.031130.xyz/uploads/2025/06/08/475a61b332454.webp)

Out of desperation, I fed the code to ChatGPT-4o—and got a lifeline:

> The phenomenon you describe — “**a jarring upward jump on the 9th scroll**, which **disappears when DevTools is open**” — is almost certainly due to **frame skipping** (frame rate fluctuations) or **timer precision issues** in the browser’s rendering pipeline.
>
> Such bugs commonly arise when combining `setInterval`-driven animation with improperly timed style switches (e.g., `transition` toggles), causing *transition frame skips*. Opening DevTools often **forces frame redraws** or **increases timer resolution**, thereby masking the issue.

## Great News: `requestAnimationFrame` to the Rescue! 🎉

> **`window.requestAnimationFrame()`** tells the browser you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
>
> — MDN

Here’s the fix suggested by GPT—simple yet highly effective:

```diff
if (scrollIndex >= groupLength) {
  setTimeout(() => {
    wrapper.style.transition = "none";
    scrollIndex = 0;
    wrapper.style.transform = `translateY(-${scrollIndex * itemHeight}px)`;

    requestAnimationFrame(() => {
+     requestAnimationFrame(() => {
        wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
+     });
    });
  }, 500);
}
```

If nested `requestAnimationFrame` calls feel confusing, here’s an equivalent—but clearer—version:

```javascript
if (scrollIndex >= groupLength) {
  setTimeout(() => {
    scrollIndex = 0;

    requestAnimationFrame(() => {
      // Frame 1: Apply instant jump (no transition)
      wrapper.style.transition = "none";
      wrapper.style.transform = `translateY(-${scrollIndex * itemHeight}px)`;

      // Enqueue next frame
      requestAnimationFrame(() => {
        // Frame 2: Re-enable smooth transition
        wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
      });
    });
  }, 500);
}
```

The core idea: we must *guarantee* that setting the new `transform` (the “teleport”) and re-enabling `transition` happen in *separate animation frames*. Two nested `requestAnimationFrame` calls ensure exactly that.

<iframe src="https://static.031130.xyz/demo/scroll-jump-bug-fixed.html" width="100%" height="500" allowfullscreen loading="lazy"></iframe>

## Taming the Quantum State: A New Skill for Frontend Developers

With double `requestAnimationFrame`, we’ve successfully tamed this “quantum” bug. Now, regardless of whether DevTools is open, the animation behaves consistently—no more vanishing acts.

So it turns out: in frontend development, we need not just JavaScript expertise—~~but perhaps a dash of quantum mechanics, too~~. 😉
Next time you encounter a bug that “collapses upon observation”, try this **“quantum entanglement solution”**: double `requestAnimationFrame`—it might just decohere your bug from a probabilistic “quantum state” into a deterministic “classical state”.

And if you’ve battled even weirder bugs—please share! After all, in the universe of code, we never know what exotic form the next bug will take. Perhaps, that’s precisely where the *fun* of programming lies. 🐛✨

> *This article was co-authored with assistance from ChatGPT and DeepSeek—but the bug? Sadly, 100% real (and tearful).*

## See Also
- [Observer Effect — Wikipedia](https://en.wikipedia.org/wiki/Observer_effect_(physics))
- [`Window.requestAnimationFrame()` — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [A Deep Dive into Web Page Performance — Ruan Yifeng’s Blog](https://www.ruanyifeng.com/blog/2015/09/web-page-performance-in-depth.html)"

---
title: How to Copy Text to Clipboard with JavaScript in 2025
date: 2025-04-21 19:48:05
sticky:
tags:
- JavaScript
---

## Fundamental Principles

If you try searching for this article's title on a search engine, the articles you find will likely suggest using the following two APIs. ~~I hope your search engine isn't so outdated that it's still recommending Flash-based ZeroClipboard solutions in 2025~~

### [document.execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)

2012 brought us not only the supposed end of the world, but also IE 10. With IE 10's release on September 4th of that year, the execCommand family welcomed two new members—the copy/cut commands (this claim comes from [Chrome's blog](https://developer.chrome.com/blog/cut-and-copy-commands), while [MDN believes IE 9 already supported it](https://web.archive.org/web/20160315042044/https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)). Three years later, when Google Chrome version 42 (released April 14, 2015) added support for execCommand's copy/cut, more and more browser vendors began implementing this standard. Finally, with Safari 10 on iOS released on September 13, 2016, web developers at last obtained the first non-Flash JavaScript solution for copying to clipboard in history.

When document.execCommand's first parameter is "copy", it can copy user-selected text to the clipboard. Based on this API implementation, someone quickly developed what became the most common JavaScript implementation on the web today—first create an invisible DOM element, use JavaScript to simulate user text selection, and call execCommand('copy') to copy the text to the user's clipboard. The rough code implementation is as follows:

```javascript
// From the article "Pitfalls and Complete Solution for JS Copy Text to Clipboard", with a link at the end of this article

const textArea = document.createElement("textArea");
textArea.value = val;
textArea.style.width = 0;
textArea.style.position = "fixed";
textArea.style.left = "-999px";
textArea.style.top = "10px";
textArea.setAttribute("readonly", "readonly");
document.body.appendChild(textArea);

textArea.select();
document.execCommand("copy");
document.body.removeChild(textArea);
```

Although **this API has long been deprecated by W3C** and is marked as Deprecated on MDN, it remains the most common solution in the market. While writing this article, I examined MDN's English original page on archive.org and its change history on Github. This API was first marked as Obsolete in [January-February 2020](https://web.archive.org/web/20200221235207/https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand), then first marked as Deprecated in [January 2021](https://github.com/mdn/content/commit/0c31e2bc4d6601a079bc57521e79529539c8cf68#diff-85ef9d1e72565f0ae2ffd8199d10b34c11c615aec5d116057ac2a33c21cc072f), with a red background color warning developers that the API **may stop working at any time**. However, as of this article's publication, all commonly used browsers still maintain compatibility with this API, at least for the copy command.

This API has been widely used on so many sites that removing support for it would cause massive site failures. I believe all browser engines likely have no motivation in the short term to remove this API at the cost of losing compatibility. This means that this (seemingly bizarre) workaround of creating an invisible DOM to replace user text selection and executing execCommand to copy to the user's clipboard has left a significant mark in the history of frontend development.

### [Clipboard.writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)

As native JavaScript was gradually enhanced, developers finally completed the Clipboard piece of the puzzle. On April 17, 2018, Chrome 66 took the first step; on October 23 of the same year, Firefox followed with the Clipboard API implementation. Finally, on March 24, 2020, with Apple's Safari 13.4 belatedly joining, frontend developers could finally breathe a sigh of relief, once again obtaining a copying solution that works across mainstream browsers.

**So if execCommand already achieved pure JavaScript text copying to clipboard, why do we still need the Clipboard API? Or rather, what advantages does this deliberately implemented Clipboard API actually have?**

1. The traditional execCommand solution typically requires creating a temporary invisible DOM, placing text, selecting text with JS, and executing the copy command. Setting aside how inelegant this hacky approach is when writing code, the operation of using JS to select text modifies the user's current text selection state, sometimes leading to decreased user experience.
2. The Clipboard API is asynchronous, meaning it won't block the main thread when copying large amounts of text.
3. The Clipboard API provides more capabilities, such as `write()` and `read()` allowing reading and writing more complex data to the clipboard, like rich text or images.
4. The Clipboard API has more modern, explicit permission controls—write operations need to be called by active user actions, while read operations require users to explicitly grant permission in the browser UI. These permission controls give users greater control, so when execCommand exits the historical stage, web security will be further improved.

However, at the current stage, `Clipboard.writeText()` may not solve all problems. Setting aside old browser compatibility issues, `navigator.clipboard` **is only available on pages accessed via HTTPS** (or localhost). If your project is deployed on a LAN and you try to access it directly via 192.18.1.x IP + port, then `navigator.clipboard` will be in an `undefined` state.

![](https://static.031130.xyz/uploads/2025/04/19/3437b1c022853.webp)

Additionally, **Android native WebView** has the problem of **not being able to use** the Clipboard API because the Permissions API isn't implemented.

For these reasons, many websites now prioritize trying to use `navigator.clipboard.writeText()`, then fall back to using `execCommand('copy')` if that fails. The rough code implementation is as follows:

```javascript
// From the article "Pitfalls and Complete Solution for JS Copy Text to Clipboard", with a link at the end of this article

const copyText = async val => {
  if (navigator.clipboard && navigator.permissions) {
    await navigator.clipboard.writeText(val);
  } else {
    const textArea = document.createElement("textArea");
    textArea.value = val;
    textArea.style.width = 0;
    textArea.style.position = "fixed";
    textArea.style.left = "-999px";
    textArea.style.top = "10px";
    textArea.setAttribute("readonly", "readonly");
    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};
```

### ~~Flash Solution ([ZeroClipboard](https://github.com/zeroclipboard/zeroclipboard))~~

Actually, the two APIs above pretty much cover the fundamental principles, but while researching, I discovered that before the execCommand solution, the frontend mostly relied on Flash to implement copying text to clipboard. How could I not mention this?

Currently, the oldest tag that can be found in the ZeroClipboard Github repository is [v1.0.7](https://github.com/zeroclipboard/zeroclipboard/releases/tag/v1.0.7), released on June 9, 2012. I bet this project wasn't the first to implement copying text to clipboard through Flash. Someone must have implemented this functionality using Flash before, just not open-sourced as a separate library.

ZeroClipboard worked by creating a transparent Flash Movie overlaying the trigger button. When users clicked the button, they actually clicked on the Flash Movie. JavaScript then communicated with the Flash Movie through `ExternalInterface`, passing the text to be copied to Flash, which then wrote the text to the user's clipboard via Flash's API.

In that era's context, this was the only solution that could implement cross-browser text copying to clipboard (although not every computer had Flash installed, and iOS didn't support Flash). The 6.6k star Github repository witnessed that chaotic era when each browser held onto its own private APIs, ultimately falling along with Flash as the execCommand solution rose.

### Other Imperfect Solutions

#### window.clipboardData.setData

This API was mainly used around 2000-2010 and only worked in IE browsers. Firefox didn't support pure JavaScript copying to browser during this period; Chrome's first version wasn't released until 2008 and hadn't yet become mainstream.

```javascript
window.clipboardData.setData("Text", text2copy);
```

#### Giving Up (prompt)

Call a prompt popup to let users copy themselves.

```javascript
prompt('Press Ctrl + C, then Enter to copy to clipboard','copy me')
```

![](https://static.031130.xyz/uploads/2025/04/19/7f5310ca03c80.webp)

## Third-Party Library Wrappers

Since the execCommand solution is too abstract and not elegant enough, we have some ready-made third-party libraries that wrap the clipboard copying code.

### [clipboard.js](https://github.com/zenorocha/clipboard.js/)

clipboard.js is the most renowned third-party library, with 34.1k stars on Github as of this article's completion. The earliest tag version was released on October 28, 2015, one month after Firefox supported execCommand and all three major PC browsers achieved full compatibility.

clipboard.js [only uses execCommand](https://github.com/zenorocha/clipboard.js/blob/master/src/common/command.js) to implement clipboard copying. The project owner expects developers to use `ClipboardJS.isSupported()` to determine whether the user's browser supports the execCommand solution, and arrange success/failure actions based on the command execution's return value.

However, what I find strange is that clipboard.js requires developers to pass a DOM selector (or HTML element/element list) when instantiating. It must have an actual HTML element to set event listeners to trigger the copy operation, rather than providing a JavaScript function for developers to call—although this isn't a limitation from execCommand. Example as follows:

```html
<!-- Target -->
<input id="foo" value="text2copy" />

<!-- Trigger -->
<button class="btn" data-clipboard-target="#foo"></button>

<script>
	new ClipboardJS('.btn');
</script>
```

Yes, just one line of JavaScript can add listeners to all DOMs with the btn class. Perhaps this is why this repository got 34.1k stars. In 2015, when most people were still writing frontends with vanilla HTML/CSS/JS, clipboard.js could reduce code volume without requiring developers to set up listeners themselves.

clipboard.js also provides many advanced options to meet different developers' needs, such as allowing you to pass a function to get the text you need users to copy, or use Event listeners to provide feedback on whether copying succeeded. In short, the flexibility is sufficient.

### [copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard)

Another third-party library [using execCommand](https://github.com/sudodoki/copy-to-clipboard/blob/main/index.js#L79), though with only 1.3k stars. The first tag version was released on May 24, 2015, even earlier than clipboard.js. Compared to clipboard.js, copy-to-clipboard doesn't depend on HTML elements and can be called directly in JavaScript, which I personally prefer. In modern frontend frameworks like Vue/React, we generally don't directly manipulate the DOM, so clipboard.js isn't very suitable, but this copy-to-clipboard works well. Additionally, besides the execCommand solution, copy-to-clipboard specifically adapts the `window.clipboardData.setData` solution for older IE browsers, and calls a prompt window to let users copy manually as a final fallback when both fail.

Example as follows:

```javascript
import copy from 'copy-to-clipboard';

copy('Text');
```

Compared to clipboard.js, the usage approach is more intuitive, but unfortunately it was born at the wrong time and isn't as famous as clipboard.js (naming might also be a factor).

### [VueUse - useClipboard](https://vueuse.org/core/useClipboard/)

VueUse's implementation of useClipboard is the one I'm most satisfied with. useClipboard fully considers browser compatibility, **prioritizing `navigator.clipboard.writeText()`** when conditions for using navigator.clipboard are met, then **falling back to execCommand-implemented legacyCopy** when navigator.clipboard isn't supported or `navigator.clipboard.writeText()` fails. It also leverages Vue3's Composables to implement a copied variable that automatically resets to its initial state after 1.5 seconds, which is quite thoughtful.

```vue
const { text, copy, copied, isSupported } = useClipboard({ source })
</script>

<template>
  <div v-if="isSupported">
    <button @click="copy(source)">
      <!-- by default, `copied` will be reset in 1.5s -->
      <span v-if="!copied">Copy</span>
      <span v-else>Copied!</span>
    </button>
    <p>Current copied: <code>{{ text || 'none' }}</code></p>
  </div>
  <p v-else>
    Your browser does not support Clipboard API
  </p>
</template>
```

### React-Related Ecosystem

Unlike Vue's VueUse dominating the scene, React has many available hooks libraries, so let's go through them all.

#### [react-use - useCopyToClipboard](https://github.com/streamich/react-use)

react-use is the largest React Hooks library I could find, with 42.9k stars. The copying solution directly depends on [copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard) mentioned above, which is the execCommand solution.

```jsx
const Demo = () => {
  const [text, setText] = React.useState('');
  const [state, copyToClipboard] = useCopyToClipboard();

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button type="button" onClick={() => copyToClipboard(text)}>copy text</button>
      {state.error
        ? <p>Unable to copy value: {state.error.message}</p>
        : state.value && <p>Copied {state.value}</p>}
    </div>
  )
}
```

#### [Ant Design - Typography](https://ant.design/components/typography#typography-demo-copyable)

ahooks was the first React hooks library mentioned to me. It's maintained by the Ant Design team. However, it doesn't have clipboard encapsulation in the repository, so I looked into Ant Design's Typography implementation of copying capability. Like react-use above, it directly uses [copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard), which is the execCommand solution.

#### [usehooks - useCopyToClipboard](https://usehooks.com/usecopytoclipboard)

I learned about this library from an LLM, and it now has 10.5k stars. What's quite absurd is that all its logic code is implemented in a single file called index.js, which is truly baffling. It first attempts to write using `navigator.clipboard.writeText()`, then switches to the execCommand solution if that fails. The hooks usage is similar to react-use above.

#### [usehooks-ts - useCopyToClipboard](https://usehooks-ts.com/react-hook/use-copy-to-clipboard)

I wonder if this library was created to solve the lack of TypeScript support in the above one. It only uses `navigator.clipboard.writeText()` to attempt writing to the clipboard, and directly logs a `console.warn` error if it fails, with no fallback solution.

## Conclusion

From a results perspective, VueUse's encapsulation is undoubtedly the most satisfying to me. It prioritizes trying the best-performing Clipboard API, then falls back to execCommand, while providing multiple reactive variables to assist development, but doesn't presumptuously use prompt as a guarantee, maximizing the operational space left to developers.

Looking back from the vantage point of 2025, the evolution trajectory of frontend clipboard operation technology is clearly visible: from early fragile Flash-dependent solutions, to execCommand's workaround, and finally moving toward the elegant implementation of standardized Clipboard API. This journey is not only a microcosm of technological iteration, but also reflects the unique "art of compromise" in frontend development.

For a long time to come, we may still be finding balance between "elegant implementation" and "backward compatibility," dancing ballet in shackles within the browser sandbox. But those temporary solutions born for compatibility will eventually become precious footnotes witnessing the evolution of frontend history.

## References

- [Pitfalls and Complete Solution for JS Copy Text to Clipboard](https://liruifengv.com/posts/copy-text/)
- [ZeroClipboard Study Notes | Jiongks](https://jiongks.name/blog/zeroclipboard-intro)
- [Cut and copy commands | Blog | Chrome for Developers](https://developer.chrome.com/blog/cut-and-copy-commands)
- [execCommand method (Internet Explorer) | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms536419(v=vs.85))
- [sudodoki/copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard)
- [zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js/)
- [useClipboard | VueUse](https://vueuse.org/core/useClipboard/)
- [Side-effects / useCopyToClipboard - Docs ⋅ Storybook](https://streamich.github.io/react-use/?path=/story/side-effects-usecopytoclipboard--docs)
- [document.execCommand - Web API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)
- [Clipboard.writeText() - Web API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- [Onclick Select All and Copy to Clipboard? - JavaScript - SitePoint Forums | Web Development & Design Community](https://www.sitepoint.com/community/t/onclick-select-all-and-copy-to-clipboard/3837/2)
- [How would I implement 'copy url to clipboard' from a link or button using javascript or dojo without flash - Stack Overflow](https://stackoverflow.com/questions/16526814/how-would-i-implement-copy-url-to-clipboard-from-a-link-or-button-using-javasc)

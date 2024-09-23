const url = window.location.href
if (
  !url.includes('zhul.in') &&
  !url.includes('localhost') &&
  !url.includes('127.0.0.1')
) {
  document.body.innerHTML = [
    '<div style="margin: auto;">',
    '<h1>当前页面并非本文作者的主页，将在五秒后跳转。</h1>',
    '<br />',
    '<h1>请此站点持有者联系我: zhullyb@outlook.com</h1>',
    '</div>',
  ].join('')
  document.body.style = [
    'background-color: white;',
    'color: black;',
    'text-align: center;',
    'font-size: 50px;',
    'width: 100vw;',
    'height: 100vh;',
    'display: flex;',
  ].join('')
  window.location.href = 'https://zhul.in'
} else {

  (window => {
    const {
      screen: { width, height },
      navigator: { language },
      location,
      localStorage,
      document,
      history,
    } = window;
    const { hostname, pathname, search } = location;
    const { currentScript } = document;

    if (!currentScript) return;

    const _data = 'data-';
    const _false = 'false';
    const attr = currentScript.getAttribute.bind(currentScript);
    const website = attr(_data + 'website-id');
    const hostUrl = attr(_data + 'host-url');
    const autoTrack = attr(_data + 'auto-track') !== _false;
    const dnt = attr(_data + 'do-not-track');
    const domain = attr(_data + 'domains') || '';
    const domains = domain.split(',').map(n => n.trim());
    const root = 'https://umami.zhul.in'
    const endpoint = `${root}/api/send`;
    const screen = `${width}x${height}`;
    const eventRegex = /data-umami-event-([\w-_]+)/;
    const eventNameAttribute = _data + 'umami-event';
    const delayDuration = 300;

    /* Helper functions */

    const hook = (_this, method, callback) => {
      const orig = _this[method];

      return (...args) => {
        callback.apply(null, args);

        return orig.apply(_this, args);
      };
    };

    const getPath = url => {
      try {
        return new URL(url).pathname;
      } catch (e) {
        return url;
      }
    };

    const getPayload = () => ({
      website,
      hostname,
      screen,
      language,
      title,
      url: currentUrl,
      referrer: currentRef,
    });

    /* Tracking functions */

    const doNotTrack = () => {
      const { doNotTrack, navigator, external } = window;

      const msTrackProtection = 'msTrackingProtectionEnabled';
      const msTracking = () => {
        return external && msTrackProtection in external && external[msTrackProtection]();
      };

      const dnt = doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || msTracking();

      return dnt == '1' || dnt === 'yes';
    };

    const trackingDisabled = () =>
      (localStorage && localStorage.getItem('umami.disabled')) ||
      (dnt && doNotTrack()) ||
      (domain && !domains.includes(hostname));

    const handlePush = (state, title, url) => {
      if (!url) return;

      currentRef = currentUrl;
      currentUrl = getPath(url.toString());

      if (currentUrl !== currentRef) {
        setTimeout(track, delayDuration);
      }
    };

    const handleClick = () => {
      const trackElement = el => {
        const attr = el.getAttribute.bind(el);
        const eventName = attr(eventNameAttribute);

        if (eventName) {
          const eventData = {};

          el.getAttributeNames().forEach(name => {
            const match = name.match(eventRegex);

            if (match) {
              eventData[match[1]] = attr(name);
            }
          });

          return track(eventName, eventData);
        }
        return Promise.resolve();
      };

      const callback = e => {
        const findATagParent = (rootElem, maxSearchDepth) => {
          let currentElement = rootElem;
          for (let i = 0; i < maxSearchDepth; i++) {
            if (currentElement.tagName === 'A') {
              return currentElement;
            }
            currentElement = currentElement.parentElement;
            if (!currentElement) {
              return null;
            }
          }
          return null;
        };

        const el = e.target;
        const anchor = el.tagName === 'A' ? el : findATagParent(el, 10);

        if (anchor) {
          const { href, target } = anchor;
          const external =
            target === '_blank' ||
            e.ctrlKey ||
            e.shiftKey ||
            e.metaKey ||
            (e.button && e.button === 1);
          const eventName = anchor.getAttribute(eventNameAttribute);

          if (eventName && href) {
            if (!external) {
              e.preventDefault();
            }
            return trackElement(anchor).then(() => {
              if (!external) location.href = href;
            });
          }
        } else {
          trackElement(el);
        }
      };

      document.addEventListener('click', callback, true);
    };

    const observeTitle = () => {
      const callback = ([entry]) => {
        title = entry && entry.target ? entry.target.text : undefined;
      };

      const observer = new MutationObserver(callback);

      const node = document.querySelector('head > title');

      if (node) {
        observer.observe(node, {
          subtree: true,
          characterData: true,
          childList: true,
        });
      }
    };

    const send = (payload, type = 'event') => {
      if (trackingDisabled()) return;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (typeof cache !== 'undefined') {
        headers['x-umami-cache'] = cache;
      }
      return fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ type, payload }),
        headers,
      })
        .then(res => res.text())
        .then(text => (cache = text))
        .catch(() => { }); // no-op, gulp error
    };

    const track = (obj, data) => {
      if (typeof obj === 'string') {
        return send({
          ...getPayload(),
          name: obj,
          data: typeof data === 'object' ? data : undefined,
        });
      } else if (typeof obj === 'object') {
        return send(obj);
      } else if (typeof obj === 'function') {
        return send(obj(getPayload()));
      }
      return send(getPayload());
    };

    const identify = data => send({ ...getPayload(), data }, 'identify');

    /* Start */

    if (!window.umami) {
      window.umami = {
        track,
        identify,
      };
    }

    let currentUrl = `${pathname}${search}`;
    let currentRef = document.referrer;
    let title = document.title;
    let cache;
    let initialized;

    if (autoTrack && !trackingDisabled()) {
      history.pushState = hook(history, 'pushState', handlePush);
      history.replaceState = hook(history, 'replaceState', handlePush);
      handleClick();
      observeTitle();

      const init = () => {
        if (document.readyState === 'complete' && !initialized) {
          track();
          initialized = true;
        }
      };

      document.addEventListener('readystatechange', init, true);

      init();
    }
  })(window);
}

const backgrounds = [
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f373292129a.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3732b562d8.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3732d6ebe2.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3732f6b225.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f37332b1c8b.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f37338661d8.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3733c35741.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3733deca7f.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f373406909e.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f373423b6c0.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f37343c5254.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f37345532e7.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f373479efcf.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3734a2de90.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3734bea5a7.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3734dc3404.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3734fe20d3.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f37351bae52.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f373539bd9f.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f37354f1ec7.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f373569f4ef.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f3735851795.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f37359a2c36.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/5fd959de5f180.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/1ef8787039f53.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/fb261297a3570.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f374ea7b242.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/62f374ec8c14d.webp",
  "https://cdn.zhullyb.top/uploads/2024/08/12/6609df9b83ecd.webp",
]

const banner = document.getElementById('banner')
banner.style.background = `url(${backgrounds[Math.floor(Math.random() * backgrounds.length)]}) center center / cover no-repeat`

// ==UserScript==
// @name         YoutubeMusicDiscordRichPresence2023SuperPuperShitCode
// @description  говнокод
// @namespace    https://github.com/oddyamill/YoutubeMusicDiscordRichPresence2023SuperPuperShitCode
// @author       oddyamill
// @match        *://music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=music.youtube.com
// @downloadURL  https://github.com/oddyamill/YoutubeMusicDiscordRichPresence2023SuperPuperShitCode/raw/master/src/tampermonkey.user.js
// @updateURL    https://github.com/oddyamill/YoutubeMusicDiscordRichPresence2023SuperPuperShitCode/raw/master/src/tampermonkey.user.js
// @version      0.0.1
// ==/UserScript==

(async function() {
  const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  const parse = time => {
    const [sec, min, hour] = time.split(':').map(t => +t).reverse();
    return (sec + min * 60 + (hour || 0) * 3600) * 1000;
  }

  await sleep(1000);

  const video = document.querySelector('video.video-stream');

  const listener = async () => {
    // чтобы прогрузилось?
    await sleep(1000);
    let body = {};

    if (!video.paused) {
      const [current, end] = document.querySelector('#left-controls > span').textContent.trim().split(' / ');

      body = {
        id: document.querySelector('a.ytp-title-link.yt-uix-sessionlink').href.match(/v=([^&#]{5,})/)?.[1],
        current: parse(current),
        end: parse(end),
      };

      const metadata = navigator.mediaSession.metadata;
      if (metadata !== null) {
        body.title = metadata.title;
        body.artist = metadata.artist;
        body.album = metadata.album || [...document.querySelectorAll('.byline a')].at(-1)?.textContent || undefined;
        body.artwork = metadata.artwork.at(-1)?.src;
      }
    }

    return fetch('http://localhost:32484/', {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    });
  }

  video.addEventListener('playing', listener);
  video.addEventListener('pause', listener);

  if (video.src) {
    listener();
  }
})();
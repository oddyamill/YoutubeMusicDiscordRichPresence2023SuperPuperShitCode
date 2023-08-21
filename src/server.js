import { STATUS_CODES, createServer } from 'http';
import { port, ytMusicUrl } from './constants.js';
import { client } from './client.js';

createServer(async (request, response) => {
  const write = code => response.writeHead(code).end(STATUS_CODES[code]);

  if (request.url !== '/') {
    return write(404)
  }

  if (request.method !== 'POST') {
    return write(405);
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks));

  // если есть id значит обновление активности !
  if ('id' in body) {
    const timestamp = Date.now();
    const startTimestamp = timestamp - body.current;
  
    await client.setActivity({
      details: body.title,
      state: body.artist,
      largeImageKey: body.artwork,
      largeImageText: body.album,
      startTimestamp,
      endTimestamp: startTimestamp + body.end,
      buttons: [{
        label: 'Слушать',
        url: ytMusicUrl + body.id, 
      }],
    });

    return write(201);
  }

  await client.clearActivity();
  return write(200);
}).listen(port, () => console.log('пуск'));

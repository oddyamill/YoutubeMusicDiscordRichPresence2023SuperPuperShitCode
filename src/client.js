import { Client } from 'discord-rpc';
import { clientId } from './constants.js';

const client = new Client({ transport: 'ipc' });
await client.login({ clientId: clientId });

export { client };
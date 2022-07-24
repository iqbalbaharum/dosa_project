import { Fluence, KeyPair } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerIDosaLogService } from './_aqua/i-dosa-log';
import { DosaLogService } from './service/log-service';

const relay = krasnodar[0];
const skBytes = 'DbIYns8KclPLTSLZCdei9RkssJ46fbzqD4wfrfXjCu0=';

export async function runServer() {
    await Fluence.start({
        connectTo: relay,
        KeyPair: await KeyPair.fromEd25519SK(Buffer.from(skBytes, 'base64')),
    });

    registerIDosaLogService(new DosaLogService());

    console.log('application started');
    console.log('peer id is: ', Fluence.getStatus().peerId);
    console.log('relay address: ', relay.multiaddr);
    console.log('relay is: ', Fluence.getStatus().relayPeerId);
    console.log('press any key to quit...');
}

export async function justStop() {
    await Fluence.stop();
}

export async function waitForKeypressAndStop() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async () => {
        await Fluence.stop();
        process.exit(0);
    });
}

import { Fluence, KeyPair } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerIDosaMetadataService } from './_aqua/i-dosa-metadata';
import { DosaMetadataService } from './service/dosa-metadata-service';

const relay = krasnodar[0];
const skBytes = 'DbIYns8KclPLTSLZCdei9RkssJ46fbzqD4wfrfXjCu0=';

export async function runServer() {
    await Fluence.start({
        connectTo: relay,
        KeyPair: await KeyPair.fromEd25519SK(Buffer.from(skBytes, 'base64')),
    });

    registerIDosaMetadataService(new DosaMetadataService());

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

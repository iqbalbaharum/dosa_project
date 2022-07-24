import { Fluence, KeyPair } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerIDosaGameService } from './_aqua/i_dosa_game_service';
import { DosaGameService } from './service/dosa-game-service';

const relay = krasnodar[0];
const skBytes = '5iaBQAikDPqm9dSMYegqQxZpGJDJLiVn5BOF/7XfJPY=';

export async function runServer() {
    await Fluence.start({
        connectTo: relay,
        KeyPair: await KeyPair.fromEd25519SK(Buffer.from(skBytes, 'base64')),
    });

    registerIDosaGameService(new DosaGameService());

    console.log('application started');
    console.log('peer id is: ', Fluence.getStatus().peerId);
    console.log('relay address: ', relay.multiaddr);
    console.log('relay is: ', Fluence.getStatus().relayPeerId);
}
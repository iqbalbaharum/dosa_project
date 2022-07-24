import { Fluence, KeyPair } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerIDosaGameService } from './_aqua/i_dosa_game_service';
import { DosaGameService } from './service/dosa-game-service';

const relay = krasnodar[0];
const skBytes = 'OF/ysOa5oFCCoZ8iikFSeVde++VZ1rHXMh1Q1MBX8oI=';

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
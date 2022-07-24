import React, { useState } from 'react';
import logo from './logo.svg';
import './App.scss';

import phaserGame from './PhaserGame'
import HelloWorldScene from './scenes/HelloWorldScene'

import { Fluence } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { user_data } from './_aqua/getting-started';

function App() {
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const connect = async () => {
        try {
            await Fluence.start({ connectTo: krasnodar[0] });
            // Using aqua is as easy as calling a javascript funсtion
            const res = await user_data('c9ed1346a1549bdf946c1b369f4a3801bbbe2e367db8c228bcf5dd452791ca9d');
            console.log(res)
            setIsConnected(true);
            // Register handler for this call in aqua:
            // HelloPeer.hello(%init_peer_id%)
            // registerHelloPeer({
            //     hello: (from) => {
            //         setHelloMessage('Hello from: \n' + from);
            //         return 'Hello back to you, \n' + from;
            //     },
            // });
        } catch (err) {
            console.log('Peer initialization failed', err);
        }
    };

    connect()

    return (
        <div className="App">
        </div>
    );
}

export default App;

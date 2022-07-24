import Phaser from 'phaser'

import { SceneKeys } from './consts/SceneKeys'
import registerScenes from './registerScenes'


declare global {
	// tslint:disable-next-line
	interface Window {
		ethereum: any;
		web3: any;
	}
}


const config = {
	type: Phaser.AUTO,
	parent: 'phaser-container',
	dom: {
		createContainer: true
	},
	width: "100%",
	height: "100%",
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		}
	}
}

const game = new Phaser.Game(config)

registerScenes(game)

game.scene.start(SceneKeys.TitleScreen)

export default game

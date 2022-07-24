import Phaser from 'phaser'
import { Fluence } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerDosaGameService, user_data } from '../_aqua/game_oracle';

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super('helloworld')
  }

  preload() {
    this.load.setBaseURL('https://labs.phaser.io')

    this.load.image('logo', 'assets/sprites/phaser3-logo.png')
    this.load.image('red', 'assets/particles/red.png')
  }

  create() {
    this.createEmitter()

    this.startFluenceNetwork('c9ed1346a1549bdf946c1b369f4a3801bbbe2e367db8c228bcf5dd452791ca9d')
  }

  createEmitter() {
    const particles = this.add.particles('red')

    const emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
    })

    const logo = this.physics.add.image(400, 100, 'logo')

    logo.setVelocity(100, 200)
    logo.setBounce(1, 1)
    logo.setCollideWorldBounds(true)

    emitter.startFollow(logo)
  }

  private async startFluenceNetwork(id: string) {
		try {
			await Fluence.start({ connectTo: krasnodar[0] });
			console.log(await user_data(id))
		} catch(e) {
			console.log(e)
		}
	}
}

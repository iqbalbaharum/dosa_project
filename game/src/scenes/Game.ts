import Phaser, { Scene } from 'phaser'

import { SceneKeys } from '../consts/SceneKeys'
import { TextureKeys } from '../consts/GameKeys'
import { GameEvents } from '../consts/GameEvents'

import ProjectileModule from '../game/ProjectileModule'
import AsteroidField from '../game/AsteroidField'
import AsteroidPoolMap from '../game/AsteroidPoolMap'

import IProjectile from '../types/IProjectile'
import IAsteroid from '../types/IAsteroid'

import wrapBounds from '../utils/wrapBounds'

import { AsteroidSize } from '../game/AsteroidSize'

import '../game/AsteroidPool'
import '../game/PlayerShip'
import '../game/ProjectilePool'
import Multiplayer from './Multiplayer'
import Preload from './Preload'

export default class Game extends Phaser.Scene {
	private playerShip?: IPlayerShip
	private asteroidField?: AsteroidField

	private mapScale = 1.8

	create() {
		const origin = new Phaser.Geom.Point(
			this.scale.width * 0.5,
			this.scale.height * 0.5
		)

		let multiplayerScene = this.scene.get(SceneKeys.Multiplayer) as Multiplayer

		if (multiplayerScene) {
			multiplayerScene.socket.emit('join-room', {
				roomId: 'asteroids-room-1',
				userId: multiplayerScene.id,
			})
		}

		this.scene.run(SceneKeys.GameBackground)
		this.scene.sendToBack(SceneKeys.GameBackground)

		this.scene.run(SceneKeys.GameUI)

		const asteroidPoolMap = new AsteroidPoolMap()
		asteroidPoolMap.set(TextureKeys.AsteroidBig1, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Large))
		asteroidPoolMap.set(TextureKeys.AsteroidBig2, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Large))
		asteroidPoolMap.set(TextureKeys.AsteroidBig3, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Large))
		asteroidPoolMap.set(TextureKeys.AsteroidBig4, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Large))
		asteroidPoolMap.set(TextureKeys.AsteroidMedium1, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Medium))
		asteroidPoolMap.set(TextureKeys.AsteroidMedium2, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Medium))
		asteroidPoolMap.set(TextureKeys.AsteroidSmall1, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Small))
		asteroidPoolMap.set(TextureKeys.AsteroidSmall2, this.add.asteroidPool().setAsteroidSize(AsteroidSize.Small))

		this.asteroidField = new AsteroidField(asteroidPoolMap, this)
		this.asteroidField.create()

		let preloadScene = this.scene.get(SceneKeys.Preload) as Preload

		this.playerShip = this.add.playerShip(origin.x, origin.y, preloadScene?.texture?.ship?.key as any)
			.useScaledCollider(0.7)
			.setOrigin(0.5, 0.5)
			.setDepth(1000)

		const projectilePool = this.add.projectilePool()
		
		this.playerShip.setProjectileModule(
			new ProjectileModule(projectilePool, preloadScene?.texture?.laser?.key as any)
		)

		asteroidPoolMap.values.forEach(asteroidPool => {
			this.physics.add.collider(asteroidPool, this.playerShip!, this.asteroidHitPlayerShip, obj => obj.active, this)
			this.physics.add.collider(asteroidPool, projectilePool, this.laserHitAsteroid, obj => obj.active, this)
		})

		this.cameras.main.zoom = 0.6

	}

	update(t: number, dt: number) {
		this.updatePlayerShip(dt, this.scale.canvasBounds)

		if (this.asteroidField) {
			this.asteroidField.update(dt)
		}
	}

	private asteroidHitPlayerShip(asteroid: Phaser.GameObjects.GameObject) {
		if (!this.playerShip) {
			return

		}
		const x = this.playerShip.x
		const y = this.playerShip.y

		this.playerShip.destroy()
		this.playerShip = undefined

		let multiplayerScene = this.scene.get(SceneKeys.Multiplayer) as Multiplayer

		multiplayerScene.socket.emit('leave-room', {
			roomId: 'asteroids-room-1',
			userId: multiplayerScene.id,
		})

		const lifespan = 1000

		// explosion then go to gameover
		const particles = this.add.particles(TextureKeys.Particles1)
		particles.setDepth(2000)
		particles.createEmitter({
			speed: { min: -100, max: 100 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.3, end: 0 },
			blendMode: 'SCREEN',
			// tint: 0xff0000,
			lifespan
		})
			.explode(50, x, y)

		this.time.delayedCall(lifespan, () => {
			this.scene.stop(SceneKeys.GameBackground)
			this.scene.stop(SceneKeys.GameUI)
			this.scene.start(SceneKeys.GameOver)
		})
	}

	private laserHitAsteroid(asteroidGO: Phaser.GameObjects.GameObject, laser: Phaser.GameObjects.GameObject) {
		const projectile = (laser as IProjectile)
		const direction = projectile.physicsBody.newVelocity.clone().normalize()
		projectile.returnToPool()

		const asteroid = asteroidGO as IAsteroid

		this.asteroidField?.breakAsteroid(asteroid, direction)

		this.game.events.emit(GameEvents.AsteroidBroken, asteroid)
	}

	private updatePlayerShip(dt: number, bounds: Phaser.Geom.Rectangle) {
		if (!this.playerShip) {
			return
		}

		this.playerShip.update(dt)
		wrapBounds(this.playerShip, bounds)
	}
}

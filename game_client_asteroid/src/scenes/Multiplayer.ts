import Phaser, { Scene } from 'phaser'

import "regenerator-runtime/runtime";
import '~/game/AsteroidPool'
import '~/game/PlayerShip'
import '~/game/ProjectilePool'
import Peer, { DataConnection } from 'peerjs'
import { SceneKeys } from '~/consts/SceneKeys';
import { io } from 'socket.io-client';
import Preload from './Preload';
import ProjectileModule from '~/game/ProjectileModule';
import { v4 as uuidv4 } from 'uuid';

interface webRTCData {
	event: string,
	id: string,
	texture: {
		ship: { key: string, path: string },
		laser: { key: string, path: string }
	},
	position: { x: number, y: number },
	movement: {
		angle: number,
		left: boolean,
		right: boolean,
		up: boolean,
		fireKey: boolean
	}
}

export default class Multiplayer extends Phaser.Scene {

	private preloadScene: Preload
	private remoteConn: { [key: string]: DataConnection } = {};
	private otherShip: { [key: string]: IPlayerShip } = {};

	private peerId: string
	private peer: Peer
	private _socket: any

	private turnSpeed: number
	private acceleration: number
	private colliderRadius: number

	async create() {
		this.preloadScene = this.scene.get(SceneKeys.Preload) as Preload

		const DefaultAcceleration = 5
		const DefaultTurnSpeed = 2
		const DefaultColliderRadius = 50

		this.turnSpeed = DefaultTurnSpeed
		this.acceleration = DefaultAcceleration
		this.colliderRadius = DefaultColliderRadius

		this.peerId = uuidv4()

		this._socket = io(`${process.env.SOCKET_IO_SERVER_URL}`)

		this._socket.emit('join-room', {
			roomId: 'asteroids-room-1',
			userId: this.peerId,
		});

		this.peer = new Peer(`${this.peerId}`, {
			host: process.env.PEER_JS_SERVER_URL,
			port: parseInt(<string>process.env.PEER_JS_SERVER_PORT),
			path: process.env.PEER_JS_SERVER_PATH,
			secure: true
		});

		this._socket.on(`asteroids-room-1:user-join`, userId => {
			let conn = this.peer.connect(userId)
			this.remoteConn[`${userId}`] = conn

			const origin = new Phaser.Geom.Point(
				this.scale.width * 0.5,
				this.scale.height * 0.5
			)

			this.remoteConn[`${conn.peer}`].on('open', () => {
				this.remoteConn[`${conn.peer}`].send({
					event: 'NEW_PEER',
					id: this.peerId,
					texture: this.preloadScene.texture,
					position: { x: origin.x, y: origin.y },
				});
			});

			this.remoteConn[`${conn.peer}`].on('data', (data: any) => {
				this.webRTCEventSwitch(data);
			});
		})

		this._socket.on(`asteroids-room-1:user-leave`, (userId) => {

			if (this.otherShip[`${userId}`]) {
				this.otherShip[`${userId}`].destroy()
				delete this.otherShip[`${userId}`]
				this.remoteConn[`${userId}`].close();
			}
		});

		this.peer.on('connection', (conn) => {
			this.remoteConn[`${conn.peer}`] = conn;

			const origin = new Phaser.Geom.Point(
				this.scale.width * 0.5,
				this.scale.height * 0.5
			)

			this.remoteConn[`${conn.peer}`].on('open', () => {
				this.remoteConn[`${conn.peer}`].send({
					event: 'NEW_PEER',
					id: this.peerId,
					texture: this.preloadScene.texture,
					position: { x: origin.x, y: origin.y },
				});
			});

			this.remoteConn[`${conn.peer}`].on('data', (data: any) => {
				this.webRTCEventSwitch(data);
			});
		});

		window.onbeforeunload = () => {
			this.socket.emit('leave-room', {
				roomId: 'asteroids-room-1',
				userId: this.id,
			})
		}
	}

	private async webRTCEventSwitch(data: webRTCData) {
		switch (data.event) {
			case 'NEW_PEER':
				this.spawnOtherPlayer(data)
				break;
			case 'UPDATE_MOVEMENT':
				const angle = data.movement.angle
				if (data.movement.left) {
					this.otherShip[`${data.id}`].setAngle(angle - this.turnSpeed)
				}
				else if (data.movement.right) {
					this.otherShip[`${data.id}`].setAngle(angle + this.turnSpeed)
				}

				if (data.movement.up) {
					const dir = this.scene.scene.physics.velocityFromRotation(this.otherShip[`${data.id}`].rotation, 1)
					const vel = this.otherShip[`${data.id}`].body.velocity

					vel.x += dir.x * this.acceleration
					vel.y += dir.y * this.acceleration

					this.otherShip[`${data.id}`].setVelocity(vel.x, vel.y)
				}

				if (data.movement.fireKey) {
					this.otherShip[`${data.id}`].throttledFire()
				}
				break;


		}
	}

	get id() {
		return this.peerId
	}

	get socket() {
		return this._socket
	}

	broadcast(data: any) {
		for (const id of Object.keys(this.remoteConn)) {
			this.remoteConn[id].send(data);
		}
	}

	private spawnOtherPlayer(data: webRTCData) {
		new Promise((resolve) => {
			let loader = new Phaser.Loader.LoaderPlugin(this);
			loader.image(data.texture.bodyKey, data.texture.bodyPath);
			loader.image(data.texture.laserKey, data.texture.laserPath)

			loader.once(Phaser.Loader.Events.COMPLETE, () => {
				let gameScene = this.scene.get(SceneKeys.Game)
				this.otherShip[`${data.id}`] = gameScene.add.playerShip(data.position.x, data.position.y, data.texture.bodyKey)
					.useScaledCollider(0.7)
					.setOrigin(0.5, 0.5)
					.setDepth(1000)

				const projectilePool = gameScene.add.projectilePool()
				this.otherShip[`${data.id}`].setProjectileModule(
					new ProjectileModule(projectilePool, data.texture.laserKey)
				)

				resolve(true);
			});
			loader.start();
		});
	}
}

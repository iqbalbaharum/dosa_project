import Phaser from 'phaser'

import { GameEvents } from '~/consts/GameEvents'
import PointsService from '~/game/services/PointsService'
import IAsteroid from '~/types/IAsteroid'

let TEXT_BACKGROUND_COLOR = '#ffecd1'

export default class GameUI extends Phaser.Scene {
	private pointsService = new PointsService()

	private scoreLabel?: Phaser.GameObjects.Text
	private tokenAvailableLabel: Phaser.GameObjects.Text
	private currentLevel: Phaser.GameObjects.Text
	private levelUpButton: Phaser.GameObjects.Text

	private isNextLevel: boolean = false

	private lastIncrement: number = 500

	preload() {
		this.pointsService.reset()
	}

	async create() {
		const token = await this.GetToken()
		this.scoreLabel = this.add.text(10, 10, '')

		this.tokenAvailableLabel = this.add.text(this.scale.width - 200, 10, `${token.metadata.token.available}`)

		this.currentLevel = this.add.text(this.tokenAvailableLabel.x + 50, this.tokenAvailableLabel.y, `Level ${token.metadata.level.current}`)

		this.levelUpButton = this.add.text(this.currentLevel.x + 80, this.currentLevel.y, '+', {
			color: 'black',
			backgroundColor: TEXT_BACKGROUND_COLOR,
		})
			//@ts-ignore
			.setPadding(8, 4)
			.setVisible(this.isNextLevel)
			.setInteractive({ cursor: 'pointer' })
			.on('pointerdown', () => {
				this.levelUp()
			})

		this.isLevelUpAvailable(token)
		this.updatePoints()

		this.game.events.on(GameEvents.AsteroidBroken, (asteroid: IAsteroid) => {
			this.pointsService.addForAsteroid(asteroid)

			this.updatePoints()
		})

		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.game.events.off(GameEvents.AsteroidBroken)
		})
	}

	private async updatePoints() {
		if (!this.scoreLabel) return

		if (this.pointsService.total !== 0 && this.pointsService.total > this.lastIncrement) {
			await this.updateTokenAvailable()
			this.lastIncrement += 500
		}

		this.scoreLabel.text = `${this.pointsService.total}`
	}

	private async updateTokenAvailable() {
		try {
			let data = JSON.stringify({
				"asset_id": "c9ed1346a1549bdf946c1b369f4a3801bbbe2e367db8c228bcf5dd452791ca9d",
				"kill": 100
			})

			let list = await fetch(`http://3.110.115.64/dosa/point`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: data
			})

			let response = await list.json()

			const newTokenAvailable = response.metadata.token.available;
			this.tokenAvailableLabel.text = `${newTokenAvailable}`
			this.isLevelUpAvailable(response)
		} catch (e) {
			console.log(e);

		}
	}

	private async GetToken() {
		let data = JSON.stringify({
			"asset_id": "c9ed1346a1549bdf946c1b369f4a3801bbbe2e367db8c228bcf5dd452791ca9d",
			"kill": 1
		})

		let list = await fetch(`http://3.110.115.64/dosa/point`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: data
		})

		let response = await list.json()

		return response
	}

	private async levelUp() {
		let data = JSON.stringify({
			"asset_id": "c9ed1346a1549bdf946c1b369f4a3801bbbe2e367db8c228bcf5dd452791ca9d",
		})

		try {
			let list = await fetch(`http://3.110.115.64/dosa/levelup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: data
			})

			let response = await list.json()

			this.updateTokenLevelDisplay(response.metadata.token.available, response.metadata.level.current)
			this.isNextLevel = false
			this.displayLevelUpButton()
			this.isLevelUpAvailable(response)
		} catch (e) {
			console.log(e)
		}
	}

	private updateTokenLevelDisplay(tokenAvailable, currentLevel) {
		this.tokenAvailableLabel.text = `${tokenAvailable}`
		this.currentLevel.text = `Level ${currentLevel}`
	}

	private displayLevelUpButton() {
		this.isNextLevel ?
			this.levelUpButton.setVisible(true) :
			this.levelUpButton.setVisible(false)
	}

	private isLevelUpAvailable(response) {
		if (response.metadata.token.available >= response.metadata.level.next_level) {
			this.isNextLevel = true
			this.displayLevelUpButton()
		}
	}
}

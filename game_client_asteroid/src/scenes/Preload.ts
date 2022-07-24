import Phaser, { Scene } from 'phaser'

import { SceneKeys } from '~/consts/SceneKeys'
import { TextureKeys } from '~/consts/GameKeys'
import localskins from '../data/skins.json'

import "regenerator-runtime/runtime";
import '~/game/AsteroidPool'
import '~/game/PlayerShip'
import '~/game/ProjectilePool'
import Web3 from 'web3';
import { loadSmartContract } from '~/utils/smart-contract.util';
import CONTRACT_ABI from '../data/contract-abi.json'
import CashOutInputField from '~/UI/CashOutInputField'

interface Nft {
	chainId: string
	tokenId: string
	tokenAddress: string
	address: string
	metadata: string
}

interface Skin {
	attributes: { trait_type: string, value: string }[]
	description: string
	external_url: string
	image: string
	name: string
}

let TEXT_BACKGROUND_COLOR = '#ffecd1'
let SELECTED_TEXT_BACKGROUND_COLOR = '#60ab9a'
export default class Preload extends Phaser.Scene {

	private nfts: Nft[]
	private ship: { key: string, path: string } | null
	private laser: { key: string, path: string } | null

	private container: Phaser.GameObjects.Container
	private contract: any

	private commScene: any

	async preload() {
		this.load.setPath('assets/game/')

		this.load.image(TextureKeys.AsteroidBig1, 'meteorBrown_big1.png')
		this.load.image(TextureKeys.AsteroidBig2, 'meteorBrown_big2.png')
		this.load.image(TextureKeys.AsteroidBig3, 'meteorBrown_big3.png')
		this.load.image(TextureKeys.AsteroidBig4, 'meteorBrown_big4.png')

		this.load.image(TextureKeys.AsteroidMedium1, 'meteorBrown_med1.png')
		this.load.image(TextureKeys.AsteroidMedium2, 'meteorBrown_med2.png')

		this.load.image(TextureKeys.AsteroidSmall1, 'meteorBrown_small1.png')
		this.load.image(TextureKeys.AsteroidSmall2, 'meteorBrown_small2.png')

		this.load.image(TextureKeys.Particles1, 'star_04.png')
	}

	async create() {
		
		this.commScene = this.scene.get(SceneKeys.Communication)

		this.contract = await loadSmartContract(CONTRACT_ABI, process.env.CONTRACT_ADDRESS)

		let assets: { images: { key: string; path: string }[] } = { images: [] }

		this.ship = null
		this.laser = null

		this.listenToEvents()

		let accs = await window.web3.eth.getAccounts();
		this.commScene.pull('get_user_rocket', accs[0])
	}

	private listenToEvents() {
		this.commScene.events.on('output', (d) => {
			this.displayRockets(d.data as Nft[])
		})
	}

	private async displayRockets(data: Nft[]) {
		this.nfts = data
		
		let assets: { images: { key: string; path: string, nft: Nft }[] } = { images: [] }

		for (const nft of data) {
			let skin: Skin = JSON.parse(nft.metadata)
			if(!skin.parts?.body?.src) { continue }

			assets.images.push({ 
				bodyKey: `body-${nft.tokenId}`, 
				bodyPath: `${process.env.IPFS_BASE_PATH}/${skin.parts.body.src.split('//')[1]}`, 
				laserKey: `laser-${nft.tokenId}`
				laserPath: `${process.env.IPFS_BASE_PATH}/${skin.parts.bullet.src.split('//')[1]}`, 
				nft: nft
			})
		}

		this.loadAssets(assets)

		// default ship if no skins
		if (data.result.length === 0) {

			let local: any[] = []

			for (let skin of localskins) {
				let ship = JSON.stringify({ image: skin.ship })

				local.push({ metadata: ship })
			}

			return local
		}

		return data.result.filter(skin => {
			return skin.metadata
		})
	}

	private loadAssets(assets: any) {
		new Promise((resolve) => {
			let loader = new Phaser.Loader.LoaderPlugin(this);

			for (const sheet of assets.images) {
				loader.image(sheet.bodyKey, sheet.bodyPath);
				loader.image(sheet.laserKey, sheet.laserPath);
			}

			loader.once(Phaser.Loader.Events.COMPLETE, () => {
				this.buildShipSelectionUI(assets)
				resolve(assets);
			});
			loader.start();
		});
	}

	private buildShipSelectionUI(assets: any) {
		this.buildButtons()
		let xShip = -300
		let yShip = -100

		let ships = this.add.group()
		
		let style = {
			color: 'black',
			backgroundColor: TEXT_BACKGROUND_COLOR,
			fixedWidth: 300
		}

		for (const skin of assets.images) {
			let key = skin.key

			let config = { xStep: xShip, yStep: yShip, spriteXOrigin: 0, spriteYOrigin: 0.3 }

			let sprite = this.add.sprite(config.xStep, config.yStep, `${skin.bodyKey}`)
				.setOrigin(config.spriteXOrigin, config.spriteYOrigin)
				.setInteractive({ cursor: 'pointer' })
				.on('pointerdown', () => {
					console.log(skin)
					this.ship = skin

					if (this.ship) {
						this.scene.start(SceneKeys.Multiplayer)
						this.scene.start(SceneKeys.Game)
					}
				})

			this.container.add(sprite)

			yShip += sprite.height + 10
		}
	}

	private resetTextBackgroundColor(group: Phaser.GameObjects.Group) {
		group.children.iterate(el => {
			let text = el as Phaser.GameObjects.Text
			text.setBackgroundColor(TEXT_BACKGROUND_COLOR)
		})
	}

	private buildButtons() {
		if (this.container) this.container.destroy()
		this.container = this.add.container(this.scale.width / 2, this.scale.height * .5)

		let buttons = [
			{
				label: 'Mint New Rocket', callback: async () => {
					const amount = await window.web3.utils.toWei('0.01', "ether")
					const accounts = await await window.web3.eth.getAccounts();
					await this.contract.methods.mint().send({
						from: accounts[0]
						value: amount,
						gas: 500000
					})
				}
			},
			{
				label: 'Change Equipment', callback: () => {
					console.log('change equipment button clicked');
				}
			},
			{
				label: 'Cashout', callback: async () => {
					console.log('cashout button clicked');
					let input = document.getElementById('cash-out-input') as HTMLInputElement
					let isEmpty = input.value.length === 0
					if (isEmpty) return

					await this.contract.methods.cashOut(input.value)
				}
			}]

		let style = {
			color: 'black',
			backgroundColor: TEXT_BACKGROUND_COLOR,
			fixedWidth: 200
		}

		let xStep = -180

		for (let button of buttons) {
			if (button.label === 'Cashout') {
				let cashOutInputField = this.add.dom(xStep, -250, CashOutInputField())
				this.container.add(cashOutInputField)
			}

			let text = this.add.text(xStep, -200, `${button.label}`, style)
				//@ts-ignore
				.setPadding(6, 12)
				.setOrigin(0.5, 0.5)
				.setInteractive({ cursor: 'pointer' })
				.on('pointerover', () => {
					text.style.backgroundColor === TEXT_BACKGROUND_COLOR ?
						text.setBackgroundColor(SELECTED_TEXT_BACKGROUND_COLOR) :
						text.setBackgroundColor(TEXT_BACKGROUND_COLOR)
				})
				.on('pointerout', () => {
					text.style.backgroundColor === TEXT_BACKGROUND_COLOR ?
						text.setBackgroundColor(SELECTED_TEXT_BACKGROUND_COLOR) :
						text.setBackgroundColor(TEXT_BACKGROUND_COLOR)
				})
				.on('pointerdown', () => {
					button.callback()
				})

			xStep += 270
			this.container.add(text)
		}
	}

	get texture() {
		return this.ship
	}
}

import { SceneKeys } from './consts/SceneKeys'

import TitleScreen from './scenes/TitleScreen'

import GameBackground from './scenes/GameBackground'
import Game from './scenes/Game'
import GameUI from './scenes/GameUI'
import GameOver from './scenes/GameOver'
import Preload from './scenes/Preload'
import Multiplayer from './scenes/Multiplayer'

const registerScenes = (game: Phaser.Game) => {
	game.scene.add(SceneKeys.TitleScreen, TitleScreen)

	game.scene.add(SceneKeys.GameBackground, GameBackground)
	game.scene.add(SceneKeys.Preload, Preload)
	game.scene.add(SceneKeys.Multiplayer, Multiplayer)
	game.scene.add(SceneKeys.Game, Game)
	game.scene.add(SceneKeys.GameUI, GameUI)
	game.scene.add(SceneKeys.GameOver, GameOver)
}

export default registerScenes

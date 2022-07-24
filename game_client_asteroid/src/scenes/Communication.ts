
import { SceneKeys } from '~/consts/SceneKeys'
import { io } from 'socket.io-client';
export default class CommunicationScene extends Phaser.Scene {
  
  private _socketFluence: any

  constructor() {
    super({ key: SceneKeys.Communication })
    this._socketFluence = io(process.env.SOCKET_IO_FLUENCE)
  }

  create() {
    this._socketFluence.on('output', (data) => {
      this.events.emit('output', data)
    })
  }

  pull(func: string, data: any) {
		if(!this._socketFluence) { return }
		this._socketFluence.emit(func, data)
	}

	push(func: string, data: any) {}
}
import { Fluence } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { fetch_user_rocket } from '../_aqua/game_oracle'

export default class FluenceController {

  constructor() {
    this.start()
  }

  private async start() {
    await Fluence.start({ connectTo: krasnodar[0] });
    console.log(Fluence.getStatus().peerId)
  }

  async get_rockets(address: string) {
    return await fetch_user_rocket(address)
  }
}
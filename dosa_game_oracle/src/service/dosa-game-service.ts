import { BigChainDbModule } from '../module';
import { DosaGameServiceDef } from '../_aqua/dosa_game_service';
import axios from 'axios'
import Web3 from 'web3'
import * as nft721abi from '../data/DOSA1NFT_abi.json'

export interface ConfirmKill {
    id: string
    kill: number
    timestamp: string
}

export interface PointList {
    [key: string]: ConfirmKill
}

export class DosaGameService implements DosaGameServiceDef {
    private bigchaindb: BigChainDbModule;

    private pointList: PointList

    constructor() {
        this.bigchaindb = new BigChainDbModule();
        this.pointList = {}
    }

    /**
     * Generate metadata asset
     * @returns asset id generated
     */
    async add_point(id: string, kill: number): Promise<string> {
        
        let point = this.pointList[id]

        if(point) {
            point.kill += kill

            if(point.kill >= 10) {

                try {
                    const response = await this.add_data_to_db(point)
                    point.kill = 0
                    return response
                } catch(e) {
                    return `ERROR: INSERT POINT ${point.id} ${e}`
                }
            }
        } else {
            this.pointList[id] = {
                id,
                kill,
                timestamp: ''
            } as ConfirmKill
        }

        return `VALIDATE ${id} ${kill} POINT`
    }

    async level_up(id: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const asset: any = await this.bigchaindb.fetchLatestTransaction(id)

            if(asset.metadata.token.available >= asset.metadata.level.next_level) {
                asset.metadata.token.available = asset.metadata.token.available - asset.metadata.level.next_level
                asset.metadata.level.current++
                asset.metadata.token.spent = asset.metadata.token.spent + asset.metadata.level.next_level

                await this.bigchaindb.append(asset.id, asset.metadata)
                
                resolve(`SPENT ${id} ${asset.metadata.level.next_level} POINT`)
            }

            reject(`ERROR: ${id} NOT UPGRADABLE`)
        })
    }

    private async add_data_to_db(point: ConfirmKill) : Promise<string> {
        return new Promise(async (resolve, reject) => {
            const asset: any = await this.bigchaindb.fetchLatestTransaction(point.id)

            if(!asset) { resolve('ERROR: INVALID ASSET ID') }

            const total_point = point.kill * 10
            asset.metadata.token.available += total_point

            await this.bigchaindb.append(asset.id, asset.metadata)

            resolve(`INSERT POINT ${point.id} ${point.kill} KILL ${total_point} POINT`)
        })
    }
}

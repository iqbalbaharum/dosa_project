import { BigChainDbModule } from '../module';
import { IDosaGameServiceDef } from '../_aqua/i_dosa_game_service';
import axios from 'axios'
import Web3 from 'web3'
import nft721abi from '../data/DOSA1NFT_abi.json'
import { ConfirmKill, PointList, UserNFT } from '../interface'

export class DosaGameService implements IDosaGameServiceDef {
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

    async get_user_rockets(address: string): Promise<UserNFT[]> {

        let mints: UserNFT[] = []

        try {
            const response = await axios({
                url: process.env.THEGRAPH_URL,
                method: 'post',
                data: {
                    query: `
                        query {
                            baseNFTs(
                                where: {
                                    owner: "${address}"
                                }) {
                            id
                            owner
                            tokenId
                            blockNo
                        }
                        }
                    `
                }
            })

            for(const data of response.data.data.baseNFTs) {
                mints.push({
                    address,
                    tokenAddress: process.env.ADDRESS_NFT721 as string,
                    tokenId: parseInt(data.tokenId),
                    chainId: process.env.CHAIN_ID as string,
                    metadata: ``
                })
            }

        } catch(e) {
            console.log(e)
        }

        return mints
    }

    async fetch_nft_token_uri(nft: UserNFT): Promise<UserNFT> {
        try {
            let response = await axios({
                url: `${process.env.COVALENTHQ_URL}/${nft.chainId}/tokens/${nft.tokenAddress}/nft_metadata/${nft.tokenId}/?quote-currency=USD&format=JSON&key=${process.env.COVALENTHQ_API_KEY}`,
                method: 'get'
            })
            nft.metadata = response.data.data.items[0]?.nft_data[0]?.token_url

        } catch(e) {
            console.log(e)
        }

        return nft
    }

    async fetch_nft_metadata(nft: UserNFT): Promise<UserNFT> {
        try {
            // get id
            const protocol = nft.metadata.split('://')

            if(protocol[0] !== 'dosa') {
                nft.metadata = '{}'
            } else {
                let response: any = await this.bigchaindb.fetchLatestTransaction(protocol[1]) 
                nft.metadata = JSON.stringify(response.metadata)
            }

        } catch(e) {
            console.log(e)
            nft.metadata = `{}`
        }

        return nft
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

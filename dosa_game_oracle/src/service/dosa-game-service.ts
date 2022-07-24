import { BigChainDbModule, CovalentDbModule } from '../module';
import { IDosaGameServiceDef } from '../_aqua/i_dosa_game_service';
import axios from 'axios'
import Web3 from 'web3'
import nft721abi from '../data/DOSA1NFT_abi.json'
import { ConfirmKill, PointList, UserNFT, DosaNFT } from '../interface'

export class DosaGameService implements IDosaGameServiceDef {
    private bigchaindb: BigChainDbModule;
    private covalent: CovalentDbModule

    private pointList: PointList

    constructor() {
        this.bigchaindb = new BigChainDbModule();
        this.covalent = new CovalentDbModule()
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
            
            let response = await axios({
                url: `${process.env.COVALENTHQ_URL}/${nft.chainId}/tokens/${nft.tokenAddress}/nft_metadata/${nft.tokenId}/?quote-currency=USD&format=JSON&key=${process.env.COVALENTHQ_API_KEY}`,
                method: 'get'
            })
            
            const metadata = response.data.data.items[0]?.nft_data[0]?.token_url
            
            // get id
            const protocol = metadata.split('://')

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

    async fetch_dosa_nft_metadata(address: string, id: string) : Promise<DosaNFT> {
        
        const nft = {
            address: address,
            id: id,
            hash: '',
            metadata: '{}',
        } as DosaNFT

        try {
            
            const response = await this.covalent.getNftMetadata(process.env.CHAIN_ID as string, nft.address, nft.id)
            const token_uri = response.data.data.items[0]?.nft_data[0]?.token_url
            // get id
            const protocol = token_uri.split('://')

            if(protocol[0] !== 'dosa') {
                nft.metadata = '{}'
            } else {
                let response: any = await this.bigchaindb.fetchLatestTransaction(protocol[1])
                // console.log(response)
                nft.hash = protocol[1]
                nft.metadata = JSON.stringify(response.metadata)
            }

        } catch(e) {
            console.log(e)
            nft.hash = ''
            nft.metadata = `{}`
        }

        return nft
    }

    async fetch_nft_metadata_from_ipfs(address: string, id: string) : Promise<DosaNFT> {

        const nft = {
            address,
            id,
            hash: '',
            metadata: '{}',
        } as DosaNFT

        const response = await this.covalent.getNftMetadata(process.env.CHAIN_ID as string, nft.address, nft.id)
        if(response.data.data.items[0]?.nft_data[0]?.external_data) {
            nft.metadata = JSON.stringify(response.data.data.items[0]?.nft_data[0]?.external_data)
        } else {
            nft.metadata = '{}'
        }
        
        return nft
    }

    async consume_nft(base: DosaNFT, consumable: DosaNFT) : Promise<string> {

        return new Promise(async(resolve, reject) => {
            const baseMetadata = JSON.parse(base.metadata)
            const consumableMetadata = JSON.parse(consumable.metadata)

            const typeAttr = consumableMetadata.attributes?.find((e:any) => e.trait_type === 'base')
            if(!typeAttr || typeAttr.value !== baseMetadata.base.type) {
                console.log(`MERGE ERROR (DIFFERENT BASE) BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
                resolve(`MERGE ERROR (DIFFERENT BASE) BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
                return
            }

            const slotAttr = consumableMetadata.attributes?.find((e: any) => e.trait_type === 'slot')
            if(baseMetadata.parts[slotAttr?.value].type !== 'slot') {
                console.log(`MERGE ERROR (NO SLOT) BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
                resolve(`MERGE ERROR (NO SLOT) BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
                return
            }

            if(!baseMetadata.parts || !slotAttr) {
                console.log(`MERGE ERROR (INVALID METADATA) BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
                resolve(`MERGE ERROR (INVALID METADATA) BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
                return
            }

            baseMetadata.parts[slotAttr?.value]['src'] = consumableMetadata.attributes?.find((e: any) => e.trait_type === 'resource').value
            baseMetadata.parts[slotAttr?.value]['nft'] = {
                mechanic: "burned",
                type: "erc721",
                address: consumable.address,
                tokenId: consumable.id
            }

            try {
                await this.bigchaindb.append(base.hash, baseMetadata)
            } catch(e) {
                console.log(`MERGE ERROR BASE ${base.address} ${base.id} ERROR ${e}`)
                resolve(`MERGE ERROR BASE ${base.address} ${base.id} ERROR ${e}`)
                return
            }

            console.log(`MERGE BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
            resolve(`MERGE BASE ${base.address} ${base.id} CONSUMABLE ${consumable.address} ${consumable.id}`)
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

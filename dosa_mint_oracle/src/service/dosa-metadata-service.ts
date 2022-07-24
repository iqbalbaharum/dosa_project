import { BigChainDbModule } from '../module';
import { IDosaMetadataServiceDef } from '../_aqua/i-dosa-metadata';
import axios from 'axios'
import Web3 from 'web3'
import nft721abi from '../data/DOSA1NFT_abi.json'

export interface NewMint {
    address: string
    blockNo: string
}

export interface NewMerge {
    id: string
    baseAddress: string
    baseTokenId: string
    consumableAddress: string
    consumableTokenId: string
    blockNo: string
}

export class DosaMetadataService implements IDosaMetadataServiceDef {
    private bigchaindb: BigChainDbModule;

    private last_processed_block: String
    private last_merge_processed_block: String

    constructor() {
        this.bigchaindb = new BigChainDbModule();
        this.last_processed_block = `${process.env.LAST_PROCESSED_BLOCK}`
        this.last_merge_processed_block = `${process.env.LAST_MERGE_PROCESSED_BLOCK}`
    }

    /**
     * Generate metadata asset
     * @returns asset id generated
     */
    async generate_metadata(): Promise<string> {
        const metadata = {
            stats: {
                attack: 1.0 + parseFloat((Math.random() * 1.0).toFixed(2)),
                defense: 1.0 + parseFloat((Math.random() * 1.0).toFixed(2)),
                growth_rate: 0.05 + parseFloat((Math.random() * 0.05).toFixed(2)),
                income_rate: 0.001 + parseFloat((Math.random() * 0.001).toFixed(2)),
            },
            token: {
                available: 0,
                spent: 0,
            },
            level: {
                current: 1,
                next_level: 500 * Math.pow(2, 2) - 500 * 2,
            },
            base: {
                type: '1-rocket',
            },
            parts: {
                body: {
                    type: 'slot',
                    src: 'ipfs://bafybeifft6ugdvzhnbnaqwphhoxirzpoqbzgkpylajd4f3nhy7mualvs3y/DOSA1-ship-blue-OG-0001.png',
                    nft: {},
                },
                bullet: {
                    type: 'slot',
                    src: 'ipfs://bafybeibnbvbswbwoeivs5ejmxqcj5g54alibgtzzydgvhqtmmu7le2vlre/DOSA1-laser-blue-OG-0001.png',
                    nft: {},
                },
                effect: {
                    type: 'slot',
                    src: '',
                    nft: {},
                },
            },
        };

        const tx = await this.bigchaindb.create(
            {
                asset: {
                    type: process.env.METADATA_TYPE,
                },
            },
            metadata,
        );

        return `dosa://${tx}`;
    }

    async get_latest_mint(): Promise<NewMint[]> {
        
        const response = await axios({
            url: process.env.THEGRAPH_URL,
            method: 'post',
            data: {
                query: `
                    query {
                        mintBurnMints (
                            orderBy: blockNo,
                            orderDirection: asc,
                            where: {
                                blockNo_gt: ${this.last_processed_block}
                            },
                        ) {
                        id
                        to
                        blockNo
                    }
                    }
                `
            }
        })

        let mints: NewMint[] = []
        let index = 0
        for(const data of response.data.data.mintBurnMints) {
            mints.push({
                address: data.to,
                blockNo: data.blockNo
            })
        }

        return mints
    }

    async get_latest_merge(): Promise<NewMerge[]> {
        const response = await axios({
            url: process.env.THEGRAPH_URL,
            method: 'post',
            data: {
                query: `
                    query {
                        mergeNFTs (
                            orderBy: blockNo,
                            orderDirection: asc,
                            where: {
                                blockNo_gt: ${this.last_merge_processed_block}
                            },
                        ) {
                            id
                            baseAddress
                            baseTokenId
                            consumableAddress
                            consumableTokenId
                    }
                    }
                `
            }
        })

        let mints: NewMerge[] = []
        let index = 0
        for(const data of response.data.data.mergeNFTs) {
            mints.push({
                id: data.id,
                baseAddress: data.baseAddress,
                baseTokenId: data.baseTokenId,
                consumableAddress: data.consumableAddress,
                consumableTokenId: data.consumableTokenId,
                blockNo: data.blockNo
            })

            if(index < response.data.data.mergeNFTs.length - 1) {
                this.last_merge_processed_block = data.blockNo
            }

            index++
        }

        return mints
    }

    async mint_nft(mint: NewMint, metadata_uri: string): Promise<string> {
        const web3 = new Web3(process.env.ETH_RPC_URL_HTTP as string)

        try {
            web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY as string)
            const contract = new web3.eth.Contract(nft721abi as any, process.env.ADDRESS_NFT721)

            // var block = await web3.eth.getBlock("latest");
            // var gasLimit = block.gasLimit/block.transactions.length;

            // console.log(gasLimit)

            await contract.methods
            .mint(mint.address, metadata_uri)
            .send({
                from: process.env.ETH_PUBLIC_KEY as string,
                to: process.env.ADDRESS_NFT721 as string,
                gasPrice: parseInt(process.env.GAS_FEE as string) ?? 300000,
                gas: 5000000
            })
        } catch(e) {
            console.log(`MINT ERROR BLOCK ${mint.blockNo} ERROR ${e}`)
            return `MINT ERROR BLOCK ${mint.blockNo} ERROR ${e}`
        }

        this.last_processed_block = mint.blockNo
        
        console.log(`MINT ${mint.address} URI ${metadata_uri} LAST BLOCK ${this.last_processed_block}`)
        return `MINT ${mint.address} URI ${metadata_uri} LAST BLOCK ${this.last_processed_block}`
    }
}

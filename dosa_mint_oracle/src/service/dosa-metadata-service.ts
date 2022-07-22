import { BigChainDbModule } from '../module';
import { IDosaMetadataServiceDef } from '../_aqua/i-dosa-metadata';
import axios from 'axios'
import Web3 from 'web3'
import * as nft721abi from '../data/DOSA1NFT_abi.json'

export interface NewMint {
    id: string
    address: string
    blockNo: string
}

export class DosaMetadataService implements IDosaMetadataServiceDef {
    private bigchaindb: BigChainDbModule;

    private last_processed_block: String

    constructor() {
        this.bigchaindb = new BigChainDbModule();
        this.last_processed_block = `${process.env.LAST_PROCESSED_BLOCK}`
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
                        baseNFTs(
                            orderBy: blockNo,
                            orderDirection: asc,
                            where: {
                                blockNo_gt: ${this.last_processed_block}
                            },
                        ) {
                        id
                        owner
                        tokenId
                        blockNo
                    }
                    }
                `
            }
        })

        let mints: NewMint[] = []
        let index = 0
        for(const data of response.data.data.baseNFTs) {
            mints.push({
                id: data.tokenId,
                address: data.owner,
                blockNo: data.blockNo
            })

            if(index === (response.data.data.baseNFTs.length - 1)) {
                this.last_processed_block = data.blockNo
            } else {
                index++
            }
        }

        return mints
    }

    async mint_nft(mint: NewMint, metadata_uri: string): Promise<any> {
        console.log(mint.address)
        const web3 = new Web3(process.env.ETH_RPC_URL_HTTP as string)
        const contract = new web3.eth.Contract(nft721abi as any, process.env.ADDRESS_NFT721 as string)
        // add private key
        web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY as string)
        // contract.setProvider(web3.currentProvider)

        await contract.methods
            .mint(mint.address, metadata_uri)
            .send({
                from: process.env.ETH_PUBLIC_KEY as string,
                to: process.env.ADDRESS_NFT721 as string,
                gas: parseInt(process.env.GAS_FEE as string) ?? 300000
            })

            this.last_processed_block = mint.blockNo
    }
}

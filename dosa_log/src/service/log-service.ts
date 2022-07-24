import { IDosaLogServiceDef } from '../_aqua/i-dosa-log';
import { create } from 'ipfs-http-client'
import OrbitDB from 'orbit-db'

export class DosaLogService implements IDosaLogServiceDef {

    private db: any

    constructor() {
        this.startDB()
    }

    private async startDB() {
        const ipfs = await create({ url: process.env.IPFS_BASE_PATH })
        this.db = await OrbitDB.createInstance(ipfs)
    }

    add_log() {

    }
}

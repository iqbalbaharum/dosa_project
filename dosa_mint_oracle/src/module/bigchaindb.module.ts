import * as BigChainDB from 'bigchaindb-driver';

export class BigChainDbModule {
    private connection;

    constructor() {
        this.connection = new BigChainDB.Connection(process.env.BCDB_API_PATH as any);
    }

    async create(asset: object, metadata: object): Promise<string> {
        const txCreate = BigChainDB.Transaction.makeCreateTransaction(
            asset,
            metadata,
            [
                BigChainDB.Transaction.makeOutput(
                    BigChainDB.Transaction.makeEd25519Condition(process.env.BCDB_PUBLIC_KEY as any),
                ),
            ],
            process.env.BCDB_PUBLIC_KEY as any,
        );

        const txSigned = BigChainDB.Transaction.signTransaction(txCreate as any, process.env.BCDB_PRIVATE_KEY as any);

        let assetCreated = await this.connection.postTransactionCommit(txSigned);

        return assetCreated.id ?? {};
    }
}

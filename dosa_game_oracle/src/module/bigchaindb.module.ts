import * as BigChainDB from 'bigchaindb-driver';

export class BigChainDbModule {
    private connection;

    constructor() {
        this.connection = new BigChainDB.Connection(process.env.BCDB_API_PATH as any);
    }

    async fetchLatestTransaction(assetId: string) : Promise<object | unknown> {
        try {
            const transaction_data = await this.connection.listTransactions(assetId)
            return transaction_data[transaction_data.length - 1]
        } catch (error) {
            console.log(error)
            return {}
        }
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

    async append(txId: string, metadata: any): Promise<any> {
        try {
            let txCreated = await this.connection.getTransaction(txId)

            if(!txCreated) {
                return 'INVALID ASSET ID'
            }
            
            const updatedBuilding = BigChainDB.Transaction.makeTransferTransaction(
                [
                    {
                        tx: txCreated,
                        output_index: 0,
                    },
                ],
                [
                    BigChainDB.Transaction.makeOutput(
                        BigChainDB.Transaction.makeEd25519Condition(process.env.BCDB_PUBLIC_KEY as string),
                    ),
                ],
                metadata,
            )
    
            const signedTransfer = BigChainDB.Transaction.signTransaction(
                updatedBuilding,
                process.env.BCDB_PRIVATE_KEY as string,
            )
    
            let assetTransfered = await this.connection.postTransactionCommit(signedTransfer)
            return assetTransfered
        } catch (error) {
            console.log(error)
        }
    }
}

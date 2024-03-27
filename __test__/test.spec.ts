import {Connection, Keypair, LAMPORTS_PER_SOL, Signer, SystemProgram, Transaction} from "@solana/web3.js";
import assert from "assert";
import {SolanaFastClient} from "../index";

let payer: Signer, toAccount: any;

describe('run function tests', () => {
    beforeAll(async () => {
        payer = Keypair.generate();
        toAccount = Keypair.generate();

        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=62ab39d9-db50-4757-a99f-8f360b325ce3', 'confirmed');

        let airdropSignature = await connection.requestAirdrop(
            payer.publicKey,
            LAMPORTS_PER_SOL,
        );

        await connection.confirmTransaction(airdropSignature);
    })

    it('benchmark send rpc transaction', async () => {
        console.time('RPC Transaction');

        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=62ab39d9-db50-4757-a99f-8f360b325ce3', 'confirmed');

        let recentBlockhash = await connection.getRecentBlockhash();
        console.log(recentBlockhash);

        let transaction = new Transaction({
            recentBlockhash: recentBlockhash.blockhash
        }).add(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: toAccount,
                lamports: 8,
            }),
        );

        transaction.sign(payer);

        let ret = await connection.sendTransaction(transaction, [payer]);
        await connection.confirmTransaction(ret);

        console.log("RPC transaction sent: ", ret);

        console.timeEnd('RPC Transaction');
        assert(typeof ret, "string");
    });

    it('benchmark send quic transaction', async () => {
        console.time('Quic Transaction');

        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=62ab39d9-db50-4757-a99f-8f360b325ce3', 'confirmed');

        let recentBlockhash = await connection.getRecentBlockhash();

        let manualTransaction = new Transaction({
            recentBlockhash: recentBlockhash.blockhash,
            feePayer: payer.publicKey,
        }).add(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: toAccount,
                lamports: 8, // Adjust lamports as needed
            }),
        );

        let transactionBuffer = manualTransaction.serializeMessage();
        manualTransaction.addSignature(payer.publicKey, transactionBuffer);

        const a = manualTransaction.serialize();

        const quic_client = SolanaFastClient.new('https://mainnet.helius-rpc.com/?api-key=62ab39d9-db50-4757-a99f-8f360b325ce3', ' wss://mainnet.helius-rpc.com/?api-key=62ab39d9-db50-4757-a99f-8f360b325ce3');
        await quic_client.connect()

        const ret = await quic_client.sendTransaction(a)
        console.log("Quic transaction sent: ", ret)

        console.timeEnd('Quic Transaction');
        assert(typeof ret, "string")
    });

});

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { Connection, Keypair, PublicKey, Signer } from '@solana/web3.js';

import { TOKEN_PROGRAM_ID, createMint, createAccount, getAccount, mintTo, burn, burnChecked } from '../../src';

import { newAccountWithLamports, getConnection } from './common';

const TEST_TOKEN_DECIMALS = 2;
describe('burn', () => {
    let connection: Connection;
    let payer: Signer;
    let mint: PublicKey;
    let mintAuthority: Keypair;
    let owner: Keypair;
    let account: PublicKey;
    let amount: bigint;
    before(async () => {
        connection = await getConnection();
        payer = await newAccountWithLamports(connection, 1000000000);
        mintAuthority = Keypair.generate();
        const mintKeypair = Keypair.generate();
        mint = await createMint(
            connection,
            payer,
            mintAuthority.publicKey,
            mintAuthority.publicKey,
            TEST_TOKEN_DECIMALS,
            mintKeypair,
            undefined,
            TOKEN_PROGRAM_ID
        );
    });
    beforeEach(async () => {
        owner = Keypair.generate();
        account = await createAccount(connection, payer, mint, owner.publicKey, undefined, undefined, TOKEN_PROGRAM_ID);
        amount = BigInt(1000);
        await mintTo(connection, payer, mint, account, mintAuthority, amount, [], undefined, TOKEN_PROGRAM_ID);
    });
    it('burn', async () => {
        const burnAmount = BigInt(1);
        await burn(connection, payer, account, mint, owner, burnAmount, [], undefined, TOKEN_PROGRAM_ID);
        const accountInfo = await getAccount(connection, account, undefined, TOKEN_PROGRAM_ID);
        expect(accountInfo.amount).to.eql(amount - burnAmount);
    });
    it('burnChecked', async () => {
        const burnAmount = BigInt(1);
        await burnChecked(
            connection,
            payer,
            account,
            mint,
            owner,
            burnAmount,
            TEST_TOKEN_DECIMALS,
            [],
            undefined,
            TOKEN_PROGRAM_ID
        );
        const accountInfo = await getAccount(connection, account, undefined, TOKEN_PROGRAM_ID);
        expect(accountInfo.amount).to.eql(amount - burnAmount);
    });
});

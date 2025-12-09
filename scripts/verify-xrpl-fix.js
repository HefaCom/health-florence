const xrpl = require('xrpl');

async function verifyFix() {
    console.log('Connecting to XRPL Testnet...');
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    try {
        // Generate a random wallet which is definitely unfunded
        const wallet = xrpl.Wallet.generate();
        console.log(`Generated unfunded wallet: ${wallet.address}`);

        try {
            console.log('Attempting to fetch account info...');
            await client.request({
                command: 'account_info',
                account: wallet.address,
                ledger_index: 'validated'
            });
            console.error('❌ Failed: Should have thrown an error for unfunded account');
        } catch (error) {
            // Test the logic added to xrpl.service.ts
            if (error?.data?.error === 'actNotFound' ||
                error?.message?.includes('Account not found') ||
                error?.toString().includes('Account not found')) {
                console.log('✅ Success: Caught "Account not found" error correctly.');
                console.log('   This confirms the catch block logic will work.');
                console.log('   Simulated return value:', { xrp: '0', haic: '0' });
            } else {
                console.error('❌ Failed: Unexpected error:', error);
            }
        }

    } catch (err) {
        console.error('Global error:', err);
    } finally {
        await client.disconnect();
    }
}

verifyFix();

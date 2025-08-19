export const environment = {
    production: true,
    domain: 'b2pix.org',
    network: "testnet", // 'mainnet', 'testnet', 'devnet', 'mocknet'
    // apiUrl: 'http://localhost:3000/api/v1',
    // apiUrl: 'https://boltproto.org/api/v1',
    apiUrl: 'http://localhost:8080/api',
    hiroApiKey: '06be121cbb2d828b463e9bc108cdb169',
    blockchainAPIUrl: 'https://api.testnet.hiro.so',
    boltProtocol: {
        contractAddress: 'ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF',
        contractName: 'boltproto-sbtc-rc-2-0-0'
    },
    supportedAsset: {
        sBTC: {
            contractAddress: 'ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF',
            contractName: 'sbtc-token',
            contractToken: 'sbtc-token',
            decimals: 8,
            name: 'sBTC',
            symbol: 'sBTC',
            image: 'https://ipfs.io/ipfs/bafkreiffe46h5voimvulxm2s4ddszdm4uli4rwcvx34cgzz3xkfcc2hiwi',
            fee: 200 // sats
        }
    },
    b2pixAddress: 'ST3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02W1N0YJF', // B2PIX address for mainnet
};
export const environment = {
    production: false,
    domain: 'b2pix.org',
    network: "testnet", // 'mainnet', 'testnet', 'devnet', 'mocknet'
    // apiUrl: 'http://localhost:3000/api/v1',
    // apiUrl: 'https://boltproto.org/api/v1',
    apiUrl: '/api/v1',
    hiroApiKey: '06be121cbb2d828b463e9bc108cdb169',
    blockchainAPIUrl: 'https://api.hiro.so',
    boltProtocol: {
        contractAddress: 'SP3QZNX3CGT6V7PE1PBK17FCRK1TP1AT02ZHQCMVJ',
        contractName: 'boltproto-sbtc-v2'
    },
    supportedAsset: {
        sBTC: {
            contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
            contractName: 'sbtc-token',
            contractToken: 'sbtc-token',
            decimals: 8,
            name: 'sBTC',
            symbol: 'sBTC',
            image: 'https://ipfs.io/ipfs/bafkreiffe46h5voimvulxm2s4ddszdm4uli4rwcvx34cgzz3xkfcc2hiwi',
            fee: 20 // sats
        }
    },
    b2pixAddress: 'SP1E6P0KM6BEWF1CJQGGJXER0WG58JDZ32YYCN95R', // B2PIX address for mainnet
};
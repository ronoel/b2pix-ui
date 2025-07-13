export const environment = {
    production: false,
    network: "testnet", // 'mainnet', 'testnet', 'devnet', 'mocknet'
    // apiUrl: 'http://localhost:3000/api/v1',
    // apiUrl: 'https://boltproto.org/api/v1',
    apiUrl: '/api/v1',
    blockchainAPIUrl: 'https://api.hiro.so',
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
    }
};
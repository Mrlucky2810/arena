
export const AVATAR_IMAGES = [
    '/avatars/01.png',
    '/avatars/02.png',
    '/avatars/03.png',
    '/avatars/04.png',
    '/avatars/05.png',
    '/avatars/06.png',
    '/avatars/07.png',
    '/avatars/08.png',
];

export const cryptoWallets: { [key: string]: { name: string, address: string, qrCode: string } } = {
    usdt: { name: 'USDT (TRC20)', address: 'TXqA9c3A5X1ZtB8Z6f8J3K7rN9wE2vT4mP', qrCode: '/qr-codes/usdt.png' },
    btc: { name: 'Bitcoin (BTC)', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', qrCode: '/qr-codes/btc.png' },
    bnb: { name: 'Binance Coin (BNB)', address: 'bnb1grpf0955h0ykpchgmmt2eha0z42am9q4v2s4a3', qrCode: '/qr-codes/bnb.png' },
    sol: { name: 'Solana (SOL)', address: 'So11111111111111111111111111111111111111112', qrCode: '/qr-codes/sol.png' },
    usdc: { name: 'USDC (ERC20)', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', qrCode: '/qr-codes/usdc.png' }
};

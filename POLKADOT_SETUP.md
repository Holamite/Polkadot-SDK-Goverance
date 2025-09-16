# Polkadot API Integration Setup

## API Key Configuration

To get enhanced referendum details (titles, descriptions), you can add a Subscan API key:

1. **Subscan** - https://subscan.io/ (Recommended)

### How to Add Your Subscan API Key

1. **Create a `.env.local` file** in your project root:
```bash
NEXT_PUBLIC_SUBSCAN_API_KEY=your_subscan_api_key_here
```

2. **Or modify the config file** directly in `lib/config.ts`:
```typescript
export const config = {
  referendumDetailsApiKey: "your_subscan_api_key_here",
  // ... rest of config
}
```

### Getting a Subscan API Key

1. Go to https://subscan.io/
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Add it to your environment variables

**Note**: This platform is configured to use the **Westend testnet** by default. Make sure your Subscan API key has access to Westend network data.

## Wallet Setup

### Required Browser Extension
Install the **Polkadot.js Extension** from:
- Chrome: https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/

### Wallet Connection Process
1. Install the Polkadot.js extension
2. Create or import an account
3. **Important**: Switch to Westend testnet in your wallet
4. Make sure the account has some WND tokens for transaction fees (you can get test tokens from faucets)
5. When creating proposals with "Submit to Polkadot Chain" enabled, the extension will prompt for signing

## Test Tokens

### Westend Testnet (WND) - Recommended
- **Primary Faucet**: https://faucet.westend.network/
- **Matrix Faucet**: https://matrix.to/#/#westend_faucet:matrix.org
- **Amount**: Up to 10 WND per request
- **Cooldown**: 24 hours between requests
- **Status**: Most stable and reliable testnet

### Alternative Testnets
- **Paseo**: https://faucet.polkadot.io/ (backup option)
- **Rococo**: https://matrix.to/#/#rococo-faucet:matrix.org

### How to Get Test Tokens
1. Go to the Westend faucet: https://faucet.westend.network/
2. Enter your Westend address (starts with `5`)
3. Complete any required verification (captcha, etc.)
4. Wait for tokens to arrive (usually within minutes)
5. Check your balance in the Polkadot.js extension

## Troubleshooting

### Wallet Not Prompting for Signatures
- Ensure the Polkadot.js extension is installed and enabled
- Check that you have an account with sufficient DOT balance
- Make sure the extension is not blocked by browser security settings
- Try refreshing the page and reconnecting the wallet

### API Key Issues
- Verify the API key is correct and has proper permissions
- Check the service's API documentation for correct endpoints
- Some services may require different authentication methods

### Network Connection Issues
- Ensure you have a stable internet connection
- The app connects to Polkadot mainnet by default
- Check if your firewall is blocking WebSocket connections

## Features

### Chain Integration
- ✅ Create treasury spend referenda
- ✅ Create remark referenda  
- ✅ View live Polkadot referenda
- ✅ Sync with on-chain status
- ✅ Wallet signing integration

### API Integration
- ✅ Enhanced referendum details with API key
- ✅ Custom API endpoint configuration
- ✅ Fallback to basic referendum info

## Development Notes

The integration uses:
- `@polkadot-api/sdk-governance` for governance functionality
- `polkadot-api` for core API operations
- `@polkadot/extension-dapp` for wallet integration
- Smoldot for WebSocket connections

import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'
import 'dotenv/config'

const privateKey = process.env.DEPLOYER_PRIVATE_KEY

const accounts = privateKey ? [privateKey] : []

export default {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    baseSepolia: {
      type: 'http',
      chainType: 'l1',
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts,
    },
    base: {
      type: 'http',
      chainType: 'l1',
      url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || '',
      baseSepolia: process.env.BASESCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org',
        },
      },
      {
        network: 'baseSepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
        },
      },
    ],
  },
}

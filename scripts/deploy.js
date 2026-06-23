import hre from 'hardhat'

async function main() {
  const networkName = hre.network.name
  const [deployer] = await hre.ethers.getSigners()

  if (!deployer) {
    throw new Error('No deployer found. Add DEPLOYER_PRIVATE_KEY to .env for deploy only.')
  }

  console.log(`Deploying BasedGuestbook to ${networkName}`)
  console.log(`Deployer: ${deployer.address}`)

  const factory = await hre.ethers.getContractFactory('BasedGuestbook')
  const guestbook = await factory.deploy()
  await guestbook.waitForDeployment()

  const address = await guestbook.getAddress()
  console.log(`BasedGuestbook deployed: ${address}`)
  console.log(`Add this to .env: VITE_GUESTBOOK_ADDRESS=${address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

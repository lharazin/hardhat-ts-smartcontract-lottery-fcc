import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { developmentChains, networkConfig } from '../helper-hardhat-config'
import { VRFCoordinatorV2Mock } from '../typechain-types'
import { verify } from '../utils/verify'

const FUND_AMOUNT = "1000000000000000000000"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, network, ethers } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  log('Chain ID: ' + chainId)
  let vrfCoordinatorV2Address: string, subscriptionId: string, vrfCoordinatorV2: VRFCoordinatorV2Mock
  if (chainId == 31337) {
    vrfCoordinatorV2 = await ethers.getContract('VRFCoordinatorV2Mock')
    vrfCoordinatorV2Address = vrfCoordinatorV2.address
    const transactionResponse = await vrfCoordinatorV2.createSubscription()
    const transactionReceipt = await transactionResponse.wait(1)
    subscriptionId = transactionReceipt.events[0].args.subId
    await vrfCoordinatorV2.fundSubscription(subscriptionId, FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[network.config.chainId!]['vrfCoordinatorV2']
    subscriptionId = networkConfig[network.config.chainId!]['subscriptionId']
  }

  const entranceFee = networkConfig[network.config.chainId!]['raffleEntranceFee']
  const gasLane = networkConfig[network.config.chainId!]['gasLane']
  const callbackGasLimit = networkConfig[network.config.chainId!]['callbackGasLimit']
  const interval = networkConfig[network.config.chainId!]['interval']
  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval,
  ]
  const raffle = await deploy('Raffle', {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: chainId == 31337 ? 1 : 6,
  })

  //Reuse contract to verify separately
  //const raffle = await ethers.getContract('Raffle', deployer)
  //console.log(`Raffle contract address ${raffle.address}`)
  log('-------------------------------------------------')


  if (chainId == 31337) {
    await vrfCoordinatorV2.addConsumer(subscriptionId, raffle.address);
  }
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(raffle.address, args)
  }
}

module.exports.tags = ['all', 'raffle']

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { BigNumber } from 'ethers'
import { network, ethers } from 'hardhat'
import { developmentChains } from '../../helper-hardhat-config'
import { Raffle } from '../../typechain-types'

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Staging Tests', function () {
      let raffle: Raffle
      let raffleEntranceFee: BigNumber
      let accounts: SignerWithAddress[]
      let deployer: SignerWithAddress

      beforeEach(async () => {
        accounts = await ethers.getSigners() // could also do with getNamedAccounts
        deployer = accounts[0]
        console.log(`Deployer ${deployer.address}`)
        raffle = await ethers.getContract('Raffle', deployer)
        console.log(`Contract ${raffle.address}`)
        raffleEntranceFee = await raffle.getEntranceFee()
      })

      describe('fulfillRandomWords', function () {
        it('works with live Chainlink Keepers and Chainlink VRF ', async () => {
          const startingTimeStamp = await raffle.getLatestTimestamp()

          // This will be more important for our staging tests...
          await new Promise<void>(async (resolve, reject) => {
            raffle.once('WinnerPicked', async () => {
              console.log('WinnerPicked event fired!')
              // assert throws an error if it fails, so we need to wrap
              // it in a try/catch so that the promise returns event
              // if it fails.
              try {
                // Now lets get the ending values...
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await raffle.getLatestTimestamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0].address)
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString(),
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (e) {
                reject(e)
              }
            })

            console.log('Entering raffle with ' + raffleEntranceFee)
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
            const receipt = await tx.wait(1)
            console.log('Entered. Waiting now')
            const winnerStartingBalance = await accounts[0].getBalance()
            console.log(`Winner starting balance ${winnerStartingBalance}`)
          })
        })
      })
    })
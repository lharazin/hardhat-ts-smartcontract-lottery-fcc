export const networkConfig = {
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",        
        raffleEntranceFee: "100000000000000000", // 0.1 ETH
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "5753",
        callbackGasLimit: "500000",
        interval: "30"
    },
    31337: {
        name: "localhost",        
        raffleEntranceFee: "100000000000000000", // 0.1 ETH
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        interval: "30"
    }
}

export const developmentChains = ["hardhat", "localhost"];
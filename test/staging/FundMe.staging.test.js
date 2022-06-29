
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert,expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");



developmentChains.includes(network.name) 
    ?   describe.skip 
    :    describe("FundMe", () => {

    let fundMe, deployer;
    // we are hardcoding to send 0.1 ETH (can also write as 100000000000000000)
    const sendValue = ethers.utils.parseEther("0.08");

    
    beforeEach(async function(){
        
        // getting an account to test functionality
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer); 

    });
    // some problem with the code (withdraw throws an error)
    it("allows people to fund and withdraw",async () => {
        await fundMe.fund({value: sendValue});
        await fundMe.withdraw();

        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), 0);
    });

    
    // can use this function if the withdraw is stuck from the above function
    /*
    it("Withdraw Eth from a single founder", async () => {
            
        // Arrange
        // storing the starting balances
        const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer);
        
        // Act
        // withdrawing funds
        const trasactionResponse = await fundMe.withdraw();
        const trasactionReceipt = await trasactionResponse.wait(1);

        // calculating the gas used by deployer to send the trx
        const {gasUsed, effectiveGasPrice} = trasactionReceipt;
        // gasUsed * effectiveGasPrice = total gas spent
        const gasCost = gasUsed.mul(effectiveGasPrice);

        // string the ending balances
        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
        
        // Assert 
        // cheching if the ending balance of Fundme is 0 (withdraw works)
        assert.equal(endingFundMeBalance, 0);

        // checking startingFundmeBalnace + startingDeployerBalance = endingDeployerBalance + gasCost
        assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), 
        endingDeployerBalance.add(gasCost).toString());

    });
    */
});
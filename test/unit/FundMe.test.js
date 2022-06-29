// functions in describe should not be async
// (add describes for almost every function including constructor/modifier)
const { developmentChains } = require("../../helper-hardhat-config");

const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert,expect } = require("chai");

// This describe is for testing the whole FundMe contract
!developmentChains.includes(network.name) 
    ?   describe.skip 
    :   describe("FundMe", () => {

    let fundMe, deployer, mockV3Aggregator;
    // we are hardcoding to send 1 ETH (can also write as 1000000000000000000)
    const sendValue = ethers.utils.parseEther("1");

    // this BeforeEach() sets-up a FundMe contract
    beforeEach(async function(){
        
        // getting an account to test functionality
        deployer = (await getNamedAccounts()).deployer; 

        /* can acheive the same functionality by doing the following
        const accounts = await ethers.getSigners();
        const accountZero = accounts[0];
        */

        // deploying FundMe using Hardhat-deploy 
        // (added all tag with every deploy scripts so that we can run test efficiently)
        await deployments.fixture(["all"]);

        // this is going to give us recently deployed FundMe contract 
        fundMe = await ethers.getContract("FundMe", deployer); 
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);

    });

    // this describe tests the construtor fi it sets the Mock address correctly
    describe("constructor", () => {
        it("Sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
        })

    })
    // this describe tests the fund()
    describe("fund", async () => {
        // we want this function to fail (reverted) id enough ETH is not sent
        // we'll tell the compiler to expect the function to fail
        it("Fails if you don't send enough ETH",async () => {
            // the string is copied from the fund() 
            // (if the string is not same than it will throw some other error)
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH! (more than $50 in ETH)");
        });

        it("Updates the amount funded data structure", async () => {
            // funding 1 ETH
            await fundMe.fund({value: sendValue});
            
            // saving the 1 ETH in response
            const response = await fundMe.getAddressToAmountFunded(deployer);
            
            // checking if 1 ETH was sent to response (deployer)
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to the array of funders", async () => {
            // funding 1 ETH
            await fundMe.fund({value: sendValue});
            
            // saving the funder at 0 index
            const funder = await fundMe.getFunder(0);
            
            // the deployer should be the funder (in this case)
            assert.equal(funder, deployer);
        });
    });

    describe("withdraw", async () => {
        // this beforeEach() funds the contract so that we can withdraw
        beforeEach(async () => {
            // sends the contract 1 ETH
            await fundMe.fund({value: sendValue});
        });

        // only the deployer funded the contract
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


        it("Allows us to withdraw with multiple funders", async () => {
            const accounts = await ethers.getSigners();

            for (let i = 1; i < 6 ; i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value: sendValue});
            }

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

            // making sure funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for( i = 1; i < 6; i++ ){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
            }

        });

        it("Only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");
        });


        it("CheaperWithdraw with multiple funders to check how less gas it used", async () => {
            const accounts = await ethers.getSigners();

            for (let i = 1; i < 6 ; i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value: sendValue});
            }

            // storing the starting balances
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

            // Act
            // withdrawing funds
            const trasactionResponse = await fundMe.cheaperWithdraw();
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

            // making sure funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for( i = 1; i < 6; i++ ){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
            }

        });

    });
    
});
const {getNamedAccount, ethers} = require("hardhat");

async function main(){
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding...");
    const trasactionResponse = await fundMe.withdraw();
    await trasactionResponse.wait(1);
    console.log("Got it Back!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
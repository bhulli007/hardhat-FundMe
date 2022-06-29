const {run} = require("hardhat");


// function to verify contract on etherscan
async function verify(contractAddress, args){
  console.log("verifying contract... ");
  // using try catch because etherscan can throw an error 
  // because seeing the byte code it can easily see that it's a simple storage contract 
  // and it will be verified automatically

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
  });
  } 
  catch (e){
    if(e.message.toLowerCase().includes("already verified")){
        console.log("Already Verified");
    }
    else
    {
        console.log(e);
    }
  }
}

  module.exports = {verify};
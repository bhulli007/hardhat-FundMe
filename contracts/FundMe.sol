// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// style guides
// error NotOwner();

// to increase readability and to know which contract is throwing the error
error FundMe__NotOwner();

// netspec example (used for documentation for other developers that'll work on your code)
// have to include every contract/function

/** @title A contract for crowd funding
* @author Blockchainbull.eth
* @notice This contract is to demo a sample funding contract
* @dev This implements price feeds as our library
*/

contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface public s_priceFeed;     

    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    /* Ether is sent to contract
          is msg.data empty?
              /   \ 
             yes  no
             /     \
        receive()?  fallback() 
         /   \ 
       yes   no
      /        \
    receive()  fallback()
    */

    /*
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
    */

    // can add @param for parameters of the function
    // can add @return for what the function returns 
    /** 
    *   @notice This function funds this contract
    *   @dev note for other devs
    */

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH! (more than $50 in ETH)");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    function withdraw() public onlyOwner payable  {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool Success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(Success, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner payable {
        address[] memory funders = s_funders;
        // mappings can't be in memory

        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }        

        s_funders = new address[](0);

        (bool Success, ) = i_owner.call{value: address(this).balance}("");
        require(Success, "Call failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}




// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashMarketEscrow {
    
    address public owner; 
    uint256 public feePercent = 10; // SET TO 10% (Matches LaborX Standard)

    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        State state;
    }

    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETED, REFUNDED }
    mapping(uint256 => Order) public orders;

    event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 amount);
    event OrderCompleted(uint256 indexed orderId, uint256 sellerPayout, uint256 platformFee);

    constructor() {
        owner = msg.sender; // Your wallet gets the fees
    }

    // 1. Buyer Deposits Funds (Full Price)
    function createOrder(uint256 orderId, address payable _seller) external payable {
        require(msg.value > 0, "Price must be greater than 0");
        require(_seller != address(0), "Invalid seller address");

        orders[orderId] = Order({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            state: State.AWAITING_DELIVERY
        });

        emit OrderCreated(orderId, msg.sender, _seller, msg.value);
    }

    // 2. Buyer Confirms Delivery -> You Get Paid
    function confirmDelivery(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(msg.sender == order.buyer, "Only buyer can confirm");
        require(order.state == State.AWAITING_DELIVERY, "Invalid state");

        order.state = State.COMPLETED;

        // --- PROFIT CALCULATION (LaborX Model) ---
        // Example: Order is 1.0 ETH
        // Platform Fee = 0.1 ETH (10%)
        // Seller Gets = 0.9 ETH
        uint256 platformFee = (order.amount * feePercent) / 100;
        uint256 sellerPayout = order.amount - platformFee;

        // Transfer Payouts
        payable(order.seller).transfer(sellerPayout); // Send 90% to Seller
        payable(owner).transfer(platformFee);         // Send 10% to YOU

        emit OrderCompleted(orderId, sellerPayout, platformFee);
    }

    // Ability to change fee later (Capped at 20% for safety)
    function setFee(uint256 _fee) external {
        require(msg.sender == owner, "Only owner");
        require(_fee <= 20, "Fee too high"); 
        feePercent = _fee;
    }
}
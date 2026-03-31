import type { Level } from '@/types';

const level: Level = {
  id: 5,
  title: 'Force Feeding ETH / Selfdestruct',
  slug: 'selfdestruct',
  difficulty: 'Hard',
  category: 'Denial of Service',
  description:
    'Contracts that rely on address(this).balance for critical logic are vulnerable to manipulation. The selfdestruct opcode forces ETH to a target address without triggering its receive() or fallback() function. This means a contract cannot refuse incoming ETH from selfdestruct, and any invariant based on the contract\'s exact balance can be broken.',
  objective:
    'Break the EtherGame contract by force-sending ETH via selfdestruct, making it impossible for any player to reach the target balance and claim the winner prize.',
  vulnerableContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherGame {
    uint256 public constant TARGET_AMOUNT = 7 ether;
    address public winner;

    function deposit() public payable {
        require(msg.value == 1 ether, "You can only send 1 Ether");
        require(address(this).balance <= TARGET_AMOUNT, "Game is over");

        // Vulnerability: relies on address(this).balance for game logic
        // An attacker can force-send ETH to break this invariant
        if (address(this).balance == TARGET_AMOUNT) {
            winner = msg.sender;
        }
    }

    function claimReward() public {
        require(msg.sender == winner, "Not winner");

        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  attackContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SelfdestructAttack {
    // Receives ETH from the attacker
    constructor() payable {}

    // Force-sends all ETH to the target via selfdestruct
    // The target cannot reject this ETH -- no fallback or receive is called
    function attack(address payable _target) external {
        selfdestruct(_target);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  hints: [
    'The game checks address(this).balance == TARGET_AMOUNT to determine the winner. Is there a way to change a contract\'s balance without calling its functions?',
    'The selfdestruct opcode sends all remaining ETH to a specified address and removes the contract. The target address receives the ETH without any code execution. Can you use this to push the balance past the target?',
    'Deploy an attack contract with some ETH, then call selfdestruct(targetAddress). This forces ETH into EtherGame, pushing its balance above 7 ETH. Now address(this).balance can never equal exactly 7 ETH through normal deposits, so no one can ever become the winner.',
  ],
  solution:
    'Deploy the SelfdestructAttack contract with enough ETH (e.g., 5 ETH). Call attack() with the EtherGame address. selfdestruct sends all ETH to EtherGame without triggering any function. If EtherGame had 3 ETH from normal deposits, it now has 8 ETH. The balance exceeds TARGET_AMOUNT (7 ETH), so the require(address(this).balance <= TARGET_AMOUNT) check will fail for all future deposits. The balance can never equal exactly 7 ETH, so no winner can ever be set. The game is permanently broken.',
  explanation:
    'The fundamental issue is relying on address(this).balance as a trusted state variable. In Ethereum, there are multiple ways to forcibly send ETH to a contract: (1) selfdestruct -- sends all remaining ETH to any address without calling the recipient\'s code, (2) block rewards -- a miner/validator can set any address as the coinbase recipient, (3) pre-calculated address -- ETH can be sent to a contract address before it is even deployed. Because the contract cannot prevent or account for these forced deposits, any logic that depends on the exact balance (like == checks) or assumes balance only changes through its own functions is unreliable. The fix is to track deposits with an internal state variable instead of reading from address(this).balance.',
  secureCoding: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherGameSecure {
    uint256 public constant TARGET_AMOUNT = 7 ether;
    address public winner;

    // Fix: Track deposits internally instead of using address(this).balance
    uint256 public depositedAmount;

    function deposit() public payable {
        require(msg.value == 1 ether, "You can only send 1 Ether");
        require(depositedAmount < TARGET_AMOUNT, "Game is over");

        depositedAmount += msg.value;

        // Uses internal accounting, not manipulable via selfdestruct
        if (depositedAmount == TARGET_AMOUNT) {
            winner = msg.sender;
        }
    }

    function claimReward() public {
        require(msg.sender == winner, "Not winner");

        uint256 amount = address(this).balance;
        depositedAmount = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getDepositedAmount() public view returns (uint256) {
        return depositedAmount;
    }
}`,
  realWorldImpact:
    'Multiple DeFi protocols have been affected by forced ETH attacks. Contracts that use strict balance checks for access control, game logic, or distribution calculations are all at risk. While selfdestruct-based attacks are less commonly seen as headline hacks, they represent a broader class of assumption violations. The Ethereum community has discussed deprecating selfdestruct (EIP-4758), but even without it, contracts must not assume they control their own balance. This pattern has caused issues in prediction markets, lottery contracts, and various DeFi vaults that used balance-based accounting.',
  moduleMapping: 'Module 3.1 Web Application Vulnerabilities',
  attackSteps: [
    {
      title: 'Understand the Game Mechanics',
      description:
        'The EtherGame contract allows players to deposit exactly 1 ETH per transaction. The 7th depositor triggers address(this).balance == 7 ether and wins the prize. The contract relies on its own balance to track the game state.',
      stateChange: 'Reconnaissance: balance-dependent logic identified',
    },
    {
      title: 'Deploy the Attack Contract',
      description:
        'The attacker deploys SelfdestructAttack with ETH attached. For example, deploying with 5 ETH.',
      code: 'SelfdestructAttack attacker = new SelfdestructAttack{value: 5 ether}();',
      stateChange: 'Attack contract deployed with 5 ETH',
    },
    {
      title: 'Force-Send ETH via selfdestruct',
      description:
        'The attacker calls attack() targeting the EtherGame contract. selfdestruct destroys the attack contract and force-sends all its ETH to EtherGame. No function on EtherGame is called.',
      code: 'attacker.attack(payable(address(etherGame)));',
      stateChange: 'EtherGame balance: 3 ETH -> 8 ETH (forced, bypassing deposit logic)',
    },
    {
      title: 'Game is Permanently Broken',
      description:
        'EtherGame now holds 8 ETH but no winner was set. Future deposits fail because address(this).balance > TARGET_AMOUNT. The balance can never equal exactly 7 ETH through the deposit function. No player can ever win.',
      stateChange: 'Game state: active -> permanently stuck. Deposited funds are locked forever.',
    },
    {
      title: 'Denial of Service Complete',
      description:
        'All ETH deposited by legitimate players is trapped in the contract with no way to withdraw it. The winner variable remains address(0), so claimReward() is also unusable.',
      stateChange: 'All player funds locked. Contract is bricked.',
    },
  ],
};

export default level;

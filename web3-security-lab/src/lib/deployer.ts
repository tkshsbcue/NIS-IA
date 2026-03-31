import { ContractFactory, Contract } from 'ethers';
import type { InterfaceAbi, Signer, TransactionResponse } from 'ethers';

export async function deployContract(
  abi: unknown[],
  bytecode: string,
  signer: Signer,
  constructorArgs: unknown[] = [],
): Promise<Contract> {
  const factory = new ContractFactory(abi as InterfaceAbi, bytecode, signer);
  const contract = await factory.deploy(...constructorArgs);
  await contract.waitForDeployment();
  return contract as Contract;
}

export async function callContractFunction(
  contract: Contract,
  functionName: string,
  args: unknown[],
  value?: string,
): Promise<TransactionResponse> {
  const overrides = value ? { value } : {};
  const tx: TransactionResponse = await contract[functionName](...args, overrides);
  return tx;
}

export async function getContractState(
  contract: Contract,
  functionName: string,
  args: unknown[] = [],
): Promise<unknown> {
  const result: unknown = await contract[functionName](...args);
  return result;
}

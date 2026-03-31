import { useCallback } from 'react';
import { Contract, ContractFactory } from 'ethers';
import type { InterfaceAbi } from 'ethers';
import { useStore } from '@/store';
import { compileSolidity } from '@/lib/compiler';
import type { CompilationResult } from '@/types';

export function useCompiler() {
  const { addConsoleMessage, setCompilationResult } = useStore();

  const compile = useCallback(
    async (source: string): Promise<CompilationResult> => {
      addConsoleMessage({ type: 'info', message: 'Compiling Solidity source...' });

      let result: CompilationResult;

      // Try real solc compilation via Web Worker if available
      try {
        result = await new Promise<CompilationResult>((resolve, reject) => {
          // Attempt to create a Web Worker for solc compilation
          const workerCode = `
            self.onmessage = async function(e) {
              try {
                const solc = await import('solc');
                const input = {
                  language: 'Solidity',
                  sources: { 'contract.sol': { content: e.data } },
                  settings: {
                    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
                  },
                };
                const output = JSON.parse(solc.compile(JSON.stringify(input)));
                self.postMessage(output);
              } catch (err) {
                self.postMessage({ error: err.message });
              }
            };
          `;
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const worker = new Worker(URL.createObjectURL(blob), { type: 'module' });

          const timeout = setTimeout(() => {
            worker.terminate();
            reject(new Error('solc_unavailable'));
          }, 3000);

          worker.onmessage = (e: MessageEvent) => {
            clearTimeout(timeout);
            worker.terminate();
            const output = e.data as Record<string, unknown>;

            if (output.error) {
              reject(new Error('solc_unavailable'));
              return;
            }

            const errors: string[] = [];
            const warnings: string[] = [];
            if (output.errors) {
              for (const err of output.errors as Array<{ severity: string; formattedMessage: string }>) {
                if (err.severity === 'error') errors.push(err.formattedMessage);
                else warnings.push(err.formattedMessage);
              }
            }

            if (errors.length > 0) {
              resolve({ success: false, errors, warnings });
              return;
            }

            const contracts = (output.contracts as Record<string, Record<string, Record<string, unknown>>> | undefined)?.['contract.sol'];
            if (contracts) {
              const contractName = Object.keys(contracts)[0];
              const compiled = contracts[contractName] as Record<string, unknown>;
              const evm = compiled.evm as Record<string, Record<string, unknown>> | undefined;
              resolve({
                success: true,
                errors: [],
                warnings,
                abi: compiled.abi as unknown[],
                bytecode: '0x' + (evm?.bytecode?.object ?? ''),
                contractName,
              });
            } else {
              reject(new Error('solc_unavailable'));
            }
          };

          worker.onerror = () => {
            clearTimeout(timeout);
            worker.terminate();
            reject(new Error('solc_unavailable'));
          };

          worker.postMessage(source);
        });
      } catch {
        // Fallback to simulated compilation
        addConsoleMessage({
          type: 'warning',
          message: 'solc not available in browser, using simulated compilation.',
        });
        result = await compileSolidity(source);
      }

      setCompilationResult(result);

      if (result.success) {
        addConsoleMessage({
          type: 'success',
          message: `Compiled ${result.contractName ?? 'contract'} successfully.`,
        });
        for (const w of result.warnings) {
          addConsoleMessage({ type: 'warning', message: w });
        }
      } else {
        for (const err of result.errors) {
          addConsoleMessage({ type: 'error', message: err });
        }
      }

      return result;
    },
    [addConsoleMessage, setCompilationResult],
  );

  const deploy = useCallback(
    async (
      abi: unknown[],
      bytecode: string,
      signer: import('ethers').Signer,
      constructorArgs: unknown[] = [],
    ): Promise<Contract | null> => {
      try {
        addConsoleMessage({ type: 'info', message: 'Deploying contract...' });

        const factory = new ContractFactory(abi as InterfaceAbi, bytecode, signer);
        const contract = await factory.deploy(...constructorArgs);
        const deployed = await contract.waitForDeployment();
        const address = await deployed.getAddress();

        addConsoleMessage({
          type: 'success',
          message: `Contract deployed at ${address}`,
        });

        return deployed as Contract;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        addConsoleMessage({
          type: 'error',
          message: `Deployment failed: ${msg}`,
        });
        return null;
      }
    },
    [addConsoleMessage],
  );

  const interactWithContract = useCallback(
    async (
      address: string,
      abi: unknown[],
      functionName: string,
      args: unknown[],
      signer?: import('ethers').Signer,
      value?: string,
    ): Promise<unknown> => {
      try {
        addConsoleMessage({
          type: 'info',
          message: `Calling ${functionName}(${args.map(String).join(', ')})...`,
        });

        const contract = new Contract(address, abi as InterfaceAbi, signer);
        const overrides = value ? { value } : {};
        const result: unknown = await contract[functionName](...args, overrides);

        // Check if it's a transaction response
        if (
          result !== null &&
          typeof result === 'object' &&
          'wait' in (result as Record<string, unknown>)
        ) {
          const tx = result as import('ethers').TransactionResponse;
          addConsoleMessage({
            type: 'tx',
            message: `Transaction sent: ${tx.hash}`,
            txHash: tx.hash,
          });
          await tx.wait();
          addConsoleMessage({
            type: 'success',
            message: `Transaction confirmed: ${tx.hash}`,
            txHash: tx.hash,
          });
          return tx;
        }

        addConsoleMessage({
          type: 'success',
          message: `Result: ${String(result)}`,
        });
        return result;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        addConsoleMessage({
          type: 'error',
          message: `Call to ${functionName} failed: ${msg}`,
        });
        return null;
      }
    },
    [addConsoleMessage],
  );

  return { compile, deploy, interactWithContract };
}

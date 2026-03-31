import type { CompilationResult } from '@/types';

interface ParsedFunction {
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  stateMutability: string;
}

interface ParsedEvent {
  name: string;
  inputs: { name: string; type: string; indexed: boolean }[];
}

function extractContractName(source: string): string | null {
  const match = source.match(/contract\s+(\w+)\s*(?:is\s+[^{]+)?\s*\{/);
  return match ? match[1] : null;
}

function extractFunctions(source: string): ParsedFunction[] {
  const functions: ParsedFunction[] = [];
  const funcRegex =
    /function\s+(\w+)\s*\(([^)]*)\)\s*((?:public|external|internal|private)\s*)?(?:(?:view|pure)\s*)?(?:(?:payable)\s*)?(?:returns\s*\(([^)]*)\))?/g;

  let match: RegExpExecArray | null;
  while ((match = funcRegex.exec(source)) !== null) {
    const name = match[1];
    const inputsRaw = match[2].trim();
    const outputsRaw = match[4]?.trim() ?? '';

    const inputs = inputsRaw
      ? inputsRaw.split(',').map((p) => {
          const parts = p.trim().split(/\s+/);
          const type = parts[0];
          const paramName = parts[parts.length - 1] === type ? '' : parts[parts.length - 1];
          return { name: paramName, type };
        })
      : [];

    const outputs = outputsRaw
      ? outputsRaw.split(',').map((p) => {
          const parts = p.trim().split(/\s+/);
          const type = parts[0];
          const paramName = parts.length > 1 ? parts[parts.length - 1] : '';
          return { name: paramName, type };
        })
      : [];

    const stateMutability = source
      .slice(match.index, match.index + match[0].length)
      .includes('payable')
      ? 'payable'
      : source.slice(match.index, match.index + match[0].length).includes('view')
        ? 'view'
        : source.slice(match.index, match.index + match[0].length).includes('pure')
          ? 'pure'
          : 'nonpayable';

    functions.push({ name, inputs, outputs, stateMutability });
  }

  return functions;
}

function extractEvents(source: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const eventRegex = /event\s+(\w+)\s*\(([^)]*)\)/g;

  let match: RegExpExecArray | null;
  while ((match = eventRegex.exec(source)) !== null) {
    const name = match[1];
    const paramsRaw = match[2].trim();

    const inputs = paramsRaw
      ? paramsRaw.split(',').map((p) => {
          const parts = p.trim().split(/\s+/);
          const indexed = parts.includes('indexed');
          const type = parts[0];
          const paramName = parts[parts.length - 1];
          return {
            name: paramName === type || paramName === 'indexed' ? '' : paramName,
            type,
            indexed,
          };
        })
      : [];

    events.push({ name, inputs });
  }

  return events;
}

function buildAbi(
  functions: ParsedFunction[],
  events: ParsedEvent[],
  source: string,
): unknown[] {
  const abi: unknown[] = [];

  // Check for constructor
  const ctorMatch = source.match(/constructor\s*\(([^)]*)\)/);
  if (ctorMatch) {
    const paramsRaw = ctorMatch[1].trim();
    const inputs = paramsRaw
      ? paramsRaw.split(',').map((p) => {
          const parts = p.trim().split(/\s+/);
          return { name: parts[parts.length - 1], type: parts[0] };
        })
      : [];
    abi.push({
      type: 'constructor',
      inputs,
      stateMutability: source.includes('constructor') && source.includes('payable')
        ? 'payable'
        : 'nonpayable',
    });
  }

  for (const fn of functions) {
    abi.push({
      type: 'function',
      name: fn.name,
      inputs: fn.inputs,
      outputs: fn.outputs,
      stateMutability: fn.stateMutability,
    });
  }

  for (const event of events) {
    abi.push({
      type: 'event',
      name: event.name,
      inputs: event.inputs.map((inp) => ({
        name: inp.name,
        type: inp.type,
        indexed: inp.indexed,
      })),
    });
  }

  // Add receive/fallback if present
  if (/receive\s*\(\s*\)\s*external\s*payable/.test(source)) {
    abi.push({ type: 'receive', stateMutability: 'payable' });
  }
  if (/fallback\s*\(\s*\)/.test(source)) {
    abi.push({ type: 'fallback', stateMutability: 'payable' });
  }

  return abi;
}

function generatePlaceholderBytecode(contractName: string): string {
  // Generate a deterministic placeholder bytecode based on contract name
  const encoder = new TextEncoder();
  const bytes = encoder.encode(contractName);
  let hex = '0x6080604052';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  // Pad to a reasonable length
  while (hex.length < 200) {
    hex += '00';
  }
  return hex;
}

function checkForErrors(source: string): string[] {
  const errors: string[] = [];

  if (!source.trim()) {
    errors.push('Empty source code');
    return errors;
  }

  // Check for pragma
  if (!/pragma\s+solidity/.test(source)) {
    errors.push('Warning: No pragma directive found');
  }

  // Check for unbalanced braces
  const openBraces = (source.match(/\{/g) ?? []).length;
  const closeBraces = (source.match(/\}/g) ?? []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Syntax error: Unbalanced braces (${openBraces} open, ${closeBraces} close)`);
  }

  // Check for contract declaration
  if (!/contract\s+\w+/.test(source)) {
    errors.push('No contract declaration found');
  }

  return errors;
}

function checkForWarnings(source: string): string[] {
  const warnings: string[] = [];

  if (/tx\.origin/.test(source)) {
    warnings.push('Warning: Use of tx.origin detected. Consider using msg.sender instead.');
  }

  if (/selfdestruct/.test(source)) {
    warnings.push('Warning: selfdestruct is deprecated in newer Solidity versions.');
  }

  if (/delegatecall/.test(source)) {
    warnings.push('Warning: delegatecall detected. Ensure proper access control.');
  }

  return warnings;
}

export async function compileSolidity(source: string): Promise<CompilationResult> {
  const errors = checkForErrors(source);

  if (errors.some((e) => !e.startsWith('Warning:'))) {
    return {
      success: false,
      errors,
      warnings: [],
    };
  }

  const contractName = extractContractName(source);
  if (!contractName) {
    return {
      success: false,
      errors: ['Could not extract contract name from source'],
      warnings: [],
    };
  }

  const warnings = checkForWarnings(source);
  const functions = extractFunctions(source);
  const events = extractEvents(source);
  const abi = buildAbi(functions, events, source);
  const bytecode = generatePlaceholderBytecode(contractName);

  return {
    success: true,
    errors: [],
    warnings,
    abi,
    bytecode,
    contractName,
  };
}

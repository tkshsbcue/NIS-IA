import type { Level } from '@/types';
import level1 from './level1-reentrancy';
import level2 from './level2-ownership';
import level3 from './level3-delegatecall';
import level4 from './level4-overflow';
import level5 from './level5-selfdestruct';

export const levels: Level[] = [level1, level2, level3, level4, level5];

export function getLevelById(id: number): Level | undefined {
  return levels.find((l) => l.id === id);
}

export default levels;

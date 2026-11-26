import { describe, test, expect } from 'vitest';
import { mergeQueues } from './mergeQueues';
import { DepartmentQueue } from '../types';

describe('K‑way merge algorithm', () => {
  test('sample dataset merges correctly', () => {
    const depts: DepartmentQueue[] = [
      { code: 'A', jobs: [
        { id: 'A2', timestamp: 2, originalPos: 0 },
        { id: 'A7', timestamp: 7, originalPos: 1 },
        { id: 'A9', timestamp: 9, originalPos: 2 },
      ]},
      { code: 'B', jobs: [
        { id: 'B1', timestamp: 1, originalPos: 0 },
        { id: 'B7', timestamp: 7, originalPos: 1 },
      ]},
      { code: 'C', jobs: [
        { id: 'C3', timestamp: 3, originalPos: 0 },
        { id: 'C10', timestamp: 10, originalPos: 1 },
      ]},
    ];
    const result = mergeQueues(depts);
    const ids = result.map(j => j.id);
    expect(ids).toEqual(['B1', 'A2', 'C3', 'A7', 'B7', 'A9', 'C10']);
  });

  test('preserves order within a department with equal timestamps', () => {
    const depts: DepartmentQueue[] = [
      { code: 'X', jobs: [
        { id: 'X1', timestamp: 5, originalPos: 0 },
        { id: 'X2', timestamp: 5, originalPos: 1 },
        { id: 'X3', timestamp: 5, originalPos: 2 },
      ]},
      { code: 'Y', jobs: [
        { id: 'Y1', timestamp: 5, originalPos: 0 },
        { id: 'Y2', timestamp: 5, originalPos: 1 },
      ]},
    ];
    const result = mergeQueues(depts);
    const ids = result.map(j => j.id);
    // Department code lexicographic order first, then original position
    expect(ids).toEqual(['X1', 'X2', 'X3', 'Y1', 'Y2']);
  });

  test('handles empty departments gracefully', () => {
    const depts: DepartmentQueue[] = [
      { code: 'A', jobs: [] },
      { code: 'B', jobs: [{ id: 'B1', timestamp: 1, originalPos: 0 }] },
    ];
    const result = mergeQueues(depts);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('B1');
  });

  test('large random dataset maintains all jobs and order', () => {
    const K = 10;
    const jobsPerDept = 1000;
    const depts: DepartmentQueue[] = [];
    for (let i = 0; i < K; i++) {
      const code = String.fromCharCode(65 + i);
      const jobs = [];
      for (let j = 0; j < jobsPerDept; j++) {
        const ts = j; // already sorted
        jobs.push({ id: `${code}${j}`, timestamp: ts, originalPos: j });
      }
      depts.push({ code, jobs });
    }
    const result = mergeQueues(depts);
    expect(result.length).toBe(K * jobsPerDept);
    // verify non‑decreasing timestamps
    for (let i = 1; i < result.length; i++) {
      expect(result[i].timestamp).toBeGreaterThanOrEqual(result[i - 1].timestamp);
    }
  });
});

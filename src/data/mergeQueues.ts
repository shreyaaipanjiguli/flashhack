import { DepartmentQueue, Job } from '../types';
import { LinkedList, ListNode } from './LinkedList';
import { MinHeap } from './MinHeap';

interface HeapItem {
  node: ListNode<Job>;
  department: string;
}

/**
 * K‑way merge using linked lists and a min‑heap.
 * Returns a flat array of jobs in the merged order.
 */
export function mergeQueues(departments: DepartmentQueue[]): Job[] {
  // Build a linked list for each department preserving originalPos
  const lists: Map<string, LinkedList<Job>> = new Map();
  departments.forEach((dept) => {
    // enrich each job with department for later convenience
    const enriched = dept.jobs.map((j, idx) => ({
      ...j,
      originalPos: idx,
      department: dept.code,
    }));
    const ll = LinkedList.fromArray(enriched);
    lists.set(dept.code, ll);
  });

  const comparator = (a: HeapItem, b: HeapItem) => {
    if (a.node.data.timestamp !== b.node.data.timestamp) {
      return a.node.data.timestamp - b.node.data.timestamp;
    }
    if (a.node.data.department !== b.node.data.department) {
      return a.node.data.department < b.node.data.department ? -1 : 1;
    }
    return a.node.data.originalPos - b.node.data.originalPos;
  };

  const heap = new MinHeap<HeapItem>(comparator);

  // Insert head of each non‑empty list
  lists.forEach((list, code) => {
    if (list.head) {
      heap.push({ node: list.head, department: code });
    }
  });

  const result: Job[] = [];

  while (heap.size() > 0) {
    const item = heap.pop();
    if (!item) break;
    const job = item.node.data;
    result.push({
      id: job.id,
      timestamp: job.timestamp,
      originalPos: job.originalPos,
      department: job.department,
    });
    // Advance list
    const next = item.node.next;
    if (next) {
      heap.push({ node: next, department: item.department });
    }
  }

  return result;
}

export interface Job {
  id: string;
  timestamp: number;
  originalPos: number; // position inside its department list
  department?: string; // added later for convenience
}

export interface DepartmentQueue {
  code: string; // department code, e.g., "A"
  jobs: Job[]; // array in input order (already sorted by timestamp)
}

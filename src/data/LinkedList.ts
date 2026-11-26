export class ListNode<T> {
  data: T;
  next: ListNode<T> | null = null;
  constructor(data: T) {
    this.data = data;
  }
}

export class LinkedList<T> {
  head: ListNode<T> | null = null;
  tail: ListNode<T> | null = null;
  size: number = 0;

  // Build list from an array (preserves order)
  static fromArray<U>(arr: U[]): LinkedList<U> {
    const list = new LinkedList<U>();
    for (const item of arr) {
      list.append(item);
    }
    return list;
  }

  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      if (this.tail) this.tail.next = node;
      this.tail = node;
    }
    this.size++;
  }
}

/**
 * Sync Engine Mock for Web Platform
 */

export interface SyncQueueItem {
  id: string;
  operation: 'update' | 'create' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
}

class SyncEngineMock {
  private queue: SyncQueueItem[] = [];

  async addToQueue(
    operation: 'update' | 'create' | 'delete',
    collection: string,
    data: any
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: Math.random().toString(36),
      operation,
      collection,
      data,
      timestamp: Date.now(),
    };
    this.queue.push(item);
    console.log('[Sync Queue Mock]', 'Added to queue:', item);
  }

  async processQueue(): Promise<void> {
    console.log('[Sync Queue Mock]', `Processing ${this.queue.length} items`);
    this.queue = [];
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }
}

export const syncEngine = new SyncEngineMock();

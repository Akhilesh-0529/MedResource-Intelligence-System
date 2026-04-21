// SyncManager handles offline mutation requests and replays them when online

const SYNC_QUEUE_KEY = 'smartalloc_sync_queue';

class SyncManager {
  constructor() {
    this.queue = this.getQueue();
    this.api = null;
    this.getConnectionStatus = () => true;
    this.isProcessing = false;

    // Fallback native event listener
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }

  init(apiInstance, statusFn, onConnectionChange) {
    this.api = apiInstance;
    this.getConnectionStatus = statusFn;
    
    onConnectionChange((isOnline) => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }



  getQueue() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)) || [];
    } catch {
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch {
      /* ignore */
    }
  }

  // Adds a request (POST/PUT/DELETE) to the queue
  enqueue(method, url, data) {
    const action = {
      id: 'req_' + Date.now() + Math.random().toString(36).substring(7),
      method,
      url,
      data,
      timestamp: Date.now()
    };
    
    // Auto-inject a clientId for Idempotency if not present
    if (data && typeof data === 'object' && !data.clientId) {
        action.data.clientId = 'client_' + Date.now();
    }
    
    this.queue.push(action);
    this.saveQueue();
    
    // Return the generated action data so Optimistic UI has an ID
    return action.data; 
  }

  // Attempts to replay all queued actions
  async processQueue() {
    if (this.queue.length === 0) return;
    if (this.getConnectionStatus && !this.getConnectionStatus()) return;
    if (this.isProcessing) return;

    this.isProcessing = true;

    console.log(`[SyncManager] Replaying ${this.queue.length} offline actions...`);
    const currentQueue = [...this.queue];
    
    // Clear out the queue in local storage so we don't double process
    this.queue = [];
    this.saveQueue();

    // Process sequentially
    try {
      for (const action of currentQueue) {
        try {
          if (!this.api) throw new Error("SyncManager API not initialized");
          await this.api.request({
            method: action.method,
            url: action.url,
            data: action.data,
            // bypass the offline interceptor check
            headers: { 'X-Sync-Replay': 'true' } 
          });
          console.log(`[SyncManager] Successfully synced action ${action.id}`);
        } catch (err) {
          console.error(`[SyncManager] Failed to sync action ${action.id}`, err);
          // If it was a network error, re-queue it. Otherwise (400, 500), drop it
          if (!err.response) {
              this.queue.push(action);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
    
    this.saveQueue();
  }
}

export const syncManager = new SyncManager();

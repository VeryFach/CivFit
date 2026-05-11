import { sqlite } from '../../platform/storage/sqlite/db';
import { db, auth } from '../../platform/api/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export interface SyncAction {
  id?: number;
  actionType: string;
  payload: any;
  timestamp?: string;
}

class SyncEngine {
  private isSyncing = false;

  /**
   * Queue an action to be synced with Firestore
   */
  async queueAction(type: string, payload: any) {
    console.log(`[SyncEngine] Queuing action: ${type}`);
    await sqlite.execute(
      'INSERT INTO offline_queue (action_type, payload) VALUES (?, ?)',
      [type, JSON.stringify(payload)]
    );
    
    // Attempt immediate sync
    this.processQueue();
  }

  /**
   * Process the offline queue and sync with Firestore
   */
  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const queue = await sqlite.query<SyncAction>('SELECT * FROM offline_queue ORDER BY id ASC');
      
      for (const action of queue) {
        try {
          await this.syncToFirestore(user.uid, action);
          // If successful, remove from queue
          await sqlite.execute('DELETE FROM offline_queue WHERE id = ?', [action.id]);
        } catch (error) {
          console.error(`[SyncEngine] Failed to sync action ${action.id}:`, error);
          // Stop processing if we hit a network error
          break;
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncToFirestore(userId: string, action: SyncAction) {
    const payload = JSON.parse(action.payload as any);
    
    switch (action.actionType) {
      case 'UPDATE_PROFILE':
        await setDoc(doc(db, 'users', userId), { 
          ...payload, 
          updatedAt: Timestamp.now() 
        }, { merge: true });
        break;
      
      case 'HABIT_SET':
        const hId = payload.id;
        const habitToSave = { ...payload };
        delete habitToSave.id;
        await setDoc(doc(db, 'users', userId, 'habits', hId), {
          ...habitToSave,
          updatedAt: Timestamp.now()
        }, { merge: true });
        break;

      case 'HABIT_DELETE':
        const { habitId: delId } = payload;
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', userId, 'habits', delId));
        break;

      case 'LOG_ADD':
        const { id: logId, ...logData } = payload;
        await setDoc(doc(db, 'users', userId, 'logs', logId), {
          ...logData,
          timestamp: Timestamp.now()
        });
        break;
        
      case 'LEADERBOARD_UPDATE':
        await setDoc(doc(db, 'leaderboard', userId), {
          ...payload,
          updatedAt: Timestamp.now()
        }, { merge: true });
        break;

      default:
        console.warn(`[SyncEngine] Unknown action type: ${action.actionType}`);
    }
  }
}

export const syncEngine = new SyncEngine();

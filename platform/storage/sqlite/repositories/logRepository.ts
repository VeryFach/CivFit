import { ActivityLog } from '@/core/types';
import { sqlite } from '../db';

/**
 * Repository for Activity Logs in SQLite
 */
export const logRepository = {
  async add(log: ActivityLog): Promise<void> {
    await sqlite.execute(
      `INSERT INTO activity_logs (id, timestamp, type, message, change_val, unit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [log.id, log.timestamp, log.type, log.message, log.change, log.unit]
    );
  },

  async getRecent(limit: number = 50): Promise<ActivityLog[]> {
    const rows = await sqlite.query<any>(
      'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    return rows.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      type: r.type,
      message: r.message,
      change: r.change_val,
      unit: r.unit
    }));
  },

  async clearOld(keepCount: number = 200): Promise<void> {
    await sqlite.execute(
      `DELETE FROM activity_logs WHERE id NOT IN (
        SELECT id FROM activity_logs ORDER BY timestamp DESC LIMIT ?
      )`,
      [keepCount]
    );
  }
};

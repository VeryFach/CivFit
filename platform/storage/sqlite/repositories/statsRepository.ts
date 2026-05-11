import { UserStats } from '@/core/types';
import { sqlite } from '../db';

/**
 * Repository for User Stats
 */
export const statsRepository = {
  async get(): Promise<UserStats | null> {
    const rows = await sqlite.query<any>('SELECT * FROM user_stats WHERE id = 1');
    if (rows.length === 0) return null;
    
    const s = rows[0];
    return {
      level: s.level,
      exp: s.exp,
      silver: s.silver,
      gold: s.gold,
      hp: s.hp,
      maxHp: s.max_hp,
      momentum: s.momentum,
      dayCount: s.day_count,
      lastEndDay: s.last_end_day,
      maxExp: s.max_exp || 1000,
      lastCelebratedLevel: s.last_celebrated_level || 1,
      badges: JSON.parse(s.badges || '[]'),
      pendingReport: JSON.parse(s.pending_report || 'null'),
      skipTickets: s.skip_tickets || 0,
      unlockedEras: JSON.parse(s.unlocked_eras || '[]')
    };
  },

  async save(stats: UserStats): Promise<void> {
    await sqlite.execute(
      `INSERT OR REPLACE INTO user_stats 
       (id, level, exp, silver, gold, hp, max_hp, momentum, day_count, last_end_day)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stats.level,
        stats.exp,
        stats.silver,
        stats.gold,
        stats.hp,
        stats.maxHp,
        stats.momentum,
        stats.dayCount,
        stats.lastEndDay
      ]
    );
  }
};

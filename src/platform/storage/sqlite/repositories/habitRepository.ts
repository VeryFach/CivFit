import { sqlite } from '../db';
import { Habit } from '../../../../core/types';

/**
 * Repository for Habits in SQLite
 */
export const habitRepository = {
  async getAll(): Promise<Habit[]> {
    const rows = await sqlite.query<any>('SELECT * FROM habits');
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      targetCount: r.target_count,
      goldReward: r.gold_reward,
      expReward: r.exp_reward,
      difficulty: r.difficulty,
      currentStreak: r.current_streak,
      completedDates: JSON.parse(r.completed_dates || '[]'),
      createdAt: r.created_at
    }));
  },

  async save(habit: Habit): Promise<void> {
    await sqlite.execute(
      `INSERT OR REPLACE INTO habits 
       (id, title, type, target_count, gold_reward, exp_reward, difficulty, current_streak, completed_dates, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        habit.id,
        habit.title,
        habit.type,
        habit.targetCount,
        habit.goldReward,
        habit.expReward,
        habit.difficulty,
        habit.currentStreak,
        JSON.stringify(habit.completedDates),
        habit.createdAt
      ]
    );
  },

  async delete(id: string): Promise<void> {
    await sqlite.execute('DELETE FROM habits WHERE id = ?', [id]);
  }
};

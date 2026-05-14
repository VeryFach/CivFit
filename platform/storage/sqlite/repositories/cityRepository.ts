import { CityState, PlacedBuilding } from '@/core/types';
import { sqlite } from '../db';

// ---------------------------------------------------------------------------
// CityRepository - hanya untuk state kota (tanpa buildings)
// ---------------------------------------------------------------------------
export class CityRepository {
  static async saveCity(city: CityState) {
    await sqlite.execute(
      `INSERT OR REPLACE INTO city_state 
       (id, population, population_sick, food, housing, health, happiness, current_era, unlocked_evolutions) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        city.population,
        city.populationSick,
        city.food,
        city.housing,
        city.health,
        city.happiness,
        city.currentEra,
        JSON.stringify(city.unlockedEvolutions || [])
      ]
    );
  }

  static async getCity(): Promise<CityState | null> {
    const cityRow = await sqlite.query<any>('SELECT * FROM city_state WHERE id = 1');
    if (cityRow.length === 0) return null;

    const row = cityRow[0];
    return {
      population: row.population,
      populationSick: row.population_sick,
      food: row.food,
      housing: row.housing,
      health: row.health,
      happiness: row.happiness,
      currentEra: row.current_era,
      unlockedEvolutions: row.unlocked_evolutions ? JSON.parse(row.unlocked_evolutions) : []
    };
  }
}

// ---------------------------------------------------------------------------
// BuildingRepository - untuk subcollection buildings
// ---------------------------------------------------------------------------
export class BuildingRepository {
  static async saveBuilding(building: PlacedBuilding) {
    await sqlite.execute(
      `INSERT OR REPLACE INTO buildings 
       (id, building_type_id, grid_x, grid_y, level, health, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        building.id,
        building.buildingTypeId,
        building.gridX,
        building.gridY,
        building.level,
        building.health,
        building.createdAt
      ]
    );
  }

  static async getAllBuildings(): Promise<PlacedBuilding[]> {
    const rows = await sqlite.query<any>('SELECT * FROM buildings ORDER BY created_at ASC');
    return rows.map(row => ({
      id: row.id,
      buildingTypeId: row.building_type_id,
      gridX: row.grid_x,
      gridY: row.grid_y,
      level: row.level,
      health: row.health,
      createdAt: row.created_at
    }));
  }

  static async deleteBuilding(id: string) {
    await sqlite.execute('DELETE FROM buildings WHERE id = ?', [id]);
  }

  static async deleteAllBuildings() {
    await sqlite.execute('DELETE FROM buildings');
  }

  static async updateBuildingLevel(id: string, newLevel: number) {
    await sqlite.execute('UPDATE buildings SET level = ? WHERE id = ?', [newLevel, id]);
  }

  static async updateBuildingHealth(id: string, newHealth: number) {
    await sqlite.execute('UPDATE buildings SET health = ? WHERE id = ?', [newHealth, id]);
  }
}
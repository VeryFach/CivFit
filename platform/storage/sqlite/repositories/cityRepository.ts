import { CityState } from '@/core/types';
import { sqlite } from '../db';

export class CityRepository {
  static async saveCity(city: CityState) {
    await sqlite.execute(
      `INSERT OR REPLACE INTO city_state 
       (id, population, population_sick, food, housing, health, happiness, current_era) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      [
        city.population, 
        city.populationSick, 
        city.food, 
        city.housing, 
        city.health, 
        city.happiness, 
        city.currentEra
      ]
    );

    // Save buildings
    if (city.buildings) {
      for (const building of city.buildings) {
        await sqlite.execute(
          `INSERT OR REPLACE INTO buildings (id, building_type_id, grid_x, grid_y, level, health, created_at)
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
    }
  }

  static async getCity(): Promise<CityState | null> {
    const cityRow = await sqlite.query<any>('SELECT * FROM city_state WHERE id = 1');
    if (cityRow.length === 0) return null;

    const buildings = await sqlite.query<any>('SELECT * FROM buildings');
    
    const row = cityRow[0];
    return {
      population: row.population,
      populationSick: row.population_sick,
      food: row.food,
      housing: row.housing,
      health: row.health,
      happiness: row.happiness,
      currentEra: row.current_era,
      buildings: buildings.map(b => ({
        id: b.id,
        buildingTypeId: b.building_type_id,
        gridX: b.grid_x,
        gridY: b.grid_y,
        level: b.level,
        health: b.health,
        createdAt: b.created_at
      })),
      unlockedEvolutions: [] // TBD: Map this as well
    };
  }
}

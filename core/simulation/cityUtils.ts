import { BUILDINGS } from '../constants';
import { CityState } from '../types';

export interface CitySummary {
  totalHousing: number;
  totalFoodProduction: number;
  totalSilverIncome: number;
  totalHealthBonus: number;
  totalHappinessBonus: number;
  foodRequired: number;
  foodDeficit: number;
  homelessCount: number;
  isHungry: boolean;
  isHomeless: boolean;
  taxMultiplier: number;
  healthImpact: number;
  happinessImpact: number;
}

export const calculateCitySummary = (city: CityState): CitySummary => {
  let totalHousing = 0;
  let totalFoodProduction = 0;
  let totalSilverIncome = 0;
  let totalHealthBonus = 0;
  let totalHappinessBonus = 0;
  let constructionCostMultiplier = 1.0;

  const evolutions = city.unlockedEvolutions || [];
  if (evolutions.includes('agrarian')) totalHealthBonus += 5;
  if (evolutions.includes('nomadic')) constructionCostMultiplier *= 0.9;
  if (evolutions.includes('feudal')) totalSilverIncome += 50;
  if (evolutions.includes('mercantile')) totalSilverIncome += 100;
  if (evolutions.includes('industrialist')) constructionCostMultiplier *= 0.8;

  (city.buildings || []).forEach(pb => {
    const type = BUILDINGS.find(t => t.id === pb.buildingTypeId);
    if (type) {
      const levelMult = 1 + (pb.level - 1) * 0.2;
      totalHousing += (type.housing || 0) * levelMult;
      totalFoodProduction += (type.foodProduction || 0) * levelMult;
      totalSilverIncome += (type.silverIncome || 0) * levelMult;
      totalHealthBonus += (type.healthBonus || 0);
      totalHappinessBonus += (type.happinessBonus || 0);
    }
  });

  if (evolutions.includes('agrarian')) totalFoodProduction *= 1.2;
  if (evolutions.includes('industrialist')) totalFoodProduction *= 1.3;

  const foodRequired = city.population * 2;
  const foodDeficit = Math.max(0, foodRequired - totalFoodProduction);
  const homelessCount = Math.max(0, city.population - totalHousing);
  const isHungry = foodDeficit > 0;
  const isHomeless = homelessCount > 0;
  const sickRatio = city.population > 0 ? (city.populationSick || 0) / city.population : 0;

  let taxMultiplier = 1.0;
  let healthImpact = totalHealthBonus;
  let happinessImpact = totalHappinessBonus;

  if (evolutions.includes('feudal')) taxMultiplier *= 1.15;
  if (evolutions.includes('modernist')) happinessImpact += 15;
  if (evolutions.includes('cybernetic')) healthImpact += 50;

  taxMultiplier *= (1 - sickRatio);
  if (isHungry) {
    taxMultiplier *= 0.6;
    healthImpact -= 10;
    happinessImpact -= 20;
  }
  if (isHomeless) {
    taxMultiplier *= 0.7;
    healthImpact -= 15;
    happinessImpact -= 25;
  }
  if (city.health < 40) taxMultiplier *= 0.8;
  if (city.health < 20) taxMultiplier *= 0.5;

  return {
    totalHousing: Math.floor(totalHousing),
    totalFoodProduction: Math.floor(totalFoodProduction),
    totalSilverIncome: Math.floor(totalSilverIncome * taxMultiplier),
    totalHealthBonus,
    totalHappinessBonus,
    foodRequired,
    foodDeficit,
    homelessCount,
    isHungry,
    isHomeless,
    taxMultiplier,
    healthImpact,
    happinessImpact,
  };
};

export const getHealthStatus = (health: number) => {
  if (health >= 80) return { label: 'Optimal', color: '#14B8A6', description: 'Warga sangat sehat dan produktif.' };
  if (health >= 60) return { label: 'Baik', color: '#14B8A6', description: 'Kondisi kesehatan stabil.' };
  if (health >= 40) return { label: 'Fair', color: '#FBBF24', description: 'Beberapa warga mulai merasa tidak enak badan.' };
  if (health >= 20) return { label: 'Krisis', color: '#EF4444', description: 'Wabah penyakit mulai menyerang!' };
  return { label: 'Epidemi', color: '#EF4444', description: 'Epidemi parah melanda kota!' };
};

export const getProductivityStatus = (multiplier: number) => {
  if (multiplier >= 1.0) return { label: 'Optimal', color: '#14B8A6' };
  if (multiplier >= 0.8) return { label: 'Reduced', color: '#14B8A6' };
  if (multiplier >= 0.5) return { label: 'Suppressed', color: '#FBBF24' };
  return { label: 'Collapse', color: '#EF4444' };
};

export const getBuildingOccupancy = (population: number, totalHousing: number, buildingCapacity: number) => {
  if (totalHousing === 0) return 0;
  const ratio = population / totalHousing;
  return Math.min(buildingCapacity, Math.floor(buildingCapacity * ratio));
};

export const getOccupancyStatus = (occupancy: number, capacity: number) => {
  if (capacity === 0) return { label: 'N/A', color: '#9CA3AF' };
  const ratio = occupancy / capacity;
  if (ratio >= 1.0) return { label: 'Full Capacity', color: '#EF4444' };
  if (ratio >= 0.8) return { label: 'Overcrowded', color: '#FBBF24' };
  if (ratio >= 0.4) return { label: 'Optimal', color: '#14B8A6' };
  return { label: 'Low Occupancy', color: '#14B8A6' };
};

export const getHappinessStatus = (happiness: number) => {
  if (happiness >= 80) return { label: 'Sangat Bahagia', color: '#14B8A6' };
  if (happiness >= 60) return { label: 'Senang', color: '#14B8A6' };
  if (happiness >= 40) return { label: 'Netral', color: '#FBBF24' };
  return { label: 'Resah', color: '#EF4444' };
};
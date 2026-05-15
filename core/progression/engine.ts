import { DISASTERS, ERA_MILESTONES } from '../constants';
import { calculateCitySummary } from '../simulation/cityUtils';
import { CityState, Era, Habit, PlacedBuilding, UserStats } from '../types';

const normalizeEra = (value: Era | string): Era => {
  if (value === 'MEDIEVALedieval') return Era.MEDIEVAL;
  if (value === Era.STONE_AGE || value === Era.MEDIEVAL || value === Era.INDUSTRIAL || value === Era.MODERN || value === Era.DIGITAL) {
    return value;
  }
  return Era.STONE_AGE;
};

export interface DayReport {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  goldGained: number;
  expGained: number;
  hpChange: number;
  cityHealthChange: number;
  cityHappinessChange: number;
  silverTax: number;
  populationGrowth: number;
  momentumBonus: number;
  sickChange: number;
  deathCount: number;
  event: any;
  emergencyHabitAdded: boolean;
  message: string;
  levelUpCount: number;
  previousLevel: number;
  newLevel: number;
}

export const processEndDay = (
  stats: UserStats,
  city: CityState,
  buildings: PlacedBuilding[],
  habits: Habit[],
  today: string
): {
  updatedStats: UserStats;
  updatedCity: CityState;
  report: DayReport;
  resetHabitIds: string[];
} => {
  const dailyHabits = habits.filter(h => h.type === 'daily');
  const finishedDailyToday = dailyHabits.filter(h => h.completedDates.includes(today));
  const unfinishedDaily = dailyHabits.filter(h => !h.completedDates.includes(today));
  const finishedToday = habits.filter(h => h.completedDates.includes(today));

  const canSkip = stats.skipTickets > 0 && unfinishedDaily.length > dailyHabits.length * 0.5;
  let ticketUsed = false;
  const completionRate = dailyHabits.length > 0 ? finishedDailyToday.length / dailyHabits.length : 1;

  let hpChange = 0;
  let momentumChange = 0;

  if (canSkip) {
    ticketUsed = true;
    hpChange = 5;
    momentumChange = 0;
  } else {
    const maxPenalty = stats.maxHp * 0.25;
    const hpPenalty = Math.min(maxPenalty, unfinishedDaily.length * (stats.maxHp * 0.05));
    hpChange = completionRate >= 0.8 ? 10 : -hpPenalty;
    momentumChange = completionRate >= 0.8 ? 5 : -(unfinishedDaily.length * 10);
  }

  const summary = calculateCitySummary(city, buildings);
  const taxes = Math.floor(summary.totalSilverIncome * (0.8 + (stats.momentum / 100) * 0.4));
  const healthChange = summary.healthImpact + (completionRate >= 0.8 ? 5 : -(unfinishedDaily.length * 4));
  const happinessChange = summary.happinessImpact + (completionRate >= 0.8 ? 10 : -(unfinishedDaily.length * 6));

  const newHealth = Math.min(100, Math.max(0, city.health + healthChange));
  const newHappiness = Math.min(100, Math.max(0, city.happiness + happinessChange));

  let popChange = 0;
  let sickChange = 0;
  let deathCount = 0;

  if (summary.isHungry || summary.isHomeless) {
    const newSufferers = Math.ceil((summary.foodDeficit / 5) + (summary.homelessCount / 2));
    sickChange += newSufferers;
  }

  if (newHealth > 70) {
    const recovered = Math.ceil(city.populationSick * 0.3);
    sickChange -= recovered;
  }

  const deathRate = newHealth < 20 ? 0.4 : newHealth < 50 ? 0.15 : 0.05;
  deathCount = Math.ceil(city.populationSick * deathRate);
  if (newHealth < 10) deathCount += Math.ceil(city.population * 0.05);

  popChange -= deathCount;
  sickChange -= deathCount;

  if (!summary.isHungry && newHealth > 60 && city.population < summary.totalHousing) {
    popChange += Math.ceil((summary.totalHousing - city.population) * 0.1) + 1;
  }

  const finalPop = Math.max(0, city.population + popChange);
  const finalSick = Math.min(finalPop, Math.max(0, city.populationSick + sickChange));

  let activeDisaster: any = null;
  let eventImpactMessage = "";
  if (Math.random() < 0.15) {
    activeDisaster = DISASTERS[Math.floor(Math.random() * DISASTERS.length)];
    eventImpactMessage = `[EVENT] ${activeDisaster.name} detected!`;
  }

  let finalHealth = newHealth;
  let finalHappiness = newHappiness;
  if (activeDisaster) {
    if (activeDisaster.impactType === 'health') finalHealth = Math.max(0, finalHealth - activeDisaster.severity);
    if (activeDisaster.impactType === 'happiness') finalHappiness = Math.max(0, finalHappiness - activeDisaster.severity);
  }

  const currentEra = normalizeEra(city.currentEra);
  let nextEra = currentEra;
  const eraOrder = [Era.STONE_AGE, Era.MEDIEVAL, Era.INDUSTRIAL, Era.MODERN, Era.DIGITAL];
  const currentIndex = eraOrder.indexOf(currentEra);
  if (currentIndex < eraOrder.length - 1) {
    const nextEraType = eraOrder[currentIndex + 1];
    const milestone = ERA_MILESTONES.find(m => m.era === nextEraType);
    if (milestone && finalPop >= milestone.populationTarget) {
      nextEra = nextEraType;
    }
  }

  const levelUpCount = Math.max(0, stats.level - stats.lastCelebratedLevel);

  const report: DayReport = {
    date: today,
    habitsCompleted: finishedDailyToday.length,
    habitsTotal: dailyHabits.length,
    goldGained: finishedToday.reduce((sum, h) => sum + h.goldReward, 0),
    expGained: finishedToday.reduce((sum, h) => sum + h.expReward, 0),
    hpChange,
    cityHealthChange: healthChange - (activeDisaster?.impactType === 'health' ? activeDisaster.severity : 0),
    cityHappinessChange: happinessChange - (activeDisaster?.impactType === 'happiness' ? activeDisaster.severity : 0),
    silverTax: taxes,
    populationGrowth: popChange,
    momentumBonus: momentumChange,
    sickChange,
    deathCount,
    event: activeDisaster,
    emergencyHabitAdded: !!activeDisaster,
    levelUpCount,
    previousLevel: stats.lastCelebratedLevel,
    newLevel: stats.level,
    message: ticketUsed
      ? "Emergency Protocol Activated: Ticket used to safeguard simulation."
      : (activeDisaster ? eventImpactMessage : (hpChange >= 0 ? "You dominated the day! Momentum is building." : "A rough day in the simulation. Stay consistent."))
  };

  const updatedStats = {
    ...stats,
    hp: Math.min(stats.maxHp, Math.max(0, stats.hp + hpChange)),
    silver: stats.silver + taxes,
    momentum: Math.min(100, Math.max(0, stats.momentum + momentumChange)),
    skipTickets: ticketUsed ? stats.skipTickets - 1 : stats.skipTickets,
    lastEndDay: today,
    dayCount: stats.dayCount + 1,
    lastCelebratedLevel: stats.level,
    pendingReport: report
  };

  const updatedCity = {
    ...city,
    population: finalPop,
    populationSick: finalSick,
    currentEra: nextEra,
    food: summary.totalFoodProduction,
    housing: summary.totalHousing,
    health: finalHealth,
    happiness: finalHappiness
  };

  const resetHabitIds = unfinishedDaily.map(h => h.id);

  return { updatedStats, updatedCity, report, resetHabitIds };
};

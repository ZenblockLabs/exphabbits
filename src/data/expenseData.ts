export interface ExpenseItem {
  desc: string;
  amount: number;
}

export interface MonthData {
  snacks: number[];
  food: number[];
  travellingCharge: number[];
  otherExpenses: ExpenseItem[];
  selfExpense: ExpenseItem[];
  petrol: number[];
}

export interface YearData {
  [month: string]: MonthData;
}

export interface ExpenseData {
  [year: number]: YearData;
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const CATEGORIES = {
  snacks: { label: "Snacks", color: "snacks", icon: "🍿" },
  food: { label: "Food", color: "food", icon: "🍽️" },
  travellingCharge: { label: "Travelling", color: "travel", icon: "🚌" },
  otherExpenses: { label: "Other Expenses", color: "other", icon: "📦" },
  selfExpense: { label: "Self Expense", color: "self", icon: "🏠" },
  petrol: { label: "Petrol", color: "petrol", icon: "⛽" },
} as const;

export const createEmptyMonth = (): MonthData => ({
  snacks: [],
  food: [],
  travellingCharge: [],
  otherExpenses: [],
  selfExpense: [],
  petrol: [],
});

export const createEmptyYear = (): YearData => {
  const yearData: YearData = {};
  MONTHS.forEach((month) => {
    yearData[month] = createEmptyMonth();
  });
  return yearData;
};

const octoberData: MonthData = {
  snacks: [50, 40, 66, 145, 73, 90, 242, 40],
  food: [160, 444],
  travellingCharge: [110, 85, 100, 24, 83, 88, 65, 110],
  otherExpenses: [
    { desc: "Festival expenses", amount: 2750 },
    { desc: "Chain spray", amount: 160 },
    { desc: "Bike service", amount: 1550 },
    { desc: "Appa recharge", amount: 799 },
    { desc: "Himalayan accessories", amount: 1413 },
    { desc: "Number frame", amount: 250 },
    { desc: "Water bill", amount: 3000 },
    { desc: "2L water", amount: 44 },
    { desc: "B-residency", amount: 900 },
    { desc: "S cake", amount: 62 },
  ],
  selfExpense: [
    { desc: "Spotify", amount: 69 },
    { desc: "Crepe bandage", amount: 200 },
    { desc: "Movie", amount: 419 },
    { desc: "Bath sponge", amount: 30 },
    { desc: "Barber shop", amount: 250 },
  ],
  petrol: [160, 210, 110, 810, 920, 810],
};

const novemberData: MonthData = {
  snacks: [35, 25, 50, 80, 85, 20, 40, 94, 299],
  food: [150],
  travellingCharge: [110, 110, 110, 65, 22, 90],
  otherExpenses: [
    { desc: "Chain brush", amount: 120 },
    { desc: "Home", amount: 41 },
    { desc: "Home item", amount: 350 },
    { desc: "Interest", amount: 1929 },
    { desc: "Amazon", amount: 1200 },
    { desc: "B", amount: 380 },
    { desc: "Rear hugger", amount: 1320 },
    { desc: "Chain spray", amount: 241 },
    { desc: "Suspension guard", amount: 383 },
    { desc: "Rear hugger fitting", amount: 150 },
    { desc: "Parking", amount: 60 },
    { desc: "Hospital", amount: 500 },
    { desc: "Socket", amount: 89 },
    { desc: "Friend gift t-shirt", amount: 380 },
    { desc: "To Amma", amount: 1100 },
    { desc: "Socket", amount: 89 },
    { desc: "XYXX", amount: 1025 },
    { desc: "Phone holder", amount: 49 },
    { desc: "Sandals", amount: 827 },
    { desc: "Cutting", amount: 150 },
    { desc: "Snitch pant", amount: 670 },
  ],
  selfExpense: [
    { desc: "PG Rent", amount: 6000 },
    { desc: "Spotify", amount: 140 },
    { desc: "Microcontroller", amount: 334 },
  ],
  petrol: [510, 820, 920, 160],
};

const decemberData: MonthData = {
  snacks: [10, 47, 50, 10, 27, 245, 20, 90, 60, 50, 90, 40, 30],
  food: [51, 280, 559, 250, 130],
  travellingCharge: [51, 145, 110, 150, 160, 110],
  otherExpenses: [
    { desc: "Snacks", amount: 470 },
    { desc: "Bday food", amount: 2707 },
    { desc: "Bday food", amount: 480 },
    { desc: "Interest", amount: 680 },
    { desc: "Interest", amount: 450 },
    { desc: "B-ice cream", amount: 152 },
    { desc: "Case", amount: 619 },
    { desc: "Foldable chair", amount: 795 },
    { desc: "Sakkar gift", amount: 1143 },
    { desc: "Secret santa", amount: 470 },
    { desc: "Suresh sir send off", amount: 138 },
    { desc: "Volleyball", amount: 111 },
    { desc: "Movie", amount: 1220 },
    { desc: "Movie", amount: 719 },
    { desc: "FZ acc wire", amount: 340 },
    { desc: "Passport", amount: 1500 },
    { desc: "Helmet", amount: 3500 },
    { desc: "HJG fog light", amount: 4100 },
    { desc: "Extender + phone holder", amount: 513 },
    { desc: "Vineet gift", amount: 299 },
  ],
  selfExpense: [
    { desc: "PG Rent", amount: 6000 },
    { desc: "Jeans", amount: 685 },
    { desc: "Body wash", amount: 400 },
    { desc: "T shirt", amount: 200 },
    { desc: "Recharge", amount: 350 },
  ],
  petrol: [710, 510, 510, 1020],
};

const januaryData: MonthData = {
  snacks: [100, 40, 399, 26, 100, 80, 180, 50, 100, 97, 93, 120, 70],
  food: [160, 140, 70],
  travellingCharge: [15, 50, 65, 128, 163, 120, 200, 148, 120],
  otherExpenses: [
    { desc: "Expense", amount: 3010 },
    { desc: "Amma", amount: 8000 },
    { desc: "Amrith noni", amount: 400 },
    { desc: "Amrith noni", amount: 682 },
    { desc: "Grocery", amount: 3810 },
  ],
  selfExpense: [
    { desc: "Sunscreen", amount: 199 },
    { desc: "Jio Prime", amount: 29 },
    { desc: "PG Rent", amount: 6000 },
    { desc: "Movie", amount: 180 },
    { desc: "Computer glass", amount: 415 },
    { desc: "Sandal soap", amount: 117 },
    { desc: "Snooker", amount: 60 },
    { desc: "Chicken", amount: 250 },
    { desc: "Pant", amount: 1150 },
    { desc: "Hangers", amount: 238 },
    { desc: "Peter cake", amount: 114 },
  ],
  petrol: [120, 60, 527, 60, 410, 60, 120, 320],
};

const februaryData: MonthData = {
  snacks: [210, 60, 186, 46, 320, 35, 36, 118, 90, 200, 305, 70],
  food: [260, 310, 470],
  travellingCharge: [100, 100, 35],
  otherExpenses: [
    { desc: "Chicken", amount: 330 },
    { desc: "Sanga", amount: 1000 },
  ],
  selfExpense: [
    { desc: "Acefluency", amount: 1021 },
    { desc: "Movie", amount: 300 },
    { desc: "Hotel", amount: 700 },
    { desc: "PG Rent", amount: 6000 },
    { desc: "Perfume", amount: 333 },
    { desc: "Xerox", amount: 26 },
    { desc: "Movie", amount: 200 },
    { desc: "Tablet", amount: 15 },
    { desc: "Football", amount: 138 },
  ],
  petrol: [180, 300, 390, 290, 250],
};

const marchData: MonthData = {
  snacks: [120, 150, 36, 160, 80, 80, 14, 220, 287, 30, 220, 60],
  food: [360],
  travellingCharge: [100, 114, 280],
  otherExpenses: [
    { desc: "Jio Hotstar", amount: 299 },
    { desc: "Ammi anniversary cake", amount: 480 },
    { desc: "RO drink", amount: 236 },
    { desc: "Good night", amount: 124 },
    { desc: "Amma Sanga", amount: 800 },
    { desc: "Sunscreen", amount: 470 },
    { desc: "Sunscreen", amount: 150 },
    { desc: "Bike service", amount: 1450 },
    { desc: "Mart", amount: 61 },
    { desc: "Amma Ugadi", amount: 700 },
  ],
  selfExpense: [
    { desc: "Shoe pant Ajio", amount: 3542 },
    { desc: "Cable", amount: 189 },
    { desc: "PG Rent", amount: 6000 },
    { desc: "Shirt", amount: 700 },
    { desc: "B-chocolate", amount: 100 },
    { desc: "Shots", amount: 199 },
    { desc: "Shampoo", amount: 10 },
    { desc: "Case & D+", amount: 80 },
    { desc: "Rare plate", amount: 300 },
    { desc: "Pool", amount: 80 },
  ],
  petrol: [340, 90, 150, 90, 190, 50],
};

const aprilData: MonthData = {
  snacks: [410, 177, 66, 22, 71, 20, 88, 250, 50, 54, 60, 30, 50],
  food: [120, 280, 890, 408],
  travellingCharge: [100, 35, 130, 100, 100, 150],
  otherExpenses: [
    { desc: "Mutton", amount: 2800 },
    { desc: "Pool", amount: 150 },
    { desc: "B-recharge", amount: 799 },
    { desc: "E-bill", amount: 500 },
    { desc: "Sai cake", amount: 420 },
    { desc: "Chicken", amount: 290 },
    { desc: "Amma chain", amount: 120000 },
    { desc: "Giva ring", amount: 1798 },
    { desc: "Jasmine", amount: 30 },
    { desc: "Chicken", amount: 400 },
    { desc: "Locker key", amount: 50 },
    { desc: "Watch", amount: 1329 },
    { desc: "Gas", amount: 1050 },
  ],
  selfExpense: [
    { desc: "PG Rent", amount: 6000 },
    { desc: "Movie", amount: 190 },
    { desc: "Coconut oil", amount: 237 },
    { desc: "Face mask", amount: 20 },
    { desc: "Cloth", amount: 1217 },
    { desc: "Mamaearth product", amount: 1400 },
    { desc: "Dharmasthala", amount: 2300 },
    { desc: "Home god", amount: 120 },
    { desc: "Laptop stand", amount: 228 },
    { desc: "Alarm clock", amount: 349 },
  ],
  petrol: [210, 210, 50, 190, 180, 280, 150],
};

const mayData: MonthData = {
  snacks: [120, 20, 80, 75, 86, 100, 40, 540, 80, 70, 501],
  food: [55, 567, 60, 210],
  travellingCharge: [78, 100, 25],
  otherExpenses: [
    { desc: "Liki gift", amount: 1040 },
    { desc: "Shankar cake", amount: 82 },
  ],
  selfExpense: [
    { desc: "Spotify premium", amount: 119 },
    { desc: "Movie", amount: 360 },
    { desc: "PG Rent", amount: 6000 },
  ],
  petrol: [60, 270, 240, 90, 210],
};

const juneData: MonthData = {
  snacks: [20, 20, 170, 399, 90, 70, 35, 30, 100, 155, 50, 35],
  food: [395, 310, 164, 170],
  travellingCharge: [25, 160, 25, 100, 100, 40, 120, 100],
  otherExpenses: [
    { desc: "Hotstar recharge", amount: 299 },
    { desc: "Wall E socket", amount: 439 },
    { desc: "Chocolate", amount: 130 },
    { desc: "Light", amount: 140 },
    { desc: "Akki", amount: 1300 },
    { desc: "Bike service", amount: 3700 },
    { desc: "Wifi recharge", amount: 3584 },
    { desc: "Cake", amount: 65 },
    { desc: "Amma", amount: 700 },
  ],
  selfExpense: [
    { desc: "PG Rent", amount: 6000 },
    { desc: "Trends dress", amount: 3273 },
    { desc: "Dry fruits", amount: 2200 },
    { desc: "Riding glass", amount: 165 },
  ],
  petrol: [210, 190, 70, 170, 160, 480],
};

const julyData: MonthData = {
  snacks: [20, 160, 70, 12, 30, 210, 200, 30, 150, 20, 100],
  food: [310, 180, 120, 50, 280],
  travellingCharge: [65, 25, 130, 65, 65, 220, 83, 173, 160],
  otherExpenses: [
    { desc: "Iron box", amount: 907 },
    { desc: "Slipper", amount: 509 },
    { desc: "Movie", amount: 298 },
    { desc: "Parking charge", amount: 50 },
    { desc: "Amma", amount: 2600 },
    { desc: "Dude", amount: 200 },
    { desc: "Morning home", amount: 86 },
    { desc: "Egg", amount: 40 },
  ],
  selfExpense: [
    { desc: "PG Rent", amount: 6000 },
    { desc: "Goa", amount: 8069 },
    { desc: "25W charger", amount: 999 },
    { desc: "S24 Ultra", amount: 75000 },
    { desc: "Brush", amount: 20 },
    { desc: "Cover & D+", amount: 130 },
    { desc: "Movie", amount: 300 },
    { desc: "Cable", amount: 100 },
    { desc: "VGA convertor", amount: 200 },
  ],
  petrol: [160, 200, 70, 210, 40, 180],
};

const augustData: MonthData = {
  snacks: [10, 114, 30, 85, 52, 56, 230, 55, 50, 100, 220, 50],
  food: [1220, 60, 290],
  travellingCharge: [130, 110, 140, 150, 133],
  otherExpenses: [
    { desc: "Dress", amount: 2705 },
    { desc: "PA recharge", amount: 199 },
    { desc: "Mysore", amount: 2803 },
    { desc: "Mysore", amount: 505 },
    { desc: "Rishi cake", amount: 45 },
    { desc: "Ganesha", amount: 2300 },
    { desc: "Vasne", amount: 130 },
    { desc: "Home grocery", amount: 2665 },
  ],
  selfExpense: [
    { desc: "Movie", amount: 510 },
    { desc: "Belt", amount: 739 },
    { desc: "Parking charge", amount: 60 },
    { desc: "Helmet glass", amount: 100 },
    { desc: "Xerox", amount: 10 },
    { desc: "Movie", amount: 525 },
    { desc: "PG Rent", amount: 6000 },
    { desc: "Cover", amount: 850 },
    { desc: "Earphone", amount: 1890 },
  ],
  petrol: [210, 120, 60, 310, 260, 160],
};

const septemberData: MonthData = {
  snacks: [80, 560, 55, 1105, 40, 40, 35, 40, 50],
  food: [220, 200, 369, 80, 370, 270],
  travellingCharge: [50, 110, 110, 120, 94, 80, 65, 73, 133],
  otherExpenses: [
    { desc: "Key hanger", amount: 55 },
    { desc: "Washing powder", amount: 1189 },
    { desc: "PA data", amount: 26 },
    { desc: "Hotstar recharge", amount: 899 },
    { desc: "Slice interest", amount: 1765 },
    { desc: "S-interest", amount: 4150 },
    { desc: "S-interest", amount: 920 },
    { desc: "B-Nike shoe", amount: 1823 },
    { desc: "Fridge", amount: 30000 },
    { desc: "B-dress", amount: 849 },
    { desc: "Fridge Bata", amount: 540 },
    { desc: "Pooje saman", amount: 405 },
    { desc: "Pooje saman", amount: 800 },
    { desc: "Sweets", amount: 400 },
    { desc: "Dinner party", amount: 950 },
    { desc: "Debit card issue", amount: 354 },
    { desc: "B-perfume", amount: 400 },
  ],
  selfExpense: [
    { desc: "PG Rent", amount: 6000 },
    { desc: "Spotify", amount: 69 },
    { desc: "0.78mm wire", amount: 820 },
    { desc: "Umbrella", amount: 247 },
    { desc: "Movie", amount: 302 },
    { desc: "Tonner", amount: 700 },
    { desc: "Cutting", amount: 200 },
    { desc: "X ray", amount: 150 },
    { desc: "Soap", amount: 277 },
    { desc: "Jeans", amount: 864 },
    { desc: "Photocopy", amount: 100 },
    { desc: "Bone massage", amount: 325 },
    { desc: "Recharge", amount: 859 },
    { desc: "Bone massage", amount: 200 },
  ],
  petrol: [80, 403, 320, 180, 1100, 600],
};

export const initialExpenseData: ExpenseData = {
  2026: createEmptyYear(),
  2025: {
    January: { ...januaryData },
    February: { ...februaryData },
    March: { ...marchData },
    April: { ...aprilData },
    May: { ...mayData },
    June: { ...juneData },
    July: { ...julyData },
    August: { ...augustData },
    September: { ...septemberData },
    October: { ...octoberData },
    November: { ...novemberData },
    December: { ...decemberData },
  },
};

export const calculateCategoryTotal = (data: number[] | ExpenseItem[]): number => {
  if (data.length === 0) return 0;
  if (typeof data[0] === "number") {
    return (data as number[]).reduce((sum, val) => sum + val, 0);
  }
  return (data as ExpenseItem[]).reduce((sum, item) => sum + item.amount, 0);
};

export const calculateMonthTotal = (month: MonthData): number => {
  return (
    calculateCategoryTotal(month.snacks) +
    calculateCategoryTotal(month.food) +
    calculateCategoryTotal(month.travellingCharge) +
    calculateCategoryTotal(month.otherExpenses) +
    calculateCategoryTotal(month.selfExpense) +
    calculateCategoryTotal(month.petrol)
  );
};

export const calculateYearTotals = (yearData: YearData) => {
  let totalSelf = 0;
  let totalOther = 0;
  let totalPetrol = 0;

  Object.values(yearData).forEach((month) => {
    totalSelf += calculateCategoryTotal(month.selfExpense);
    totalOther +=
      calculateCategoryTotal(month.snacks) +
      calculateCategoryTotal(month.food) +
      calculateCategoryTotal(month.travellingCharge) +
      calculateCategoryTotal(month.otherExpenses);
    totalPetrol += calculateCategoryTotal(month.petrol);
  });

  return {
    totalSelf,
    totalOther,
    totalPetrol,
    yearTotal: totalSelf + totalOther + totalPetrol,
  };
};

export const getCategoryBreakdown = (yearData: YearData) => {
  const breakdown = {
    snacks: 0,
    food: 0,
    travellingCharge: 0,
    otherExpenses: 0,
    selfExpense: 0,
    petrol: 0,
  };

  Object.values(yearData).forEach((month) => {
    breakdown.snacks += calculateCategoryTotal(month.snacks);
    breakdown.food += calculateCategoryTotal(month.food);
    breakdown.travellingCharge += calculateCategoryTotal(month.travellingCharge);
    breakdown.otherExpenses += calculateCategoryTotal(month.otherExpenses);
    breakdown.selfExpense += calculateCategoryTotal(month.selfExpense);
    breakdown.petrol += calculateCategoryTotal(month.petrol);
  });

  return breakdown;
};

export const getMonthlyTotals = (yearData: YearData) => {
  return MONTHS.map((month) => ({
    month,
    total: yearData[month] ? calculateMonthTotal(yearData[month]) : 0,
  }));
};

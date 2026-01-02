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
  snacks: [45, 60, 30, 75],
  food: [200, 180],
  travellingCharge: [100, 85, 120],
  otherExpenses: [
    { desc: "Christmas gift", amount: 500 },
    { desc: "Party supplies", amount: 300 },
    { desc: "New Year prep", amount: 800 },
  ],
  selfExpense: [
    { desc: "PG Rent", amount: 6000 },
    { desc: "Spotify", amount: 140 },
  ],
  petrol: [600, 750, 400],
};

export const initialExpenseData: ExpenseData = {
  2026: {
    January: createEmptyMonth(),
    February: createEmptyMonth(),
    March: createEmptyMonth(),
    April: createEmptyMonth(),
    May: createEmptyMonth(),
    June: createEmptyMonth(),
    July: createEmptyMonth(),
    August: createEmptyMonth(),
    September: createEmptyMonth(),
    October: createEmptyMonth(),
    November: { ...novemberData },
    December: { ...decemberData },
  },
  2025: {
    January: createEmptyMonth(),
    February: createEmptyMonth(),
    March: createEmptyMonth(),
    April: createEmptyMonth(),
    May: createEmptyMonth(),
    June: createEmptyMonth(),
    July: createEmptyMonth(),
    August: createEmptyMonth(),
    September: createEmptyMonth(),
    October: createEmptyMonth(),
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

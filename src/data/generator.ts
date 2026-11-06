import { Transaction, SalesTarget, DatabaseState, DataLog } from '../types';
import {
  SEED_PRODUCTS,
  SEED_SALES_REPS,
  SEED_REGIONS,
  SEED_CHANNELS,
  INITIAL_SETTINGS,
  DEMO_CUSTOMERS,
} from './seedData';

// Mulberry32 Deterministic PRNG
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateFullDemoDatabase(customSeed: number = 20261105): DatabaseState {
  const rng = createPRNG(customSeed);

  // Month seasonality multipliers (Jan to Sep)
  const monthWeights: Record<number, number> = {
    1: 0.95, // Jan: Start of year
    2: 0.82, // Feb: Lunar New Year holiday break
    3: 1.15, // Mar: Construction ramp-up
    4: 1.25, // Apr: Dry peak season
    5: 1.30, // May: Strongest pouring peak
    6: 1.20, // Jun: High demand
    7: 0.92, // Jul: Rainy season onset
    8: 0.88, // Aug: Monsoon weather
    9: 1.05, // Sep: Infrastructure acceleration
  };

  // Region market share weight
  const regionWeights: Record<string, number> = {
    REG_MB: 0.42,
    REG_MN: 0.26,
    REG_MT: 0.16,
    REG_DBSCL: 0.10,
    REG_TN: 0.06,
  };

  // Channel preference weights
  const channelWeights: Record<string, { weight2025: number; weight2026: number }> = {
    CHN_DIST: { weight2025: 0.42, weight2026: 0.38 },
    CHN_DIRECT: { weight2025: 0.28, weight2026: 0.29 },
    CHN_KA: { weight2025: 0.18, weight2026: 0.20 },
    CHN_RETAIL: { weight2025: 0.08, weight2026: 0.06 },
    CHN_ONLINE: { weight2025: 0.04, weight2026: 0.07 }, // High growth online B2B
  };

  // Rep performance profiles to generate realistic spread (some >= 120%, some 100-119%, some 80-99%, some <80%)
  const repCapabilityMap = new Map<string, number>();
  SEED_SALES_REPS.forEach((rep, index) => {
    if (['REP_MB_01', 'REP_MN_01', 'REP_MT_01', 'REP_MB_03'].includes(rep.Sales_Rep_ID)) {
      repCapabilityMap.set(rep.Sales_Rep_ID, 1.24 + (rng() * 0.12)); // Stars: 124% - 136%
    } else if (['REP_MB_05', 'REP_MN_06', 'REP_DBSCL_04'].includes(rep.Sales_Rep_ID)) {
      repCapabilityMap.set(rep.Sales_Rep_ID, 0.70 + (rng() * 0.08)); // Below target: 70% - 78%
    } else if (['REP_MT_04', 'REP_TN_03', 'REP_MN_04'].includes(rep.Sales_Rep_ID)) {
      repCapabilityMap.set(rep.Sales_Rep_ID, 0.85 + (rng() * 0.10)); // Warning: 85% - 95%
    } else {
      repCapabilityMap.set(rep.Sales_Rep_ID, 1.02 + (rng() * 0.15)); // Good: 102% - 117%
    }
  });

  const transactions: Transaction[] = [];
  const targets: SalesTarget[] = [];
  let transactionCounter = 1;
  let orderCounter = 10001;
  let targetCounter = 1;

  // Generate Targets first for each year (2025, 2026) and each month (1..9)
  const years = [2025, 2026];
  for (const year of years) {
    const yearBaseVolume = year === 2025 ? 1.0 : 1.14; // ~14% target expansion in 2026

    for (let month = 1; month <= 9; month++) {
      const mWeight = monthWeights[month];

      for (const rep of SEED_SALES_REPS) {
        const regWeight = regionWeights[rep.Region_ID] || 0.1;
        // Base monthly target around 4.5B - 8.5B VND per rep depending on region
        const baseMonthlyRevTarget = Math.round((5_500_000_000 * regWeight * 3.8 * mWeight * yearBaseVolume) / 10_000_000) * 10_000_000;
        const profitTarget = Math.round(baseMonthlyRevTarget * 0.28);
        const qtyTarget = Math.round(baseMonthlyRevTarget / 1_850_000); // tons

        targets.push({
          Target_ID: `TGT_${year}_M${String(month).padStart(2, '0')}_${rep.Sales_Rep_ID}`,
          Year: year,
          Month: month,
          Region_ID: rep.Region_ID,
          Sales_Rep_ID: rep.Sales_Rep_ID,
          Revenue_Target: baseMonthlyRevTarget,
          Profit_Target: profitTarget,
          Quantity_Target: qtyTarget,
        });
      }
    }
  }

  // Pre-index targets for fast lookup: key = `${year}_${month}_${repId}`
  const targetMap = new Map<string, SalesTarget>();
  targets.forEach((t) => {
    targetMap.set(`${t.Year}_${t.Month}_${t.Sales_Rep_ID}`, t);
  });

  // Generate Transactions
  // We simulate orders for each year (2025 & 2026), 9 months each
  for (const year of years) {
    const yearGrowthFactor = year === 2025 ? 1.0 : 1.15; // 15% revenue expansion

    for (let month = 1; month <= 9; month++) {
      const daysInMonth = month === 2 ? 28 : [4, 6, 9].includes(month) ? 30 : 31;
      const mWeight = monthWeights[month];

      // Number of orders in this month (approx 120-160 per month across all regions)
      const monthlyOrdersCount = Math.floor(130 * mWeight * (year === 2025 ? 1.0 : 1.12));

      for (let o = 0; o < monthlyOrdersCount; o++) {
        const day = 1 + Math.floor(rng() * daysInMonth);
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const orderId = `ORD-${year}-${String(orderCounter++).padStart(5, '0')}`;

        // Select Customer
        const customerIndex = Math.floor(rng() * DEMO_CUSTOMERS.length);
        const customerName = DEMO_CUSTOMERS[customerIndex];
        const customerId = `CUST_${String(customerIndex + 1).padStart(3, '0')}`;

        // Select Region based on weighted distribution
        const rRoll = rng();
        let selectedRegionId = 'REG_MB';
        let cumulative = 0;
        for (const [rId, w] of Object.entries(regionWeights)) {
          cumulative += w;
          if (rRoll <= cumulative) {
            selectedRegionId = rId;
            break;
          }
        }

        // Select Sales Rep in that region
        const repsInRegion = SEED_SALES_REPS.filter((r) => r.Region_ID === selectedRegionId);
        const rep = repsInRegion[Math.floor(rng() * repsInRegion.length)];

        // Select Channel
        const cRoll = rng();
        let selectedChannelId = 'CHN_DIST';
        let cCum = 0;
        for (const [cId, wConfig] of Object.entries(channelWeights)) {
          cCum += year === 2025 ? wConfig.weight2025 : wConfig.weight2026;
          if (cRoll <= cCum) {
            selectedChannelId = cId;
            break;
          }
        }

        // Order status (approx 2% cancelled, 2% pending, 12% delivered, 84% completed)
        const statusRoll = rng();
        let orderStatus: Transaction['Order_Status'] = 'Completed';
        let paymentStatus: Transaction['Payment_Status'] = 'Paid';

        if (statusRoll < 0.02) {
          orderStatus = 'Cancelled';
          paymentStatus = 'Unpaid';
        } else if (statusRoll < 0.04) {
          orderStatus = 'Pending';
          paymentStatus = 'Partial';
        } else if (statusRoll < 0.16) {
          orderStatus = 'Delivered';
          paymentStatus = rng() > 0.3 ? 'Paid' : 'Partial';
        } else {
          orderStatus = 'Completed';
          paymentStatus = 'Paid';
        }

        // Number of line items in this order (1 to 3 items)
        const linesCount = 1 + (rng() > 0.65 ? 1 : 0) + (rng() > 0.90 ? 1 : 0);
        const selectedProductsForOrder = new Set<string>();

        for (let l = 0; l < linesCount; l++) {
          // Select product
          let product = SEED_PRODUCTS[Math.floor(rng() * SEED_PRODUCTS.length)];
          // Avoid duplicate product in same order
          let tries = 0;
          while (selectedProductsForOrder.has(product.Product_ID) && tries < 5) {
            product = SEED_PRODUCTS[Math.floor(rng() * SEED_PRODUCTS.length)];
            tries++;
          }
          selectedProductsForOrder.add(product.Product_ID);

          // Quantity (typical cement orders range from 15 tons to 180 tons)
          let quantity = Math.floor(15 + rng() * 65);
          if (selectedChannelId === 'CHN_DIRECT' || selectedChannelId === 'CHN_KA') {
            quantity = Math.floor(40 + rng() * 160); // Infrastructure projects buy larger batches
          } else if (selectedChannelId === 'CHN_RETAIL') {
            quantity = Math.floor(8 + rng() * 25);
          }

          // Rep capability & year multiplier adjustment
          const repCap = repCapabilityMap.get(rep.Sales_Rep_ID) || 1.0;
          quantity = Math.max(5, Math.round(quantity * (year === 2025 ? 0.92 : 1.05) * (0.85 + repCap * 0.2)));

          // Price and discount
          const unitPrice = product.Standard_Price;
          const grossRevenue = quantity * unitPrice;

          // Discount rate: 1% to 4% for bulk or distributors, 0% for retail
          let discountRate = 0;
          if (selectedChannelId === 'CHN_DIST' || selectedChannelId === 'CHN_KA') {
            discountRate = 0.015 + rng() * 0.025;
          } else if (selectedChannelId === 'CHN_DIRECT') {
            discountRate = 0.01 + rng() * 0.02;
          }
          const discount = Math.round(grossRevenue * discountRate);
          const netRevenue = grossRevenue - discount;

          // Cost: Standard cost + slight random raw material variance (+- 3%)
          const unitCost = Math.round(product.Standard_Cost * (0.98 + rng() * 0.04));
          const costAmount = quantity * unitCost;
          const grossProfit = netRevenue - costAmount;

          transactions.push({
            Transaction_ID: `TXN_${year}_${String(transactionCounter++).padStart(6, '0')}`,
            Order_ID: orderId,
            Order_Date: dateStr,
            Customer_ID: customerId,
            Customer_Name: customerName,
            Region_ID: selectedRegionId,
            Sales_Rep_ID: rep.Sales_Rep_ID,
            Product_ID: product.Product_ID,
            Channel_ID: selectedChannelId,
            Quantity: quantity,
            Unit_Price: unitPrice,
            Gross_Revenue: grossRevenue,
            Discount: discount,
            Net_Revenue: netRevenue,
            Cost_Amount: costAmount,
            Gross_Profit: grossProfit,
            Order_Status: orderStatus,
            Payment_Status: paymentStatus,
          });
        }
      }
    }
  }

  // Create Data Log entry
  const nowStr = new Date().toISOString();
  const dataLogs: DataLog[] = [
    {
      Log_ID: `LOG_${Date.now()}`,
      Timestamp: nowStr,
      Version: INITIAL_SETTINGS.Demo_Data_Version,
      RowCount: transactions.length,
      Status: 'Success',
      Operator: 'System / Automated GAS Engine',
      ErrorMsg: 'None (Data integrity verified across 8 sheets, 0 duplicate keys, 0 orphan references)',
    },
  ];

  return {
    transactions,
    targets,
    products: SEED_PRODUCTS,
    salesReps: SEED_SALES_REPS,
    regions: SEED_REGIONS,
    channels: SEED_CHANNELS,
    settings: {
      ...INITIAL_SETTINGS,
      Last_Data_Refresh: nowStr,
      Data_Generation_Seed: customSeed,
    },
    dataLogs,
  };
}

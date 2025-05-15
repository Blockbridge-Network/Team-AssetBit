export interface Commodity {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change: string;
  image: string;
}

export const minerals: Commodity[] = [
  { id: 1, name: 'Gold', symbol: 'XAU', price: 1950.25, change: '+2.5%', image: '/images/gold.png' },
  { id: 2, name: 'Silver', symbol: 'XAG', price: 24.75, change: '+1.2%', image: '/images/silver.png' },
  { id: 3, name: 'Copper', symbol: 'COPPER', price: 9000.00, change: '+0.5%', image: '/images/copper.png' },
  { id: 4, name: 'Aluminium', symbol: 'ALUMINIUM', price: 2500.00, change: '+0.3%', image: '/images/aluminium.png' },
  { id: 5, name: 'Platinum', symbol: 'PLATINUM', price: 1100.00, change: '-0.2%', image: '/images/platinum.png' },
  { id: 6, name: 'Palladium', symbol: 'PALLADIUM', price: 1400.00, change: '+1.1%', image: '/images/palladuim.png' },
  { id: 7, name: 'Oil', symbol: 'OIL', price: 78.50, change: '-0.8%', image: '/images/oil.png' },
  { id: 8, name: 'Natural Gas', symbol: 'NATGAS', price: 2.50, change: '-0.7%', image: '/images/natural-gas.jpeg' },
]

export const farmProduce: Commodity[] = [
  { id: 9, name: 'Wheat', symbol: 'WHEAT', price: 650.00, change: '+0.4%', image: '/images/wheat.jpeg' },
  { id: 10, name: 'Corn', symbol: 'CORN', price: 550.00, change: '-0.6%', image: '/images/corn.png' },
  { id: 11, name: 'Sugar', symbol: 'SUGAR', price: 20.00, change: '+0.2%', image: '/images/sugar.png' },
  { id: 12, name: 'Cotton', symbol: 'COTTON', price: 85.00, change: '-0.3%', image: '/images/cotton.png' },
  { id: 13, name: 'Lumber', symbol: 'LUMBER', price: 500.00, change: '+0.8%', image: '/images/lumber.png' },
  { id: 14, name: 'Lean Hogs', symbol: 'LEANHOGS', price: 75.00, change: '-0.4%', image: '/images/lean-hogs.png' },
  { id: 15, name: 'Live Cattle', symbol: 'LIVECATTLE', price: 120.00, change: '+0.6%', image: '/images/live-cattle.png' },
  { id: 16, name: 'Orange Juice', symbol: 'ORANGEJUICE', price: 200.00, change: '+1.0%', image: '/images/orange-juice.png' },
  { id: 17, name: 'Cocoa', symbol: 'COCOA', price: 3200.00, change: '+3.1%', image: '/images/cocoa.png' },
  { id: 18, name: 'Coffee', symbol: 'COFFEE', price: 180.25, change: '-1.5%', image: '/images/coffee.png' },
  { id: 19, name: 'Cashew', symbol: 'CASHEW', price: 4500.00, change: '+0.9%', image: '/images/cashew.png' },
] 
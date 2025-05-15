export const COMMODITY_TOKEN_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
		"name": "balanceOf",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "address", "name": "owner", "type": "address" },
			{ "internalType": "address", "name": "spender", "type": "address" }
		],
		"name": "allowance",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [{ "internalType": "string", "name": "", "type": "string" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [{ "internalType": "string", "name": "", "type": "string" }],
		"stateMutability": "view",
		"type": "function"
	}
];

export const COMMODITY_TOKEN_CONFIGS = [
{
	name: "GoldToken",
	symbol: "XAU",
	commodityType: "Gold",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "670000000000000000", // 0.67 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x3a57599eb64ba2534d39410320ede8f0bc600210", // Deployed contract address for GoldToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "SilverToken",
	symbol: "XAG",
	commodityType: "Silver",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "8300000000000000", // 0.0083 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0xa1b2a4a930d34bf58f6134e41337bc2ed1bfd8f9", // Deployed contract address for SilverToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "PlatinumToken",
	symbol: "PLATINUM",
	commodityType: "Platinum",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "300000000000000000", // 0.3 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x7542a97161512b18e0efaeac760020e6cbe036ed", // Deployed contract address for PlatinumToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "CopperToken",
	symbol: "COPPER",
	commodityType: "Copper",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "1500000000000000", // 0.0015 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x1af03c641d019d2c8e12cb67e75035831d33114e", // Deployed contract address for CopperToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "AluminiumToken",
	symbol: "ALU",
	commodityType: "Aluminium",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "370000000000000", // 0.00037 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x7e343b1bb2e93627a210fa6b96ed77089e557309", // Deployed contract address for AluminiumToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "OilToken",
	symbol: "OIL",
	commodityType: "Oil",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "27000000000000000", // 0.027 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0xb57ac35838f722fc113545668d1d631fe0e1b706", // Deployed contract address for OilToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "NaturalGasToken",
	symbol: "NATGAS",
	commodityType: "Natural Gas",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "830000000000000", // 0.00083 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x9e79d4e1ee62888b70ddf18df9284b6928b16c1b", // Deployed contract address for NaturalGasToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "WheatToken",
	symbol: "WHT",
	commodityType: "Wheat",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "2000000000000000", // 0.002 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x9223716951fc4fb5168ba05840a651f0f9652c6f", // Deployed contract address for WheatToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "CornToken",
	symbol: "CORN",
	commodityType: "Corn",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "1500000000000000", // 0.0015 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x0e266e52b4fc8aa10a678afc9d1739751a787c62", // Deployed contract address for CornToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "CocoaTokens",
	symbol: "COCOA",
	commodityType: "Cocoa",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "20500000000000000", // 0.0015 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0xdbea6e909c3bd311cfff6bef6a47a3979caafc20", // Deployed contract address for CornToken
	abi: COMMODITY_TOKEN_ABI
  },
  {
	name: "CoffeeTokens",
	symbol: "COFFEE",
	commodityType: "Coffee",
	initialSupply: "1000000000000000000000",
	pricePerUnit: "20500000000000000", // 0.0015 ETH
	totalSupplyCap: "10000000000000000000000",
	decimalPlaces: 18,
	address: "0x38e1135fd0ee9d914aafb19c782b87042ce6d721", // Deployed contract address for CoffeeTokens
	abi: COMMODITY_TOKEN_ABI
  },
];
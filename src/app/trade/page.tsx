'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { minerals, farmProduce, Commodity } from '@/data/commodities'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { BrowserProvider } from 'ethers'
import { useRouter } from 'next/navigation'
import { Contract, parseUnits } from 'ethers'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ASSETBIT_REGISTRY_ADDRESS, ASSETBIT_REGISTRY_ABI } from '@/contracts/AssetBitRegistry'
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts'
import { symbolToApiKey } from '@/lib/commodityMapping'

const TOKEN_RATE = 3800 // 1 token = $3,800

// Minimal ERC20 ABI for transfer
const MINIMAL_ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function balanceOf(address account) public view returns (uint256)"
]

// List of all available commodities (symbols, names, and addresses)
const ALL_COMMODITIES = [
  { symbol: 'XAU', name: 'Gold', address: '0x3a57599eb64ba2534d39410320ede8f0bc600210' },
  { symbol: 'XAG', name: 'Silver', address: '0xa1b2a4a930d34bf58f6134e41337bc2ed1bfd8f9' },
  { symbol: 'PLATINUM', name: 'Platinum', address: '0x7542a97161512b18e0efaeac760020e6cbe036ed' },
  { symbol: 'COPPER', name: 'Copper', address: '0x1af03c641d019d2c8e12cb67e75035831d33114e' },
  { symbol: 'ALUMINIUM', name: 'Aluminium', address: '0x7e343b1bb2e93627a210fa6b96ed77089e557309' },
  { symbol: 'OIL', name: 'Oil', address: '0xb57ac35838f722fc113545668d1d631fe0e1b706' },
  { symbol: 'NATGAS', name: 'Natural Gas', address: '0x9e79d4e1ee62888b70ddf18df9284b6928b16c1b' },
  { symbol: 'WHEAT', name: 'Wheat', address: '0x9223716951fc4fb5168ba05840a651f0f9652c6f' },
  { symbol: 'CORN', name: 'Corn', address: '0x0e266e52b4fc8aa10a678afc9d1739751a787c62' },
  { symbol: 'SUGAR', name: 'Sugar', address: '0x45d0d58d524b70cd0842e66806d476c9f8179b1f' },
  { symbol: 'COTTON', name: 'Cotton', address: '0xbcd5722d89970e0da8cd82ca5cdd979c5e36f0c7' },
  { symbol: 'LUMBER', name: 'Lumber', address: '0x7a8c89ebf7fe956c67e8f33c43dbb2e93e1b5362' },
  { symbol: 'LEANHOGS', name: 'Lean Hogs', address: '0x3f8a1e9e1f34d38ab321c6435659a661a21495d1' },
  { symbol: 'LIVECATTLE', name: 'Live Cattle', address: '0x2c72d72cdbc91a3f431983b1a9a367a9246a4d51' },
  { symbol: 'ORANGEJUICE', name: 'Orange Juice', address: '0x6a8c5619d779b271f15d37c6e44daeb63111bc2c' },
  { symbol: 'COCOA', name: 'Cocoa', address: '0xa42f266684ac2ad6ecb00df95b1c76efbb6f136c' },
  { symbol: 'COFFEE', name: 'Coffee', address: '0x3a7eb7375e4f8232cbd9cc9909f44a444d9d661b' },
  { symbol: 'CASHEW', name: 'Cashew', address: '0x9f4e2356fb2dc01fbc95e6c5c0c0c26ed73afe1d' },
  { symbol: 'PALLADIUM', name: 'Palladium', address: '0x6a8c5619d779b271f15d37c6e44daeb63111bc2d' }
]

export default function Trade() {
  const { data: session, status } = useSession()
  const [holdings, setHoldings] = useState<Array<{
    id: string;
    name: string;
    symbol: string;
    amount: number;
    value: number;
    change: string;
  }>>([])
  const [fromAsset, setFromAsset] = useState('')
  const [toAsset, setToAsset] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<{ received: number, fee: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sellRecipient, setSellRecipient] = useState('')
  const [showSellDialog, setShowSellDialog] = useState(false)
  const router = useRouter()
  const [wallet, setWallet] = useState({ connected: false, address: '' })
  const [chartData, setChartData] = useState<Array<{date: string, price: number}>>([])
  const [selectedInterval, setSelectedInterval] = useState('1d')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.selectedAddress) {
      setWallet({ connected: true, address: window.ethereum.selectedAddress })
    }
  }, [])

  // Add new useEffect for checking URL parameters
  useEffect(() => {
    // Check if there's a commodity parameter in the URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const commodity = params.get('commodity')
      
      if (commodity) {
        // If this commodity is in the user's holdings, set it as fromAsset
        if (holdings.some(h => h.symbol === commodity)) {
          setFromAsset(commodity)
        } else {
          // If not in holdings, set it as toAsset
          setToAsset(commodity)
        }
      }
    }
  }, [holdings])

  // Add new useEffect for selecting commodity and fetching price data
  useEffect(() => {
    if (fromAsset) {
      fetchCommodityPriceData(fromAsset)
    }
  }, [fromAsset, selectedInterval])

  const fetchCommodityPriceData = async (symbol: string) => {
    try {
      const apiKey = symbolToApiKey[symbol] || symbol.toLowerCase()
      const response = await fetch(`/api/commodity-prices?commodity=${apiKey}`)
      if (!response.ok) {
        throw new Error('Failed to fetch commodity data')
      }
      const data = await response.json()
      
      // Generate chart data from the history
      if (data.history && data.history[selectedInterval]) {
        const chartPoints = data.history[selectedInterval].map((point: {time: number, price: number}) => ({
          date: new Date(point.time).toLocaleTimeString(),
          price: point.price
        }))
        setChartData(chartPoints)
      }
    } catch (error) {
      console.error('Error fetching commodity data:', error)
      toast.error('Failed to load commodity price data')
      // Generate fallback chart data
      const basePrice = 100
      setChartData(Array.from({ length: 10 }, (_, i) => ({
        date: `${i+1}:00`,
        price: basePrice * (1 + (Math.random() - 0.5) * 0.1)
      })))
    }
  }

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const data = await res.json()
      setHoldings(Array.isArray(data.portfolio) ? data.portfolio : [])
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      toast.error('Failed to load your portfolio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTradeCalculate = () => {
    if (!fromAsset || !toAsset || !amount || Number(amount) <= 0) {
      toast.error('Please select assets and enter a valid amount.')
      setResult(null)
      return
    }
    if (!wallet.connected) {
      toast.error('Please connect your wallet first.')
      return
    }
    const fromAssetData = holdings.find(h => h.symbol === fromAsset)
    const toAssetData = ALL_COMMODITIES.find(c => c.symbol === toAsset)
    
    if (!fromAssetData) {
      toast.error('Invalid source asset selection.')
      setResult(null)
      return
    }
    
    if (fromAssetData.amount < Number(amount)) {
      toast.error('Insufficient balance for trade.')
      setResult(null)
      return
    }
    
    // Find or estimate the price of the target asset
    let toAssetPrice = 0;
    const toAssetHolding = holdings.find(h => h.symbol === toAsset);
    
    if (toAssetHolding) {
      // If user holds this asset, use its current price
      toAssetPrice = toAssetHolding.value / toAssetHolding.amount;
    } else {
      // Otherwise, find it in the commodities data
      const commodity = [...minerals, ...farmProduce].find(c => c.symbol === toAsset);
      if (commodity) {
        toAssetPrice = commodity.price;
      } else {
        toast.error('Cannot determine price for target asset.');
        setResult(null);
        return;
      }
    }
    
    const priceA = fromAssetData.value / fromAssetData.amount;
    const priceB = toAssetPrice;
    
    const quantityReceived = (priceA / priceB) * Number(amount);
    const fee = priceA * Number(amount) * 0.00001;
    
    setResult({ received: quantityReceived - fee, fee });
  }

  const handleTradeConfirm = async () => {
    if (!result || !fromAsset || !toAsset || !amount) {
      toast.error('Please calculate the trade first.');
      return;
    }
    
    const tradeButton = document.getElementById('confirm-trade-button') as HTMLButtonElement;
    if (tradeButton) {
      tradeButton.textContent = 'Processing...';
      tradeButton.disabled = true;
    }
    
    try {
      // Update holdings
      const updatedHoldings = [...holdings];
      const fromIdx = updatedHoldings.findIndex(h => h.symbol === fromAsset);
      
      if (fromIdx === -1) {
        toast.error('Source asset not found in your holdings.');
        return;
      }
      
      // Update source asset amount
      updatedHoldings[fromIdx] = {
        ...updatedHoldings[fromIdx],
        amount: updatedHoldings[fromIdx].amount - Number(amount),
        value: updatedHoldings[fromIdx].value - (updatedHoldings[fromIdx].value / updatedHoldings[fromIdx].amount) * Number(amount)
      };
      
      // Find or create target asset in holdings
      const toIdx = updatedHoldings.findIndex(h => h.symbol === toAsset);
      
      if (toIdx !== -1) {
        // Update existing holding
        updatedHoldings[toIdx] = {
          ...updatedHoldings[toIdx],
          amount: updatedHoldings[toIdx].amount + result.received,
          value: updatedHoldings[toIdx].value + (updatedHoldings[toIdx].value / updatedHoldings[toIdx].amount) * result.received
        };
      } else {
        // Create new holding
        const commodityInfo = ALL_COMMODITIES.find(c => c.symbol === toAsset);
        if (!commodityInfo) {
          toast.error('Target asset information not found.');
          return;
        }
        
        // Find price from commodities data
        const commodityData = [...minerals, ...farmProduce].find(c => c.symbol === toAsset);
        const price = commodityData ? commodityData.price : 0;
        
        updatedHoldings.push({
          id: commodityInfo.address,
          name: commodityInfo.name,
          symbol: toAsset,
          amount: result.received,
          value: result.received * price,
          change: '+0%'
        });
      }
      
      // Remove empty holdings
      const finalHoldings = updatedHoldings.filter(h => h.amount > 0);
      
      // Create transaction record
      const newTransaction = {
        type: 'trade',
        name: `${fromAsset}→${toAsset}`,
        amount: Number(amount),
        price: result.received,
        fee: result.fee,
        timestamp: new Date().toISOString(),
        status: 'Completed',
      };
      
      // Update backend
      const res = await fetch('/api/user/profile', { 
        method: 'GET',
        credentials: 'include' 
      });
      const user = await res.json();
      const transactions = [newTransaction, ...(user.transactions || [])];
      
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ portfolio: finalHoldings, transactions }),
      });
      
      // Update local state
      setHoldings(finalHoldings);
      setResult(null);
      setFromAsset('');
      setToAsset('');
      setAmount('');
      
      toast.success('Trade completed successfully!');
    } catch (err) {
      console.error('Trade error:', err);
      toast.error('Trade failed to complete.');
    } finally {
      if (tradeButton) {
        tradeButton.textContent = 'Confirm Trade';
        tradeButton.disabled = false;
      }
    }
  }

  const handleSell = async () => {
    if (!fromAsset || !amount || Number(amount) <= 0 || !sellRecipient) {
      toast.error('Please select an asset, enter a valid amount, and provide a recipient address.')
      return
    }
    
    const sellButton = document.getElementById('confirm-sell-button') as HTMLButtonElement;
    if (sellButton) {
      sellButton.textContent = 'Processing...';
      sellButton.disabled = true;
    }
    
    const holding = holdings.find(h => h.symbol === fromAsset)
    if (!holding || holding.amount < Number(amount)) {
      toast.error('Not enough asset to sell.')
      return
    }
    
    try {
      // Off-chain update: update backend only
      const res = await fetch('/api/user/profile', { 
        method: 'GET',
        credentials: 'include' 
      })
      const user = await res.json()
      const updatedHoldings = holdings.map(h =>
        h.symbol === fromAsset
          ? { ...h, amount: h.amount - Number(amount), value: h.value - (h.value / h.amount) * Number(amount) }
          : h
      ).filter(h => h.amount > 0)
      const transactions = [
        {
          type: 'sell',
          symbol: holding.symbol,
          name: holding.name,
          amount: Number(amount),
          price: holding.value / holding.amount,
          total: (holding.value / holding.amount) * Number(amount),
          timestamp: new Date().toISOString(),
          status: 'Completed',
          recipient: sellRecipient,
        },
        ...(user.transactions || [])
      ]
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ portfolio: updatedHoldings, transactions }),
      })
      setHoldings(updatedHoldings)
      toast.success('Sale successful!')
      setAmount('')
      setSellRecipient('')
      setShowSellDialog(false)
    } catch (err) {
      console.error('Sale failed:', err)
      toast.error('Sale failed.')
    } finally {
      if (sellButton) {
        sellButton.textContent = 'Confirm Sale';
        sellButton.disabled = false;
      }
    }
  }

  // Update dropdown styles for better visibility
  const dropdownClass = "w-full bg-gray-900 text-white rounded-lg p-2 mt-1 border border-white/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base shadow-lg placeholder-gray-400";

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: 'url(/images/TRADE_COMMODITY.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <div className="max-w-xl mx-auto py-12 px-4 relative z-10">
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Trade Commodities</CardTitle>
              {!wallet.connected ? (
                <Button
                  onClick={async () => {
                    if (typeof window === 'undefined' || !window.ethereum || typeof window.ethereum.request !== 'function') {
                      toast.error('MetaMask is not installed!')
                      return
                    }
                    try {
                      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
                      setWallet({ connected: true, address: accounts[0] })
                      toast.success('Wallet connected!')
                    } catch (err) {
                      toast.error('Wallet connection failed.')
                    }
                  }}
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-gray-900"
                >
                  Connect MetaMask
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-green-400">Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="from-asset">From Asset</Label>
                <select
                  id="from-asset"
                  value={fromAsset}
                  onChange={(e) => setFromAsset(e.target.value)}
                  className={dropdownClass}
                  required
                >
                  <option value="">Select asset</option>
                  {holdings.filter(h => h.amount > 0).map((h) => (
                    <option key={h.symbol} value={h.symbol}>
                      {h.name} ({h.symbol}) - {h.amount.toFixed(6)} units
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Add price chart when an asset is selected */}
              {fromAsset && chartData.length > 0 && (
                <div className="bg-white/10 rounded-lg p-4 my-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold">{ALL_COMMODITIES.find(c => c.symbol === fromAsset)?.name || fromAsset} Price</h3>
                    <div className="flex space-x-1">
                      {['5m', '15m', '1h', '4h', '1d', '1w', '1mo'].map(interval => (
                        <button
                          key={interval}
                          onClick={() => setSelectedInterval(interval)}
                          className={`px-2 py-1 text-xs rounded ${selectedInterval === interval 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                          {interval}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#888" 
                          tick={{fill: '#888'}}
                          fontSize={10}
                        />
                        <YAxis 
                          stroke="#888" 
                          tick={{fill: '#888'}}
                          fontSize={10}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{backgroundColor: '#222', borderColor: '#444'}} 
                          labelStyle={{color: '#888'}}
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#4ade80" 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{r: 6, stroke: '#4ade80', strokeWidth: 2, fill: '#111'}}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="to-asset">To Asset</Label>
                <select
                  id="to-asset"
                  value={toAsset}
                  onChange={(e) => setToAsset(e.target.value)}
                  className={dropdownClass}
                  required
                >
                  <option value="">Select asset</option>
                  {ALL_COMMODITIES.filter(c => c.symbol !== fromAsset).map((c) => (
                    <option key={c.symbol} value={c.symbol}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.00000001"
                  step="any"
                  value={amount || ''}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-white/20 border border-white/30 text-white placeholder-gray-300"
                />
              </div>
              <Button onClick={handleTradeCalculate} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold shadow-lg" disabled={isLoading || !fromAsset || !toAsset || !amount || Number(amount) <= 0}>
                Calculate Trade
              </Button>
              {result && (
                <div className="bg-white/10 rounded-lg p-4 text-white">
                  <div>Quantity Received: <span className="font-bold">{result.received.toFixed(6)}</span></div>
                  <div>Trade Fee: <span className="font-bold text-yellow-300">${result.fee.toFixed(6)}</span></div>
                </div>
              )}
              <Button id="confirm-trade-button" onClick={handleTradeConfirm} className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black font-bold shadow-lg" disabled={isLoading || !result}>
                Confirm Trade
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">or</span>
                </div>
              </div>
              <Button onClick={() => setShowSellDialog(true)} className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold shadow-lg">
                Sell Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Sell Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sell-asset">Asset to Sell</Label>
              <select
                id="sell-asset"
                className={dropdownClass}
                value={fromAsset}
                onChange={e => setFromAsset(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select asset</option>
                {holdings.filter(h => h.amount > 0).map(h => (
                  <option key={h.symbol} value={h.symbol}>
                    {h.name} ({h.symbol}) - {h.amount.toFixed(6)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sell-amount">Amount</Label>
              <Input
                id="sell-amount"
                type="number"
                min="0.00000001"
                step="any"
                value={amount || ''}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-white/20 border border-white/30 text-white placeholder-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="sell-recipient">Recipient Address</Label>
              <Input
                id="sell-recipient"
                type="text"
                value={sellRecipient}
                onChange={e => setSellRecipient(e.target.value)}
                placeholder="0x..."
                className="bg-white/20 border border-white/30 text-white placeholder-gray-300"
              />
            </div>
            <Button id="confirm-sell-button" onClick={handleSell} className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold shadow-lg" disabled={isLoading || !fromAsset || !amount || Number(amount) <= 0 || !holdings.some(h => h.symbol === fromAsset && h.amount >= Number(amount)) || !sellRecipient}>
              {isLoading ? 'Processing...' : 'Confirm Sale'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
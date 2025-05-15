'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { BrowserProvider, Contract, parseUnits } from 'ethers'
import { ASSETBIT_REGISTRY_ADDRESS, ASSETBIT_REGISTRY_ABI } from '@/contracts/AssetBitRegistry'
import { COMMODITY_TOKEN_CONFIGS } from '@/contracts/CommodityToken'
import Image from 'next/image'
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line } from 'recharts'
import { useRouter } from 'next/navigation'
import { minerals, farmProduce } from '@/data/commodities'
import { motion } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { getApiKey } from '@/lib/commodityMapping'

// Mock chart data (candlestick style)
const generateChartData = (commodity: any) => {
  return Array.from({ length: 30 }, (_, i) => {
    const base = commodity.price * (1 + (Math.random() - 0.5) * 0.1)
    const open = base * (1 + (Math.random() - 0.5) * 0.02)
    const close = base * (1 + (Math.random() - 0.5) * 0.02)
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    const volume = Math.floor(Math.random() * 1000 + 500)
    return {
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      open,
      close,
      high,
      low,
      volume,
    }
  })
}

// Helper to get commodity config by symbol or name
function getCommodityConfig(symbolOrName: string) {
  return COMMODITY_TOKEN_CONFIGS.find(
    c => c.symbol.toLowerCase() === symbolOrName.toLowerCase() || c.commodityType.toLowerCase() === symbolOrName.toLowerCase()
  )
}

export default function Marketplace() {
  const { data: session, status } = useSession()
  const [selectedCommodity, setSelectedCommodity] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [showBuyDialog, setShowBuyDialog] = useState(false)
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [wallet, setWallet] = useState({ connected: false, address: '' })
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
    // Check if already connected
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.selectedAddress) {
      setWallet({ connected: true, address: window.ethereum.selectedAddress })
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const data = await res.json()
      setProfile(data)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      toast.error('Failed to load your profile')
    }
  }

  const handleCommoditySelect = async (commodity: any) => {
    setSelectedCommodity(commodity)
    setChartData(generateChartData(commodity))
    
    // Fetch real-time price data
    try {
      const response = await fetch(`/api/commodity-prices?commodity=${getApiKey(commodity.symbol)}`)
      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setSelectedCommodity((prev: any) => ({
          ...prev,
          price: data.price,
          change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%`,
          id: prev?.id !== undefined ? prev.id : 0,
          name: prev?.name || '',
          symbol: prev?.symbol || '',
          image: prev?.image || ''
        }) as any)
      }
    } catch (error) {
      console.error('Error fetching commodity price:', error)
      toast.error('Failed to fetch commodity price')
    }
  }

  const handleBuy = async () => {
    if (!selectedCommodity || !amount || Number(amount) <= 0) {
      toast.error('Please select a commodity and enter a valid amount.')
      return
    }
    if (!wallet.connected) {
      toast.error('Please connect your MetaMask wallet first.')
      return
    }
    const tokenConfig = getCommodityConfig(selectedCommodity.name || selectedCommodity.symbol)
    if (!tokenConfig || !tokenConfig.address) {
      toast.error('Token config not found for selected commodity.')
      return
    }
    try {
      const provider = new BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const commodityToken = new Contract(tokenConfig.address, tokenConfig.abi, signer)
      const assetBitRegistry = new Contract(ASSETBIT_REGISTRY_ADDRESS, ASSETBIT_REGISTRY_ABI, signer)
      let decimals = 18
      try {
        if (typeof commodityToken.decimals === 'function') {
          decimals = await commodityToken.decimals()
        }
      } catch (decErr) {}
      const value = parseUnits(amount, decimals)
      const balance = await commodityToken.balanceOf(wallet.address)
      if (balance < value) {
        toast.error('Insufficient token balance.')
        return
      }
      const allowance = await commodityToken.allowance(wallet.address, ASSETBIT_REGISTRY_ADDRESS)
      if (allowance < value) {
        const approveTx = await commodityToken.approve(ASSETBIT_REGISTRY_ADDRESS, value)
        await approveTx.wait()
      }
      const tx = await assetBitRegistry.registerAsset(tokenConfig.commodityType, `Purchased ${amount} via dApp`)
      await tx.wait()
      toast.success(`Bought and registered ${amount} ${tokenConfig.commodityType}`)
      setAmount('')
      // Update local state without loading screen
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const data = await res.json()
      const portfolio = Array.isArray(data.portfolio) ? data.portfolio : []
      const idx = portfolio.findIndex((h: any) => h.symbol === tokenConfig.symbol)
      let updatedPortfolio: any[] = [...portfolio]
      if (idx !== -1) {
        updatedPortfolio = [...portfolio]
        updatedPortfolio[idx] = {
          ...updatedPortfolio[idx],
          amount: updatedPortfolio[idx].amount + Number(amount),
          value: selectedCommodity.price ? selectedCommodity.price * (updatedPortfolio[idx].amount + Number(amount)) : updatedPortfolio[idx].value,
        }
      } else {
        updatedPortfolio = [
          ...portfolio,
          {
            id: tokenConfig.address,
            name: tokenConfig.commodityType,
            symbol: tokenConfig.symbol,
            amount: Number(amount),
            value: selectedCommodity.price ? selectedCommodity.price * Number(amount) : 0,
            change: '+0%'
          }
        ]
      }
      const transactions = [
        ...(data.transactions || []),
        {
          type: 'buy',
          symbol: tokenConfig.symbol,
          name: tokenConfig.commodityType,
          amount: Number(amount),
          price: selectedCommodity.price,
          total: Number(amount) * selectedCommodity.price,
          tokens: (Number(amount) * selectedCommodity.price) / 3800,
          timestamp: new Date().toISOString(),
          wallet: wallet.address,
        }
      ]
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ portfolio: updatedPortfolio, transactions }),
      })
      setProfile((prev: any) => ({ ...prev, portfolio: updatedPortfolio, transactions }))
    } catch (err: any) {
      let message = 'Transaction failed or rejected.'
      if (err?.data?.message) message = err.data.message
      else if (err?.message) message = err.message
      toast.error(message)
      console.error(err)
    }
  }

  const handleSell = async () => {
    if (!selectedCommodity || !amount || Number(amount) <= 0 || !wallet.connected) {
      toast.error('Please select a commodity, enter a valid amount, and connect your wallet.')
      return
    }
    // Find the holding by symbol
    const holding = profile?.portfolio?.find((h: any) => h.symbol === (selectedCommodity.symbol || selectedCommodity))
    if (!holding || holding.amount < Number(amount)) {
      toast.error('Not enough asset to sell or invalid commodity.')
      return
    }
    try {
      // Off-chain update: update backend only
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      const user = await res.json()
      let updatedPortfolio = [...profile.portfolio]
      const idx = updatedPortfolio.findIndex((h: any) => h.symbol === holding.symbol)
      if (idx !== -1 && updatedPortfolio[idx].amount >= Number(amount)) {
        updatedPortfolio[idx] = {
          ...updatedPortfolio[idx],
          amount: updatedPortfolio[idx].amount - Number(amount),
          value: selectedCommodity.price ? selectedCommodity.price * (updatedPortfolio[idx].amount - Number(amount)) : updatedPortfolio[idx].value,
        }
        if (updatedPortfolio[idx].amount <= 0) {
          updatedPortfolio = updatedPortfolio.filter((h: any) => h.symbol !== holding.symbol)
        }
      }
      // Sync with backend
      const transactions = [
        {
          type: 'sell',
          symbol: holding.symbol,
          name: holding.name,
          amount: Number(amount),
          price: selectedCommodity.price,
          total: Number(amount) * selectedCommodity.price,
          tokens: (Number(amount) * selectedCommodity.price) / 3800,
          timestamp: new Date().toISOString(),
          wallet: wallet.address,
        },
        ...(user.transactions || [])
      ]
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ portfolio: updatedPortfolio, transactions }),
      })
      setProfile((prev: any) => ({ ...prev, portfolio: updatedPortfolio, transactions }))
      toast.success(`Successfully sold ${amount} ${holding.name}`)
      setShowSellDialog(false)
      setAmount('')
    } catch (err: any) {
      toast.error('Transaction failed or rejected.')
      console.error(err)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading marketplace..." />
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Marketplace</h1>
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
        
        {/* Selected Commodity Details */}
        {selectedCommodity && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{selectedCommodity.name} ({selectedCommodity.symbol})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="relative h-64 mb-4">
                      <Image
                        src={selectedCommodity.image}
                        alt={selectedCommodity.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Current Price</p>
                        <p className="text-2xl font-bold text-white">${selectedCommodity.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">24h Change</p>
                        <p className={`text-2xl font-bold ${selectedCommodity.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedCommodity.change}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <Button
                        onClick={() => setShowBuyDialog(true)}
                        disabled={!wallet.connected || loading}
                        className="w-full"
                      >
                        {loading ? 'Processing...' : 'Buy'}
                      </Button>
                      <Button
                        onClick={() => setShowSellDialog(true)}
                        disabled={!wallet.connected || loading}
                        variant="outline"
                        className="w-full text-white border-white hover:bg-white hover:text-gray-900"
                      >
                        {loading ? 'Processing...' : 'Sell'}
                      </Button>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#aaa" />
                        <YAxis stroke="#aaa" domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                        {/* Candlestick bars */}
                        {chartData.length > 0 && chartData[0].open !== undefined && (
                          chartData.map((d, i) => (
                            <rect
                              key={i}
                              x={i * (100 / chartData.length) + 10}
                              y={Math.min(d.open, d.close)}
                              width={6}
                              height={Math.abs(d.open - d.close)}
                              fill={d.close > d.open ? '#26a69a' : '#ef5350'}
                              stroke="#222"
                              style={{ position: 'absolute' }}
                            />
                          ))
                        )}
                        {/* Volume bars */}
                        <Bar dataKey="volume" barSize={8} fill="#8884d8" opacity={0.3} />
                        {/* Price line for reference */}
                        <Line type="monotone" dataKey="close" stroke="#26a69a" dot={false} strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Minerals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {minerals.map((commodity) => (
            <motion.div
              key={commodity.id}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 rgba(255,255,0,0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="card hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              onClick={() => handleCommoditySelect(commodity)}
            >
              <div className="relative h-48 mb-4">
                <Image
                  src={commodity.image}
                  alt={commodity.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{commodity.name}</h3>
                  <p className="text-gray-300">{commodity.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${commodity.price.toLocaleString()}</p>
                  <p className={`${commodity.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {commodity.change}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold text-green-400 mb-4">Farm Produce</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {farmProduce.map((commodity) => (
            <motion.div
              key={commodity.id}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 rgba(255,255,0,0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="card hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              onClick={() => handleCommoditySelect(commodity)}
            >
              <div className="relative h-48 mb-4">
                <Image
                  src={commodity.image}
                  alt={commodity.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{commodity.name}</h3>
                  <p className="text-gray-300">{commodity.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${commodity.price.toLocaleString()}</p>
                  <p className={`${commodity.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {commodity.change}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {selectedCommodity?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0.00000001"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
              />
            </div>
            <div className="text-sm text-gray-400">
              <p>Current Price: ${selectedCommodity?.price.toLocaleString()}</p>
              <p>Total Cost: ${(selectedCommodity?.price * Number(amount) || 0).toLocaleString()}</p>
              <p>Tokens Required: {(selectedCommodity?.price * Number(amount) / 3800 || 0).toFixed(8)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={async () => {
                if (!selectedCommodity || !amount || Number(amount) <= 0) {
                  toast.error('Please select a commodity and enter a valid amount.')
                  return
                }
                
                const buyButton = document.activeElement as HTMLButtonElement;
                if (buyButton) buyButton.textContent = 'Processing...';
                buyButton.disabled = true;
                
                try {
                  await handleBuy()
                  setShowBuyDialog(false)
                } finally {
                  if (buyButton) {
                    buyButton.textContent = 'Buy';
                    buyButton.disabled = false;
                  }
                }
              }} 
              disabled={loading || !amount || Number(amount) <= 0}
            >
              {loading ? 'Processing...' : 'Buy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell {selectedCommodity?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0.00000001"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
              />
            </div>
            <div className="text-sm text-gray-400">
              <p>Current Price: ${selectedCommodity?.price.toLocaleString()}</p>
              <p>Total Value: ${(selectedCommodity?.price * Number(amount) || 0).toLocaleString()}</p>
              <p>Tokens to Receive: {(selectedCommodity?.price * Number(amount) / 3800 || 0).toFixed(8)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!selectedCommodity || !amount || Number(amount) <= 0) {
                  toast.error('Please select a commodity and enter a valid amount.')
                  return
                }
                
                const sellButton = document.activeElement as HTMLButtonElement;
                if (sellButton) sellButton.textContent = 'Processing...';
                sellButton.disabled = true;
                
                try {
                  await handleSell()
                  setShowSellDialog(false)
                } finally {
                  if (sellButton) {
                    sellButton.textContent = 'Sell';
                    sellButton.disabled = false;
                  }
                }
              }}
              disabled={loading || !amount || Number(amount) <= 0}
            >
              {loading ? 'Processing...' : 'Sell'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { minerals, farmProduce, Commodity } from '@/data/commodities'
import { getApiKey } from '@/lib/commodityMapping'
import { toast } from 'sonner'
import TradingViewChart from '@/components/TradingViewChart'
import Image from 'next/image'

export default function Market() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState('all')
  const [chartInterval, setChartInterval] = useState('1d')
  const [watchlist, setWatchlist] = useState<Commodity[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    // Combine all commodities
    setCommodities([...minerals, ...farmProduce])
    
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem('assetbit-watchlist')
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist)
        setWatchlist(parsed)
      } catch (e) {
        console.error('Failed to parse watchlist:', e)
      }
    }
  }, [status, router])

  useEffect(() => {
    if (selectedCommodity && selectedCommodity.symbol) {
      fetchCommodityPrice(selectedCommodity, chartInterval);
    }
  }, [selectedCommodity?.id, chartInterval]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const fetchCommodityPrice = async (commodity: Commodity, interval: string) => {
    if (!commodity || !commodity.symbol) return;
    
    setIsLoading(true);
    try {
      const apiKey = getApiKey(commodity.symbol);
      const response = await fetch(`/api/commodity-prices?commodity=${apiKey}&interval=${interval}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      // Create a new Commodity object with all required fields
      setSelectedCommodity({
        id: commodity.id,
        name: commodity.name,
        symbol: commodity.symbol,
        price: data.price,
        change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%`,
        image: commodity.image || ''
      });
      
      if (data.history && data.history[interval]) {
        setChartData(data.history[interval]);
      }
    } catch (error) {
      console.error('Error fetching commodity price:', error);
      toast.error('Failed to fetch commodity price data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommoditySelect = (commodity: Commodity) => {
    if (selectedCommodity?.id === commodity.id) return; // Don't reselect the same commodity
    setSelectedCommodity(commodity);
  };

  const toggleWatchlist = (commodity: Commodity) => {
    const exists = watchlist.some(item => item.id === commodity.id)
    let newWatchlist: Commodity[]
    
    if (exists) {
      newWatchlist = watchlist.filter(item => item.id !== commodity.id)
      toast.success(`Removed ${commodity.name} from watchlist`)
    } else {
      newWatchlist = [...watchlist, commodity]
      toast.success(`Added ${commodity.name} to watchlist`)
    }
    
    setWatchlist(newWatchlist)
    localStorage.setItem('assetbit-watchlist', JSON.stringify(newWatchlist))
  }

  const isInWatchlist = (commodity: Commodity) => {
    return watchlist.some(item => item.id === commodity.id)
  }

  const handleTradeClick = () => {
    if (selectedCommodity) {
      router.push(`/trade?commodity=${selectedCommodity.symbol}`)
    }
  }

  // Filter commodities based on selected tab and search term
  const filteredCommodities = commodities.filter(commodity => {
    const matchesSearch = commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         commodity.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedTab === 'all') return matchesSearch
    if (selectedTab === 'minerals') return minerals.some(m => m.id === commodity.id) && matchesSearch
    if (selectedTab === 'agriculture') return farmProduce.some(f => f.id === commodity.id) && matchesSearch
    if (selectedTab === 'watchlist') return isInWatchlist(commodity) && matchesSearch
    
    return matchesSearch
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Market</h1>

      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search commodities..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Commodities</CardTitle>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="minerals">Minerals</TabsTrigger>
                  <TabsTrigger value="agriculture">Agriculture</TabsTrigger>
                  <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-900">
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Commodity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>24h Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommodities.map((commodity, index) => (
                      <TableRow
                        key={index}
                        className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          selectedCommodity?.id === commodity.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleCommoditySelect(commodity)}
                      >
                        <TableCell>
                          <button 
                            className="text-gray-400 hover:text-yellow-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(commodity);
                            }}
                          >
                            {isInWatchlist(commodity) ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {commodity.image && (
                            <div className="w-6 h-6 relative flex-shrink-0">
                              <Image
                                src={commodity.image}
                                alt={commodity.name}
                                fill
                                sizes="24px"
                                className="rounded-full object-cover"
                                priority={index < 8}
                              />
                            </div>
                          )}
                          <div>
                            <div>{commodity.name}</div>
                            <div className="text-xs text-gray-500">{commodity.symbol}</div>
                          </div>
                        </TableCell>
                        <TableCell>${commodity.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell
                          className={
                            parseFloat(commodity.change) >= 0 ? 'text-green-500' : 'text-red-500'
                          }
                        >
                          {commodity.change}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCommodities.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No commodities found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedCommodity ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {selectedCommodity.image && (
                        <div className="w-10 h-10 relative">
                          <Image
                            src={selectedCommodity.image}
                            alt={selectedCommodity.name}
                            fill
                            sizes="40px"
                            className="rounded-full object-cover"
                            priority
                          />
                        </div>
                      )}
                      <div>
                        <CardTitle>{selectedCommodity.name} ({selectedCommodity.symbol})</CardTitle>
                        <CardDescription>
                          Current Market Price
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        ${selectedCommodity.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div
                        className={
                          parseFloat(selectedCommodity.change) >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }
                      >
                        {selectedCommodity.change}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <TradingViewChart
                      data={chartData}
                      symbol={selectedCommodity.symbol}
                      interval={chartInterval}
                      width={800}
                      height={400}
                      onIntervalChange={setChartInterval}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => toggleWatchlist(selectedCommodity)}
                  >
                    {isInWatchlist(selectedCommodity) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </Button>
                  <Button onClick={handleTradeClick}>Trade {selectedCommodity.symbol}</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About {selectedCommodity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedCommodity.name} ({selectedCommodity.symbol}) is a traded commodity with spot price displayed in USD.
                    The price is updated in real-time and reflects global market conditions.
                    {selectedCommodity.symbol === 'XAU' && " Gold is considered a safe-haven asset and store of value."}
                    {selectedCommodity.symbol === 'XAG' && " Silver has both industrial applications and investment value."}
                    {selectedCommodity.symbol === 'OIL' && " Oil prices are influenced by global supply, demand, and geopolitical factors."}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Commodity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Click on a commodity in the table to view its details and trade.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import LoadingScreen from '@/components/ui/LoadingScreen'

// Sample market data for the animated chart
const marketChartData = [
  { name: 'Jan', gold: 1845, silver: 24.5, oil: 52 },
  { name: 'Feb', gold: 1813, silver: 27.3, oil: 59 },
  { name: 'Mar', gold: 1732, silver: 26.1, oil: 65 },
  { name: 'Apr', gold: 1769, silver: 25.9, oil: 62 },
  { name: 'May', gold: 1903, silver: 28.0, oil: 66 },
  { name: 'Jun', gold: 1879, silver: 27.5, oil: 74 },
  { name: 'Jul', gold: 1814, silver: 25.4, oil: 72 },
  { name: 'Aug', gold: 1813, silver: 23.9, oil: 70 },
  { name: 'Sep', gold: 1742, silver: 22.5, oil: 73 },
  { name: 'Oct', gold: 1783, silver: 23.9, oil: 83 },
  { name: 'Nov', gold: 1864, silver: 25.3, oil: 81 },
  { name: 'Dec', gold: 1820, silver: 23.8, oil: 79 },
];

// Animation variants for staggered animations
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const slideIn = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('gold')
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const testimonialsRef = useRef(null)
  const ctaRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: false, margin: "-100px 0px" })
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 })
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 })
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.3 })
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 })
  
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Handle loading state
  if (status === 'loading') {
    return <LoadingScreen message="Loading homepage..." />
  }
  
  const testimonials = [
    {
      text: "AssetBit transformed the way we manage our commodity investments. The platform is intuitive and provides real-time insights.",
      author: "Jennifer K.",
      title: "Investment Manager",
      avatar: "/images/avatar1.png"
    },
    {
      text: "The tokenization process is seamless and the trading experience is unmatched. We've seen significant efficiency gains.",
      author: "Michael T.",
      title: "Commodities Trader",
      avatar: "/images/avatar2.png"
    },
    {
      text: "Security and transparency are paramount in our industry. AssetBit delivers on both fronts with their blockchain technology.",
      author: "Sarah L.",
      title: "Compliance Officer",
      avatar: "/images/avatar3.png"
    }
  ];

  const stats = [
    { label: "Transactions", value: "25M+", icon: "📊" },
    { label: "Trading Volume", value: "$750M", icon: "💹" },
    { label: "Commodities", value: "100+", icon: "🪙" },
    { label: "Countries", value: "50+", icon: "🌍" }
  ];

  return (
    <main className="overflow-hidden">
      {/* Hero Section with Parallax Effect */}
      <section 
        ref={heroRef} 
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background with parallax effect */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: parallaxY }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 mix-blend-multiply z-10"></div>
          <div className="absolute inset-0 bg-[url('/images/commodity-bg.jpg')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-20"></div>
        </motion.div>

        <div className="container mx-auto px-4 z-10 relative">
          <AnimatePresence>
            {heroInView && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl mx-auto"
              >
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  Tokenize & Trade Real-World Assets
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
                >
                  AssetBit brings commodity trading to the blockchain, enabling secure, 
                  transparent, and efficient fractional ownership of real-world assets.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-xl shadow-xl hover:shadow-blue-500/20 transition-all duration-300 text-lg"
                  >
                    Start Trading Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/about')}
                    className="border-2 border-blue-500/50 text-white hover:bg-blue-500/10 font-bold py-6 px-8 rounded-xl transition-all duration-300 text-lg"
                  >
                    Learn More
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="mt-16 flex items-center justify-center gap-8"
                >
                  <span className="text-gray-400 text-sm uppercase tracking-wide">Trusted By</span>
                  <div className="flex gap-8 items-center">
                    <motion.span 
                      whileHover={{ scale: 1.05 }} 
                      className="text-xl font-bold text-white"
                    >
                      SonicLabs
                    </motion.span>
                    <motion.span 
                      whileHover={{ scale: 1.05 }} 
                      className="text-xl font-bold text-yellow-400"
                    >
                      KRNL
                    </motion.span>
                    <motion.span 
                      whileHover={{ scale: 1.05 }} 
                      className="text-xl font-bold text-blue-400"
                    >
                      BlockBridge
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm mb-2">Scroll down</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </motion.div>
      </section>
      
      {/* Interactive Market Section */}
      <section className="py-24 bg-gradient-to-b from-background to-blue-900/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerChildren}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4 text-primary"
            >
              Real-Time Market Insights
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Track commodity prices, analyze trends, and make informed trading decisions.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1">
              <motion.div
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={staggerChildren}
                className="space-y-4"
              >
                {['gold', 'silver', 'oil'].map((commodity) => (
                  <motion.div
                    key={commodity}
                    variants={slideIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(commodity)}
                    className={`${
                      activeTab === commodity
                        ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-l-4 border-blue-500'
                        : 'bg-gray-800/30 hover:bg-gray-800/50'
                    } p-6 rounded-lg cursor-pointer transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activeTab === commodity ? 'bg-blue-500' : 'bg-gray-700'
                      }`}>
                        <span className="text-xl">
                          {commodity === 'gold' ? '🪙' : commodity === 'silver' ? '⚪' : '🛢️'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg capitalize">{commodity}</h3>
                        <p className="text-sm text-muted-foreground">
                          {commodity === 'gold' ? 'XAU/USD' : commodity === 'silver' ? 'XAG/USD' : 'OIL/USD'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={featuresInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl"
              >
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketChartData}>
                      <defs>
                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc107" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffc107" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSilver" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#90a4ae" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#90a4ae" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          borderColor: '#4b5563',
                          color: '#f9fafb',
                          borderRadius: '8px',
                        }} 
                      />
                      {activeTab === 'gold' && (
                        <Area 
                          type="monotone" 
                          dataKey="gold" 
                          stroke="#ffc107" 
                          fillOpacity={1} 
                          fill="url(#colorGold)" 
                          name="Gold (USD/oz)"
                        />
                      )}
                      {activeTab === 'silver' && (
                        <Area 
                          type="monotone" 
                          dataKey="silver" 
                          stroke="#90a4ae" 
                          fillOpacity={1} 
                          fill="url(#colorSilver)" 
                          name="Silver (USD/oz)"
                        />
                      )}
                      {activeTab === 'oil' && (
                        <Area 
                          type="monotone" 
                          dataKey="oil" 
                          stroke="#4CAF50" 
                          fillOpacity={1} 
                          fill="url(#colorOil)" 
                          name="Crude Oil (USD/barrel)"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <h3 className="font-bold text-xl capitalize">{activeTab} Price</h3>
                    <p className="text-sm text-muted-foreground">Last 12 months</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/market')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Full Market
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerChildren}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              Powerful Trading Features
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Experience the next generation of commodity trading with these powerful features.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Fractional Ownership",
                desc: "Own and trade fractions of real-world assets with ease and transparency.",
                icon: "🪙",
                color: "from-blue-500 to-indigo-500"
              },
              {
                title: "Instant Liquidity",
                desc: "Trade tokenized commodities 24/7 on a secure, global platform.",
                icon: "💱",
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Blockchain Security",
                desc: "All transactions are secured and verifiable on-chain.",
                icon: "🔐",
                color: "from-red-500 to-pink-500"
              },
              {
                title: "Portfolio Management",
                desc: "Track, analyze, and optimize your holdings in real time.",
                icon: "📊",
                color: "from-amber-500 to-orange-500"
              },
              {
                title: "KYC & Compliance",
                desc: "Built-in identity verification and regulatory compliance.",
                icon: "✅",
                color: "from-purple-500 to-violet-500"
              },
              {
                title: "DeFi Integration",
                desc: "Leverage your assets in DeFi protocols for lending, staking, and more.",
                icon: "🏦",
                color: "from-cyan-500 to-blue-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 40px -15px rgba(59, 130, 246, 0.5)" }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="py-24 bg-gradient-to-br from-blue-900/20 to-indigo-900/20"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-lg text-center"
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-4">{stat.icon}</span>
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-primary mb-2"
                  >
                    {stat.value}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={statsInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
                    className="text-gray-400"
                  >
                    {stat.label}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        className="py-24"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={staggerChildren}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4 text-primary"
            >
              What Our Clients Say
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Join thousands of satisfied traders who trust AssetBit.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-lg"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <svg 
                      className="text-blue-500 opacity-30 w-12 h-12 mb-4"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="text-lg italic text-gray-300 mb-6">{testimonial.text}</p>
                  </div>
                  <div className="mt-auto flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-700 mr-4 flex items-center justify-center text-xl">
                      {testimonial.avatar ? (
                        <Image 
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : '👤'}
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.author}</h4>
                      <p className="text-sm text-gray-400">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="py-24 bg-gradient-to-br from-blue-900/30 to-indigo-900/30"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of traders who are already using AssetBit to tokenize and trade real-world assets.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link 
                href={session ? "/dashboard" : "/auth/signin"}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-10 rounded-xl shadow-xl hover:shadow-blue-500/20 transition-all duration-300 text-xl inline-block"
              >
                {session ? "Go to Dashboard" : "Create Free Account"}
              </Link>
            </motion.div>
            <p className="mt-6 text-gray-400">
              No credit card required • Full-featured 30-day trial
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function About() {
  return (
    <main className="min-h-screen bg-background text-foreground py-12">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-extrabold mb-4 text-primary tracking-tight"
        >
          About AssetBit
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          className="text-lg md:text-2xl text-muted-foreground mb-8"
        >
          AssetBit is revolutionizing commodity tokenization and trading on the blockchain. Our mission is to empower global trade with transparency, security, and ease.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-background border border-border rounded-2xl px-6 py-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-primary mb-2">Our Vision</h2>
            <p className="text-muted-foreground">To make real-world asset trading accessible, borderless, and secure for everyone.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
            className="bg-background border border-border rounded-2xl px-6 py-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-primary mb-2">Our Values</h2>
            <ul className="text-muted-foreground list-disc list-inside">
              <li>Transparency</li>
              <li>Innovation</li>
              <li>Security</li>
              <li>Global Inclusion</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="card bg-background border border-border rounded-2xl shadow-lg mb-16 p-8"
        >
          <h2 className="text-3xl font-bold text-center text-primary mb-10">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* FULLSTACK DEV */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(16,30,54,0.10)' }}
              className="flex flex-col items-center bg-background border border-border rounded-2xl p-6 shadow-md transition-all duration-200"
            >
              <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                <Image src="/images/team/samuel.jpg" alt="Samuel Okyere Nyarko" width={112} height={112} className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Samuel Okyere Nyarko</h3>
              <p className="text-primary font-semibold">Fullstack Developer</p>
              <p className="text-muted-foreground text-center mt-2">Expert in web, blockchain, and smart contract development. Passionate about building scalable, secure, and user-friendly platforms.</p>
            </motion.div>
            {/* LEAD DEV */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(16,30,54,0.10)' }}
              className="flex flex-col items-center bg-background border border-border rounded-2xl p-6 shadow-md transition-all duration-200"
            >
              <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                <Image src="/images/team/samuel.jpg" alt="Samuel Okyere Nyarko" width={112} height={112} className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Samuel Okyere Nyarko</h3>
              <p className="text-primary font-semibold">Lead Developer</p>
              <p className="text-muted-foreground text-center mt-2">Leading the technical vision and architecture of AssetBit. Ensuring code quality and best practices across the stack.</p>
            </motion.div>
            {/* UI/UX DEV */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(16,30,54,0.10)' }}
              className="flex flex-col items-center bg-background border border-border rounded-2xl p-6 shadow-md transition-all duration-200"
            >
              <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                <Image src="/images/team/allen.jpg" alt="Allen Sampah" width={112} height={112} className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Allen Sampah</h3>
              <p className="text-primary font-semibold">UI/UX Developer</p>
              <p className="text-muted-foreground text-center mt-2">Designs intuitive, beautiful, and accessible user experiences. Focused on user-centric design and seamless interaction.</p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            {/* FOUNDER & CO-FOUNDER */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(16,30,54,0.10)' }}
              className="flex flex-col items-center bg-background border border-border rounded-2xl p-6 shadow-md transition-all duration-200"
            >
              <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg flex items-center justify-center bg-muted">
                <span className="text-3xl font-bold text-primary">S & A</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Samuel & Allen</h3>
              <p className="text-primary font-semibold">Founder & Co-Founder</p>
              <p className="text-muted-foreground text-center mt-2">Visionaries behind AssetBit, driving innovation and growth in the digital asset space.</p>
            </motion.div>
            {/* BLOCKCHAIN DEV - updated to Samuel Okyere Nyarko */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(16,30,54,0.10)' }}
              className="flex flex-col items-center bg-background border border-border rounded-2xl p-6 shadow-md transition-all duration-200"
            >
              <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                <Image src="/images/team/samuel.jpg" alt="Samuel Okyere Nyarko" width={112} height={112} className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Samuel Okyere Nyarko</h3>
              <p className="text-primary font-semibold">Blockchain Developer</p>
              <p className="text-muted-foreground text-center mt-2">Specialist in blockchain protocols, smart contracts, and decentralized applications.</p>
            </motion.div>
            {/* SMART CONTRACT DEV */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(16,30,54,0.10)' }}
              className="flex flex-col items-center bg-background border border-border rounded-2xl p-6 shadow-md transition-all duration-200"
            >
              <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg flex items-center justify-center bg-muted">
                <span className="text-3xl font-bold text-primary">S & A</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Samuel & Allen</h3>
              <p className="text-primary font-semibold">Smart Contract Developers</p>
              <p className="text-muted-foreground text-center mt-2">Building secure, efficient, and innovative smart contracts for the AssetBit ecosystem.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTheme } from 'next-themes'
import { Sun, Moon, Laptop } from 'lucide-react'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: false,
  })
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    // Load saved preferences
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'system'
      const savedNotifications = localStorage.getItem('notificationsEnabled') === 'true'
      const savedEmailNotifications = localStorage.getItem('emailNotifications') === 'true'
      const savedPushNotifications = localStorage.getItem('pushNotifications') === 'true'
      setTheme(savedTheme)
      setFormData(prev => ({
        ...prev,
        notificationsEnabled: savedNotifications,
        emailNotifications: savedEmailNotifications,
        pushNotifications: savedPushNotifications,
      }))
    }
    setMounted(true)
  }, [status, router])

  if (status === 'loading') {
    return <LoadingScreen message="Loading settings..." />
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Password validation
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match.')
          return
        }
        if (formData.newPassword.length < 8) {
          toast.error('Password must be at least 8 characters.')
          return
        }
        // TODO: Implement password change API call
      }

      // Save notification and theme preferences
      if (typeof window !== 'undefined') {
        localStorage.setItem('notificationsEnabled', String(formData.notificationsEnabled))
        localStorage.setItem('emailNotifications', String(formData.emailNotifications))
        localStorage.setItem('pushNotifications', String(formData.pushNotifications))
        localStorage.setItem('theme', theme || 'system')
      }

      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        // System theme
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }

      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: 'url(/images/SETTINGS_COMMODITY.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <Avatar className="w-16 h-16 shadow-lg ring-2 ring-primary/20">
            <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
            <AvatarFallback className="bg-primary/20 text-primary-foreground">
              {session?.user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Settings</h1>
            <p className="text-gray-400">Manage your account, security, and preferences</p>
          </div>
        </motion.div>
        <Tabs defaultValue="password" className="w-full max-w-2xl mx-auto">
          <TabsList className="mb-4">
            <TabsTrigger value="password">Change Password</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          <TabsContent value="password">
            <form onSubmit={handleSubmit} className="space-y-8">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      className="bg-white/20 border border-white/30 text-white placeholder-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="bg-white/20 border border-white/30 text-white placeholder-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="bg-white/20 border border-white/30 text-white placeholder-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold shadow-lg hover:from-green-500 hover:to-green-700 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="account">
            <form className="space-y-8">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Change Username or Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={session?.user?.email || formData.email}
                      readOnly
                      className="bg-white/20 border border-white/30 text-white placeholder-gray-300 cursor-not-allowed"
                    />
                  </div>
                  {/* Add username field if needed */}
                </CardContent>
              </Card>
            </form>
          </TabsContent>
          <TabsContent value="security">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="twoFactorEnabled"
                    name="twoFactorEnabled"
                    checked={formData.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, twoFactorEnabled: checked }))
                    }
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
                {/* Add recovery codes, etc. here if needed */}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
                    <p className="text-sm text-gray-400">
                      Receive notifications about your account activity
                    </p>
                  </div>
                  <Switch
                    id="notificationsEnabled"
                    name="notificationsEnabled"
                    checked={formData.notificationsEnabled}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, notificationsEnabled: checked }))
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, emailNotifications: checked }))
                    }
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-400">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    name="pushNotifications"
                    checked={formData.pushNotifications}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, pushNotifications: checked }))
                    }
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preferences">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Theme Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose your preferred theme for the website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className={`${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-black'
                        : 'bg-transparent text-white border-white/20'
                    } font-bold hover:from-yellow-300 hover:to-yellow-500 transition-all duration-200`}
                    disabled={!mounted}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className={`${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                        : 'bg-transparent text-white border-white/20'
                    } font-bold hover:from-gray-600 hover:to-gray-800 transition-all duration-200`}
                    disabled={!mounted}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className={`${
                      theme === 'system'
                        ? 'bg-gradient-to-r from-blue-200 to-blue-400 text-black'
                        : 'bg-transparent text-white border-white/20'
                    } font-bold hover:from-blue-300 hover:to-blue-500 transition-all duration-200`}
                    disabled={!mounted}
                  >
                    <Laptop className="w-4 h-4 mr-2" />
                    System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
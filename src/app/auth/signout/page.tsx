import Link from 'next/link'

export default function SignOutPage() {
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundImage: 'url(/images/login.png)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <div className="max-w-md w-full space-y-8 relative z-10 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-white">You have been signed out</h2>
        <p className="text-gray-300">Thank you for using AssetBit.</p>
        <Link href="/auth/signin" className="btn-primary inline-block mt-6">Sign In Again</Link>
      </div>
    </div>
  )
} 
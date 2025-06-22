import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="auth-page h-screen w-full flex overflow-hidden bg-white">
      {/* Left Side - Sign Up */}
      <div className="flex-1 lg:flex-none lg:w-1/2 relative flex flex-col bg-white">
        {/* Logo */}
        <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-10">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={33}
            className="object-contain lg:w-[120px] lg:h-[40px]"
          />
        </div>
        
        {/* Sign Up Component */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8 pt-20 lg:pt-24">
          <div className="w-full max-w-md">
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-0 bg-transparent",
                  headerTitle: "text-2xl font-semibold text-gray-900",
                  headerSubtitle: "text-gray-600",
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Banner Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100">
        <Image
          src="/auth/banner.png"
          alt="Authentication Banner"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}

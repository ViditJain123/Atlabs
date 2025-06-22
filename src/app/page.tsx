import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import AddListComponent from "./components/AddListComponent";

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last;
}

export default async function Home() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  
  const initials = user ? getInitials(user.firstName, user.lastName) : 'U';

  return (
    <div className="min-h-screen bg-white">
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Please sign in
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Header */}
        <header className="w-full flex items-center justify-between p-6 lg:p-8">
          {/* Logo */}
          <div>
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={33}
              className="object-contain lg:w-[120px] lg:h-[40px]"
            />
          </div>

          {/* User Profile Circle */}
          <div 
            className="rounded-full flex items-center justify-center text-white font-semibold"
            style={{ 
              backgroundColor: '#D52121',
              width: '32px',
              height: '32px',
              fontSize: '16px'
            }}
          >
            {initials}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 py-12">
          {/* Title */}
          <div className="w-full max-w-[920px] mx-auto mb-6">
            <h1 className="text-[18px] font-bold text-gray-900 text-left">
              Your To Do Lists
            </h1>
          </div>
          
          {/* Center Component */}
          <div className="flex-1 flex items-center justify-center">
            <AddListComponent />
          </div>
        </main>

        
      </SignedIn>
    </div>
  );
}

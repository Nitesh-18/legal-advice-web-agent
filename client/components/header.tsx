"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { logout, getAuthToken } from "@/lib/api"
import { useRouter } from "next/navigation"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(!!getAuthToken())
    }
    checkAuth()
    window.addEventListener('authChange', checkAuth)
    return () => window.removeEventListener('authChange', checkAuth)
  }, [])

  const handleLogout = () => {
    logout()
    setIsAuth(false)
    window.dispatchEvent(new Event('authChange'))
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-primary">⚖️</div>
            <span className="text-lg font-bold text-foreground">Legal Advice Web Agent</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#case-explorer"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Case Explorer
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuth ? (
              <>
                <Link href="/chat">
                  <Button className="hidden md:inline-flex bg-primary hover:bg-primary/90 shadow-md transition-all">Go to Chat</Button>
                </Link>
                <Button variant="outline" className="hidden md:inline-flex" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="hidden md:inline-flex bg-primary hover:bg-primary/90 shadow-md transition-all">Login / Sign up</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col gap-4 pb-4">
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#case-explorer"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Case Explorer
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
            {isAuth ? (
              <>
                <Link href="/chat" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 shadow-md transition-all">Go to Chat</Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Link href="/login" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 shadow-md transition-all">Login / Sign up</Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

import { Facebook, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">⚖️</div>
              <span className="font-bold text-lg">Legal Advice Web Agent</span>
            </div>
            <p className="text-sm opacity-90 mb-4">
              AI-powered legal insights for Indian court cases. Get clarity faster.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:opacity-80 transition-opacity">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#case-explorer" className="hover:opacity-80 transition-opacity">
                  Case Explorer
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  Model Versions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm opacity-90 mb-4">Subscribe for the latest legal insights and updates.</p>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-3 py-2 rounded bg-primary-foreground text-primary text-sm placeholder:text-primary/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <p className="text-sm opacity-80 text-center">
            © 2026 Legal Advice Web Agent. All rights reserved. 
          </p>
        </div>
      </div>
    </footer>
  )
}

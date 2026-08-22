import { Link } from 'react-router-dom'
import { ShoppingBasket, Truck, ShieldCheck, Sparkles, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  Shop: [
    { label: 'Fruits', to: '/shop?category=fruits' },
    { label: 'Vegetables', to: '/shop?category=vegetables' },
    { label: 'Dairy & Eggs', to: '/shop?category=dairy-eggs' },
    { label: 'Bakery', to: '/shop?category=bakery' },
    { label: 'Deals', to: '/shop?sort=price_asc' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Track Orders', to: '/orders' },
    { label: 'Wishlist', to: '/wishlist' },
    { label: 'AI Assistant', to: '/ai' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight-200">
      <div className="container-fm grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-500 text-leaf-950">
              <ShoppingBasket className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold text-white">
              Fresh<span className="text-gradient">Mart</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-gray-400">
            Freshness delivered. Happiness included. Premium 3D organic grocery marketplace.
          </p>
          <div className="mt-5 flex gap-3">
            <Feature icon={<Truck className="h-4 w-4" />} label="30 min delivery" />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} label="Quality checked" />
          </div>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-300">{heading}</h3>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-gray-400 transition-colors hover:text-leaf-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-300">Reach us</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-leaf-500" /> MG Road, Bengaluru 560001
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-leaf-500" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-leaf-500" /> hello@freshmart.in
            </li>
          </ul>
          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <input
              type="email"
              placeholder="Email for deals"
              aria-label="Email for newsletter"
              className="input flex-1 py-2.5 text-xs"
            />
            <button className="btn-primary px-4 py-2.5" aria-label="Subscribe">
              <Sparkles className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/5 py-5">
        <div className="container-fm flex flex-col items-center justify-between gap-3 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FreshMart — 3D Organic Marketplace. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/about" className="hover:text-gray-300">Privacy</Link>
            <Link to="/about" className="hover:text-gray-300">Terms</Link>
            <Link to="/contact" className="hover:text-gray-300">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-leaf-500/20 bg-leaf-500/5 px-3 py-1 text-xs text-leaf-100">
      {icon} {label}
    </span>
  )
}
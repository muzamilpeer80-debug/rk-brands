import { useEffect, useState, type FormEvent } from 'react';
import { Link, navigate } from '@/lib/router';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import {
Menu,
X,
Search,
ShoppingBag,
Heart,
User,
} from 'lucide-react';

export function Header() {
const { cartCount, wishlist } = useCart();
const { session } = useAuth();

const [scrolled, setScrolled] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);
const [searchValue, setSearchValue] = useState('');

useEffect(() => {
const onScroll = () => {
setScrolled(window.scrollY > 20);
};


window.addEventListener('scroll', onScroll);

return () => {
  window.removeEventListener('scroll', onScroll);
};


}, []);

useEffect(() => {
document.body.style.overflow = mobileOpen ? 'hidden' : '';


return () => {
  document.body.style.overflow = '';
};


}, [mobileOpen]);

const navLinks = [
{
label: 'New Arrivals',
to: '/shop?sort=newest',
},
{
label: "Men's Collection",
to: '/men',
},
{
label: "Women's Collection",
to: '/women',
},
{
label: 'Shoes',
to: '/shoes',
},
{
label: 'Clothing',
to: '/clothing',
},
];

const handleSearch = (e: FormEvent<HTMLFormElement>) => {
e.preventDefault();


const search = searchValue.trim();

if (!search) {
  return;
}

navigate(`/shop?search=${encodeURIComponent(search)}`);

setSearchOpen(false);
setSearchValue('');


};

const closeMobileMenu = () => {
setMobileOpen(false);
};

return (
<>
<header
className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-ivory-50/95 backdrop-blur-md border-b border-ink-100'
            : 'bg-transparent border-b border-transparent'
        }`}
> <div className="container-lux"> <div className="flex items-center justify-between h-16 lg:h-20">


        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 -ml-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Left navigation */}
        <nav className="hidden lg:flex items-center gap-8 flex-1">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900 link-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2"
        >
          <span className="font-display text-2xl lg:text-3xl tracking-[0.25em] font-medium">
            VÉRONA
          </span>
        </Link>

        {/* Right navigation */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-end">
          {navLinks.slice(3).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900 link-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4 lg:gap-5 lg:ml-6">

          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="p-1.5 hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-1.5 hover:opacity-70 transition-opacity"
            aria-label="Wishlist"
          >
            <Heart className="w-[18px] h-[18px]" />

            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ink-900 text-ivory-50 text-[9px] font-medium flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            to={session ? '/account' : '/auth'}
            className="p-1.5 hover:opacity-70 transition-opacity hidden sm:block"
            aria-label="Account"
          >
            <User className="w-[18px] h-[18px]" />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-1.5 hover:opacity-70 transition-opacity"
            aria-label="Cart"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />

            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ink-900 text-ivory-50 text-[9px] font-medium flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>

    {/* Search bar */}
    {searchOpen && (
      <div className="absolute top-full left-0 right-0 bg-ivory-50 border-b border-ink-100 animate-fade-down">
        <div className="container-lux py-6">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-4"
          >
            <Search className="w-5 h-5 text-ink-400" />

            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for products, collections..."
              className="flex-1 bg-transparent text-lg font-display placeholder-ink-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    )}
  </header>

  {/* Mobile menu */}
  {mobileOpen && (
    <div className="fixed inset-0 z-[60] lg:hidden">

      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
        onClick={closeMobileMenu}
      />

      {/* Menu panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-ivory-50 animate-slide-in overflow-y-auto">

        {/* Menu header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <span className="font-display text-xl tracking-[0.2em]">
            VÉRONA
          </span>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="p-2"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu links */}
        <nav className="flex flex-col p-6 gap-1">

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMobileMenu}
              className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900 border-b border-ink-100/50"
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/about"
            onClick={closeMobileMenu}
            className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900 border-b border-ink-100/50"
          >
            About
          </Link>

          <Link
           to="/contact"
            onClick={closeMobileMenu}
            className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900 border-b border-ink-100/50"
          >
            Contact
          </Link>

          <Link
            to="/faq"
             onClick={closeMobileMenu}
             className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900 border-b border-ink-100/50"
          >
            FAQ
          </Link>

          <Link
            to={session ? '/account' : '/auth'}
            onClick={closeMobileMenu}
            className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900"
          >
            {session ? 'Account' : 'Sign In'}
          </Link>

          <Link
            to="/admin"
            onClick={closeMobileMenu}
            className="py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink-700 hover:text-ink-900"
          >
            Admin
          </Link>
        </nav>
      </div>
    </div>
  )}
</>


);
}

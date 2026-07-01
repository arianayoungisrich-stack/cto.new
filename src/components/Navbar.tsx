import { Link } from "@tanstack/react-router";

export function Navbar({ businessName }: { businessName: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{businessName}</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors py-4">
                Industries
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute top-full left-0 w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/industries/plumbers" className="block px-4 py-2 hover:bg-slate-50 hover:text-indigo-600">Plumbers</Link>
                <Link to="/industries/hvac" className="block px-4 py-2 hover:bg-slate-50 hover:text-indigo-600">HVAC</Link>
                <Link to="/industries/dentists" className="block px-4 py-2 hover:bg-slate-50 hover:text-indigo-600">Dentists</Link>
                <Link to="/industries/law-firms" className="block px-4 py-2 hover:bg-slate-50 hover:text-indigo-600">Law Firms</Link>
              </div>
            </div>
            <Link to="/#services" className="hover:text-indigo-600 transition-colors">Services</Link>
            <Link to="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
            <Link to="/#pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link to="/#contact" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-all">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

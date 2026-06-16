import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sparkles, Compass, Ghost, Gift, ShoppingBag, Heart } from 'lucide-react';
import Seo from '../components/Seo';

const NotFound = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 group">
      <Seo
        title="Page Not Found | RongRani"
        description="The gift you're looking for seems to have vanished into thin air! Let's get you back to the magic."
        noIndex
      />

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-maroon/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] invert"></div>
      </div>

      {/* Floating Icons Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Gift className="absolute top-20 left-[15%] w-12 h-12 text-maroon animate-float hidden md:block" />
        <Heart className="absolute top-40 right-[20%] w-10 h-10 text-pink-400 animate-float-delayed hidden md:block" />
        <ShoppingBag className="absolute bottom-40 left-[25%] w-14 h-14 text-white animate-float-slow hidden md:block" />
        <Sparkles className="absolute bottom-20 right-[15%] w-8 h-8 text-gold animate-float hidden md:block" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">
        {/* Creative 404 Asset */}
        <div className="relative mb-12">
          <div className="text-[180px] md:text-[250px] font-black text-white/5 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-maroon rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_50px_rgba(190,18,60,0.5)] group-hover:rotate-0 transition-transform duration-500">
                <Ghost className="w-16 h-16 md:w-24 md:h-24 text-white animate-bounce-short" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 md:w-16 md:h-16 bg-gold rounded-2xl -rotate-12 flex items-center justify-center shadow-lg group-hover:rotate-0 transition-transform duration-500 delay-75">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Lost in the <span className="text-maroon">Magic?</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            The page you're searching for has vanished like a surprise gift at midnight.
            Don't worry, we've got plenty of other wonders waiting for you! ✨
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full max-w-sm sm:max-w-none">
          <Link
            to="/"
            className="w-full sm:w-auto bg-maroon text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(190,18,60,0.4)] group overflow-hidden relative"
          >
            <Home className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>Return Home</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto bg-white/5 border-2 border-white/10 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick Links Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            { to: '/shop', label: 'Shop Gifts', icon: ShoppingBag, color: 'hover:border-maroon/50' },
            { to: '/category/Surprise-Combo', label: 'Surprises', icon: Sparkles, color: 'hover:border-gold/50' },
            { to: '/wishlist', label: 'My Favorites', icon: Heart, color: 'hover:border-pink-500/50' },
            { to: '/orders', label: 'Track Order', icon: Compass, color: 'hover:border-blue-400/50' }
          ].map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className={`bg-white/5 border border-white/5 p-6 rounded-3xl transition-all ${link.color} hover:bg-white/10 group`}
            >
              <link.icon className="w-8 h-8 text-white/40 group-hover:text-white group-hover:scale-110 transition-all mx-auto mb-3" />
              <h4 className="text-white text-sm font-bold truncate">{link.label}</h4>
            </Link>
          ))}
        </div>

        {/* Brand Footer */}
        <div className="mt-20 opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full p-1 overflow-hidden">
              <img src="/RongRani-Logo.png" alt="RongRani" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold tracking-widest text-xs uppercase">RongRani Handmade</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
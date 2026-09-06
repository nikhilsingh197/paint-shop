import React, { useState } from "react";
import { X, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex relative z-10 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors cursor-pointer backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Image & Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 relative bg-slate-900 items-end p-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop"
            alt="Colorful Paint Splash"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <div className="relative z-10 text-white">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg mb-6">
              NP
            </div>
            <h2 className="text-3xl font-bold mb-3 leading-tight">
              Join the <span className="text-amber-400">Nikhil Rang Club</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Sign in to save your favorite shades, track your orders, and earn
              exclusive rewards on every purchase.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1.5 rounded-full border border-emerald-400/20">
              <Sparkles className="w-4 h-4" />
              <span>Premium Authorized Dealer</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 relative flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                {isLogin ? "Welcome back" : "Create an account"}
              </h3>
              <p className="text-slate-500 text-sm">
                {isLogin
                  ? "Enter your details to access your account."
                  : "Join us to get the best paint deals in Jamshedpur."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium text-center border border-rose-100">
                {error}
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm text-slate-900 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm text-slate-900 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white py-3 rounded-xl font-bold hover:from-slate-800 hover:to-slate-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg cursor-pointer mt-2"
              >
                {loading
                  ? "Processing..."
                  : isLogin
                    ? "Sign In to Account"
                    : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
              {isLogin ? "New to Nikhil Paints? " : "Already a member? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-amber-600 font-bold hover:text-amber-700 hover:underline cursor-pointer"
              >
                {isLogin ? "Sign up for free" : "Sign in here"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

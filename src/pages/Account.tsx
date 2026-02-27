import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, Settings, LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Account() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isLogin ? "Logged in successfully!" : "Account created! Please check your email.");
  };

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-background" />
        </div>
        <h1 className="font-display text-3xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className="text-muted-foreground mt-1">{isLogin ? "Sign in to your account" : "Join the ShoeShop family"}</p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className={`${inputClass} pl-10`} placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className={`${inputClass} pl-10`} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className={`${inputClass} pl-10 pr-10`} placeholder="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {isLogin && (
          <div className="text-right"><button type="button" className="text-sm text-primary hover:underline">Forgot password?</button></div>
        )}
        <button type="submit" className="gold-gradient text-background font-semibold w-full py-3.5 rounded-xl hover:opacity-90 transition-opacity">
          {isLogin ? "Sign In" : "Create Account"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">{isLogin ? "Sign Up" : "Sign In"}</button>
        </p>
      </motion.form>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: Package, label: "Orders", to: "/orders" },
          { icon: Heart, label: "Wishlist", to: "/wishlist" },
          { icon: Settings, label: "Settings", to: "/account" },
        ].map((item) => (
          <Link key={item.label} to={item.to} className="glass rounded-xl p-4 text-center glass-hover">
            <item.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

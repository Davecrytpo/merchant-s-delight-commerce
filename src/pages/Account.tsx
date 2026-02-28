import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, Settings, Mail, Lock, Eye, EyeOff, LogOut, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Account() {
  const { user, profile, loading, signIn, signUp, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    state: "",
    zip_code: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load profile data into form
  if (profile && !profileLoaded) {
    setProfileForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address_line1: profile.address_line1 || "",
      city: profile.city || "",
      state: profile.state || "",
      zip_code: profile.zip_code || "",
    });
    setProfileLoaded(true);
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
      }
    } else {
      if (!form.name.trim()) { toast.error("Please enter your name"); setSubmitting(false); return; }
      if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); setSubmitting(false); return; }
      const { error } = await signUp(form.email, form.password, form.name);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify.");
      }
    }
    setSubmitting(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await updateProfile(profileForm);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Logged in - show dashboard
  if (user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">My <span className="gold-text">Account</span></h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-destructive/20 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Package, label: "Orders", to: "/orders" },
            { icon: Heart, label: "Wishlist", to: "/wishlist" },
            { icon: Settings, label: "Track Order", to: "/track-order" },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="glass rounded-xl p-4 text-center glass-hover">
              <item.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Profile Edit Form */}
        <motion.form
          onSubmit={handleProfileUpdate}
          className="glass rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-xl font-bold mb-2">Profile Details</h2>
          <input className={inputClass} placeholder="Full Name" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
          <input className={inputClass} placeholder="Phone Number" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
          <input className={inputClass} placeholder="Address" value={profileForm.address_line1} onChange={(e) => setProfileForm({ ...profileForm, address_line1: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <input className={inputClass} placeholder="City" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} />
            <input className={inputClass} placeholder="State" value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} />
            <input className={inputClass} placeholder="ZIP" value={profileForm.zip_code} onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="gold-gradient text-background font-semibold w-full py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" /> {submitting ? "Saving..." : "Save Changes"}
          </button>
        </motion.form>
      </div>
    );
  }

  // Not logged in - show auth form
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
        onSubmit={handleAuth}
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
        <button type="submit" disabled={submitting} className="gold-gradient text-background font-semibold w-full py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
          {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setForm({ email: "", password: "", name: "" }); }} className="text-primary hover:underline font-medium">{isLogin ? "Sign Up" : "Sign In"}</button>
        </p>
      </motion.form>
    </div>
  );
}

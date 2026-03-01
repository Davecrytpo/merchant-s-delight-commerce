import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, Settings, Mail, Lock, Eye, EyeOff, LogOut, Save, ShoppingBag, MapPin, Clock, ChevronRight, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";

export default function Account() {
  const { user, profile, loading, signIn, signUp, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: orders } = useOrders(user?.id);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "profile" | "addresses">("overview");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [profileForm, setProfileForm] = useState({
    full_name: "", phone: "", address_line1: "", city: "", state: "", zip_code: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  if (profile && !profileLoaded) {
    setProfileForm({
      full_name: profile.full_name || "", phone: profile.phone || "",
      address_line1: profile.address_line1 || "", city: profile.city || "",
      state: profile.state || "", zip_code: profile.zip_code || "",
    });
    setProfileLoaded(true);
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      if (error) toast.error(error.message);
      else toast.success("Welcome back!");
    } else {
      if (!form.name.trim()) { toast.error("Please enter your name"); setSubmitting(false); return; }
      if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); setSubmitting(false); return; }
      const { error } = await signUp(form.email, form.password, form.name);
      if (error) toast.error(error.message);
      else toast.success("Account created! Please check your email to verify.");
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

  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); navigate("/"); };

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary";

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Dashboard stats
  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((acc: number, o: any) => acc + Number(o.total), 0) || 0;
  const pendingOrders = orders?.filter((o: any) => o.status === "pending" || o.status === "processing").length || 0;
  const recentOrders = orders?.slice(0, 3) || [];

  if (user) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shrink-0">
              <span className="text-background font-bold text-xl font-display">{(profile?.full_name || user.email)?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Welcome, <span className="gold-text">{profile?.full_name || "Shopper"}</span></h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-destructive/20 text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {[
            { icon: ShoppingBag, label: "Total Orders", value: totalOrders, color: "text-primary" },
            { icon: TrendingUp, label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, color: "text-green-400" },
            { icon: Clock, label: "Active Orders", value: pendingOrders, color: "text-blue-400" },
            { icon: Heart, label: "Wishlist", value: "View", color: "text-pink-400", link: "/wishlist" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4 md:p-5"
            >
              {s.link ? (
                <Link to={s.link} className="block">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-xl md:text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </Link>
              ) : (
                <>
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-xl md:text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "overview" as const, label: "Overview", icon: Package },
            { key: "profile" as const, label: "Profile", icon: User },
            { key: "addresses" as const, label: "Address", icon: MapPin },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === tab.key ? "gold-gradient text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeSection === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Package, label: "My Orders", to: "/orders" },
                { icon: Heart, label: "Wishlist", to: "/wishlist" },
                { icon: Settings, label: "Track Order", to: "/track-order" },
                { icon: Mail, label: "Contact Us", to: "/contact" },
              ].map((item) => (
                <Link key={item.label} to={item.to} className="glass rounded-xl p-4 text-center glass-hover group">
                  <item.icon className="w-5 h-5 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold">Recent Orders</h2>
                <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></Link>
              </div>
              {!recentOrders.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">No orders yet. <Link to="/shop" className="text-primary hover:underline">Start shopping!</Link></p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">#{o.order_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${Number(o.total).toFixed(2)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                          o.status === "delivered" ? "bg-green-500/10 text-green-400" :
                          o.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                          "bg-primary/10 text-primary"
                        }`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === "profile" && (
          <motion.form onSubmit={handleProfileUpdate} className="glass rounded-2xl p-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-xl font-bold mb-2">Profile Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputClass} placeholder="Full Name" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
              <input className={inputClass} placeholder="Phone Number" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            </div>
            <button type="submit" disabled={submitting} className="gold-gradient text-background font-semibold w-full py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {submitting ? "Saving..." : "Save Changes"}
            </button>
          </motion.form>
        )}

        {activeSection === "addresses" && (
          <motion.form onSubmit={handleProfileUpdate} className="glass rounded-2xl p-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-xl font-bold mb-2">Shipping Address</h2>
            <input className={inputClass} placeholder="Street Address" value={profileForm.address_line1} onChange={(e) => setProfileForm({ ...profileForm, address_line1: e.target.value })} />
            <div className="grid grid-cols-3 gap-4">
              <input className={inputClass} placeholder="City" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} />
              <input className={inputClass} placeholder="State" value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} />
              <input className={inputClass} placeholder="ZIP" value={profileForm.zip_code} onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })} />
            </div>
            <button type="submit" disabled={submitting} className="gold-gradient text-background font-semibold w-full py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {submitting ? "Saving..." : "Save Address"}
            </button>
          </motion.form>
        )}
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

      <motion.form onSubmit={handleAuth} className="glass rounded-2xl p-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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

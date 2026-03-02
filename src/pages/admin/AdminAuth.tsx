import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        toast.error(error.message || "Invalid credentials");
      } else {
        toast.success("Welcome back, admin!");
        navigate("/admin");
      }
    } else {
      if (!form.fullName.trim()) {
        toast.error("Please enter your full name");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(form.email, form.password, form.fullName);
      if (error) {
        toast.error(error.message || "Signup failed");
      } else {
        toast.success("Account created! Please check your email to verify, then the store owner will assign your admin role.");
      }
    }
    setSubmitting(false);
  };

  const inputClass =
    "w-full bg-secondary rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-background" />
          </div>
          <h1 className="font-display text-3xl font-bold">
            Admin <span className="gold-text">Portal</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isLogin ? "Sign in to manage your store" : "Create your admin account"}
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                <input
                  className={inputClass}
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <input
                className={inputClass}
                type="email"
                placeholder="admin@shoeshop.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <input
                  className={inputClass}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Need an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Admin access requires role assignment by the store owner.
        </p>
      </motion.div>
    </div>
  );
}

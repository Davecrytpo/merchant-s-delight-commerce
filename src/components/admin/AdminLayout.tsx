import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ArrowLeft, Truck, Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/shipping", icon: Truck, label: "Shipping" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications, unreadCount, markAsRead, markAllRead } = useAdminNotifications();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shrink-0">
          <span className="text-background font-bold text-sm font-display">S</span>
        </div>
        <div className="font-display text-lg font-bold">Admin<span className="gold-text">Panel</span></div>
      </div>
      <nav className="space-y-1 flex-1">
        {links.map((l) => (
          <NavLink 
            key={l.to} 
            to={l.to} 
            end={l.end} 
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? "gold-gradient text-background shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
            }
          >
            <l.icon className="w-4 h-4" /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="pt-6 mt-6 border-t border-border/50 text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center">
        v2.4.0 High-Performance
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border glass sticky top-0 z-[50]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <span className="text-background font-bold text-xs font-display">S</span>
          </div>
          <span className="font-display font-bold">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-secondary rounded-lg relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">{unreadCount}</span>
            )}
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-secondary rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border p-6 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] md:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25 }} className="fixed inset-y-0 left-0 w-72 glass border-r border-border p-6 z-[101] md:hidden">
              <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto relative">
        {/* Desktop Notification Bell */}
        <div className="hidden md:flex justify-end mb-4">
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-secondary rounded-lg relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 top-14 md:top-16 w-80 glass rounded-2xl border border-border z-[60] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={() => markAllRead.mutate()} className="text-xs text-primary hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {!notifications?.length ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No notifications yet</p>
                ) : (
                  notifications.map((n: any) => (
                    <Link
                      key={n.id}
                      to={n.link || "#"}
                      onClick={() => { if (!n.is_read) markAsRead.mutate(n.id); setNotifOpen(false); }}
                      className={`block p-3 border-b border-border/50 hover:bg-secondary/50 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

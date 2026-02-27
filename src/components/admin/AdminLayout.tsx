import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border p-4 flex flex-col shrink-0">
        <Link to="/" className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <div className="font-display text-xl font-bold mb-6">Shoe<span className="gold-text">Shop</span> Admin</div>
        <nav className="space-y-1 flex-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? "gold-gradient text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
            }>
              <l.icon className="w-4 h-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
    </div>
  );
}

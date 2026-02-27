import { useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [storeName, setStoreName] = useState("ShoeShop");
  const [currency, setCurrency] = useState("USD");
  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">General</h2>
        <div><label className="text-sm text-muted-foreground mb-1 block">Store Name</label><input className={inputClass} value={storeName} onChange={(e) => setStoreName(e.target.value)} /></div>
        <div><label className="text-sm text-muted-foreground mb-1 block">Currency</label>
          <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
          </select>
        </div>
        <button onClick={() => toast.success("Settings saved!")} className="gold-gradient text-background font-semibold px-6 py-3 rounded-xl hover:opacity-90">Save Changes</button>
      </div>
    </div>
  );
}

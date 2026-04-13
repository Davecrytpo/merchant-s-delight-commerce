import { useState } from "react";
import { Truck, Plus, Edit, Trash2, Loader2, Save, X } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AdminShipping() {
  const queryClient = useQueryClient();
  const { data: methods, isLoading: methodsLoading } = useQuery({
    queryKey: ["admin-shipping-methods"],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("shipping_methods")
        .select("*")
        .order("price", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    carrier: "",
    price: 0,
    min_order_amount: 0,
    estimated_days: "",
    description: "",
    is_active: true,
    country_code: "US",
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: "",
      carrier: "",
      price: 0,
      min_order_amount: 0,
      estimated_days: "",
      description: "",
      is_active: true,
      country_code: "US",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await (apiClient.from as any)("shipping_methods").update(formData).eq("id", editingId);
        if (error) throw error;
        toast.success("Shipping method updated");
      } else {
        const { error } = await (apiClient.from as any)("shipping_methods").insert(formData);
        if (error) throw error;
        toast.success("Shipping method created");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      queryClient.invalidateQueries({ queryKey: ["shipping-methods"] });
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shipping method?")) return;
    const { error } = await (apiClient.from as any)("shipping_methods").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      queryClient.invalidateQueries({ queryKey: ["shipping-methods"] });
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setFormData({
      name: m.name, carrier: m.carrier, price: Number(m.price), 
      min_order_amount: Number(m.min_order_amount), 
      estimated_days: m.estimated_days,
      description: m.description,
      is_active: m.is_active !== false,
      country_code: m.country_code || "US",
    });
  };

  const inputClass = "bg-secondary rounded-xl px-4 py-2.5 outline-none w-full text-sm focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="font-display text-xl md:text-2xl font-bold">Shipping Carriers</h1>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="gold-gradient text-background font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Method
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="glass p-4 md:p-6 rounded-xl md:rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Method Name</label>
            <input required placeholder="e.g. Standard Ground" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Carrier</label>
            <input required placeholder="e.g. FedEx" className={inputClass} value={formData.carrier} onChange={e => setFormData({...formData, carrier: e.target.value})} /></div>
            <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Price ($)</label>
            <input required type="number" step="0.01" className={inputClass} value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
            <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Free Over ($)</label>
            <input type="number" step="0.01" className={inputClass} value={formData.min_order_amount} onChange={e => setFormData({...formData, min_order_amount: Number(e.target.value)})} /></div>
            <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Est. Days</label>
            <input required placeholder="e.g. 3-5 business days" className={inputClass} value={formData.estimated_days} onChange={e => setFormData({...formData, estimated_days: e.target.value})} /></div>
            <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Country Scope</label>
            <select className={inputClass} value={formData.country_code} onChange={e => setFormData({...formData, country_code: e.target.value})}>
              <option value="US">United States</option>
              <option value="ALL">International</option>
            </select></div>
          </div>
          <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Description</label>
          <textarea placeholder="Brief description..." className={`${inputClass} h-20`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <label className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3 text-sm">
            <span>Method is active</span>
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" /> {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {methodsLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : 
          methods?.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">No shipping methods. Click "Add Method" to create one.</div>
          ) : methods?.map((m: any) => (
            <div key={m.id} className="glass rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="font-bold text-sm">{m.carrier}</p>
                    <p className="text-[10px] text-muted-foreground">{m.name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(m)} className="p-1.5 hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
                <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{m.estimated_days}</span>
                <div className="text-right">
                  <span className="font-bold">${Number(m.price).toFixed(2)}</span>
                  {m.min_order_amount > 0 && <p className="text-[10px] text-green-400">Free over ${Number(m.min_order_amount).toFixed(0)}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{m.country_code === "ALL" ? "International" : "United States"}</span>
                <span className={m.is_active !== false ? "text-green-500" : "text-yellow-500"}>{m.is_active !== false ? "Active" : "Inactive"}</span>
              </div>
            </div>
          ))
        }
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden overflow-x-auto">
        {methodsLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : (
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 px-4 text-left">Carrier / Method</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Est. Time</th>
                <th className="py-3 px-4 text-left">Scope</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods?.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No shipping methods found.</td></tr>
              ) : (
                methods?.map((m: any) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Truck className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="font-medium">{m.carrier}</p>
                        <p className="text-[10px] text-muted-foreground">{m.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-xs">
                    ${Number(m.price).toFixed(2)}
                    {m.min_order_amount > 0 && <p className="text-[10px] text-green-400 font-normal">Free over ${Number(m.min_order_amount).toFixed(0)}</p>}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{m.estimated_days}</td>
                  <td className="py-3 px-4 text-xs">
                    <div className="flex flex-col">
                      <span>{m.country_code === "ALL" ? "International" : "United States"}</span>
                      <span className={m.is_active !== false ? "text-green-500" : "text-yellow-500"}>{m.is_active !== false ? "Active" : "Inactive"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => startEdit(m)} className="p-1.5 hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


import { useState } from "react";
import { Truck, Plus, Edit, Trash2, Loader2, Save, X, Globe } from "lucide-react";
import { useShippingMethods } from "@/hooks/useShipping";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminShipping() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: methods, isLoading: methodsLoading } = useShippingMethods();
  const queryClient = useQueryClient();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", carrier: "", price: 0, min_order_amount: 0, estimated_days: "", description: ""
  });

  if (adminLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (isAdmin === false) return <Navigate to="/" />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await (supabase.from as any)("shipping_methods").update(formData).eq("id", editingId);
        if (error) throw error;
        toast.success("Shipping method updated");
      } else {
        const { error } = await (supabase.from as any)("shipping_methods").insert(formData);
        if (error) throw error;
        toast.success("Shipping method created");
      }
      queryClient.invalidateQueries({ queryKey: ["shipping-methods"] });
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: "", carrier: "", price: 0, min_order_amount: 0, estimated_days: "", description: "" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shipping method?")) return;
    const { error } = await (supabase.from as any)("shipping_methods").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["shipping-methods"] });
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setFormData({
      name: m.name, carrier: m.carrier, price: Number(m.price), 
      min_order_amount: Number(m.min_order_amount), 
      estimated_days: m.estimated_days, description: m.description
    });
  };

  const inputClass = "bg-secondary rounded-xl px-4 py-2 outline-none w-full text-sm";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold">Shipping Carriers</h1>
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
        <form onSubmit={handleSave} className="glass p-6 rounded-2xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
          </div>
          <div><label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Description</label>
          <textarea placeholder="Brief description..." className={`${inputClass} h-20`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {editingId ? "Update" : "Save"} Method
            </button>
            <button type="button" onClick={() => {setIsAdding(false); setEditingId(null);}} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        {methodsLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : (
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 px-4 text-left">Carrier / Method</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Est. Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No shipping methods found. click "Add Method" to create one.
                  </td>
                </tr>
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

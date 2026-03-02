import { useState } from "react";
import { Search, Plus, Edit, Trash2, Loader2, Save, X } from "lucide-react";
import { useProducts, useAdminProductMutations, useCategories } from "@/hooks/useProducts";
import { toast } from "sonner";

export default function AdminProducts() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useAdminProductMutations();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "", slug: "", price: 0, category_id: "", brand: "ShoeShop", description: ""
  });

  const filtered = products?.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProduct.mutateAsync({ id: editingId, ...formData });
      setEditingId(null);
    } else {
      await createProduct.mutateAsync(formData);
      setIsAdding(false);
    }
    setFormData({ name: "", slug: "", price: 0, category_id: "", brand: "ShoeShop", description: "" });
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, slug: p.slug, price: p.price, category_id: p.category_id, brand: p.brand, description: p.description
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="gold-gradient text-background font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="glass p-6 rounded-2xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Name" className="bg-secondary rounded-xl px-4 py-2 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required placeholder="Slug" className="bg-secondary rounded-xl px-4 py-2 outline-none" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            <input required type="number" placeholder="Price" className="bg-secondary rounded-xl px-4 py-2 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            <select required className="bg-secondary rounded-xl px-4 py-2 outline-none" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
              <option value="">Select Category</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <textarea placeholder="Description" className="w-full bg-secondary rounded-xl px-4 py-2 outline-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-xl flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {editingId ? "Update" : "Save"} Product
            </button>
            <button type="button" onClick={() => {setIsAdding(false); setEditingId(null);}} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" 
          placeholder="Search products..." 
        />
      </div>

      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        {productsLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : (
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold">SHOE</div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold">${p.price}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => startEdit(p)} className="p-1.5 hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteProduct.mutate(p.id)} className="p-1.5 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

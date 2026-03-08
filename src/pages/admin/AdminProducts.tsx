import { useState } from "react";
import { Search, Plus, Edit, Trash2, Loader2, Save, X, Image as ImageIcon, Layers, Package, Trash, RefreshCcw } from "lucide-react";
import { useProducts, useAdminProductMutations, useCategories } from "@/hooks/useProducts";
import { toast } from "sonner";
import { seedProducts } from "@/lib/seedProducts";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useAdminProductMutations();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const handleSeed = async () => {
    if (!window.confirm("This will restore default products and categories. Continue?")) return;
    setIsSeeding(true);
    try {
      await seedProducts(true);
      toast.success("Database synced successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast.error("Failed to sync: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };
  
  const [formData, setFormData] = useState({
    name: "", slug: "", price: 0, original_price: 0, category_id: "", brand: "ShoeShop", 
    description: "", long_description: "", is_featured: false, is_new: false, is_trending: false
  });
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const filtered = products?.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { product: formData, images: images.filter(url => url.trim() !== ""), variants: variants.filter(v => v.size && v.color) };
    try {
      if (editingId) { await updateProduct.mutateAsync({ id: editingId, ...payload }); setEditingId(null); }
      else { await createProduct.mutateAsync(payload); setIsAdding(false); }
      resetForm();
    } catch (error) { console.error(error); }
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", price: 0, original_price: 0, category_id: "", brand: "ShoeShop", description: "", long_description: "", is_featured: false, is_new: false, is_trending: false });
    setImages([]); setVariants([]); setEditingId(null); setIsAdding(false);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ name: p.name, slug: p.slug, price: p.price, original_price: p.original_price || 0, category_id: p.category_id || "", brand: p.brand, description: p.description || "", long_description: p.long_description || "", is_featured: p.is_featured || false, is_new: p.is_new || false, is_trending: p.is_trending || false });
    setImages(p.product_images?.map((img: any) => img.image_url) || []);
    setVariants(p.product_variants || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addImageField = () => setImages([...images, ""]);
  const updateImage = (index: number, url: string) => { const n = [...images]; n[index] = url; setImages(n); };
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));
  const addVariant = () => setVariants([...variants, { size: "", color: "", color_hex: "#000000", stock: 0, price: null }]);
  const updateVariant = (index: number, field: string, value: any) => { const n = [...variants]; n[index] = { ...n[index], [field]: value }; setVariants(n); };
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const inputCls = "w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold">Product Management</h1>
          <p className="text-xs text-muted-foreground">Add and manage your store inventory</p>
        </div>
        {!isAdding && !editingId && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleSeed} disabled={isSeeding} className="flex-1 sm:flex-initial bg-secondary text-foreground font-semibold px-3 md:px-5 py-2 rounded-xl flex items-center justify-center gap-2 border border-border hover:bg-secondary/80 transition-all disabled:opacity-50 text-xs md:text-sm">
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              <span className="hidden xs:inline">Sync</span>
            </button>
            <button onClick={() => setIsAdding(true)} className="flex-1 sm:flex-initial gold-gradient text-background font-semibold px-3 md:px-5 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-xs md:text-sm">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="glass p-4 md:p-6 rounded-xl md:rounded-2xl space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm md:text-base">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Product Name</label>
                  <input required placeholder="e.g. Air Max 2024" className={inputCls} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Slug (URL)</label>
                  <input required placeholder="e.g. air-max-2024" className={inputCls} value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Price ($)</label>
                  <input required type="number" step="0.01" className={inputCls} value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Original Price</label>
                  <input type="number" step="0.01" className={inputCls} value={formData.original_price} onChange={e => setFormData({...formData, original_price: Number(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Category</label>
                  <select required className={inputCls} value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Brand</label>
                  <input required className={inputCls} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Short Description</label>
                <textarea className={`${inputCls} h-20`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Full Description</label>
                <textarea className={`${inputCls} h-32 md:h-40`} value={formData.long_description} onChange={e => setFormData({...formData, long_description: e.target.value})} /></div>
              </div>

              {/* Variants */}
              <div className="glass p-4 md:p-6 rounded-xl md:rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /><h3 className="font-bold text-sm md:text-base">Variants</h3></div>
                  <button type="button" onClick={addVariant} className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                </div>
                {variants.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-xl"><p className="text-xs text-muted-foreground">No variants yet</p></div>
                ) : (
                  <div className="space-y-3">
                    {variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end bg-secondary/30 p-3 rounded-xl relative">
                        <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground">Size</label>
                        <input placeholder="42" className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none border border-border/50 focus:border-primary" value={v.size} onChange={e => updateVariant(i, "size", e.target.value)} /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground">Color</label>
                        <input placeholder="Red" className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none border border-border/50 focus:border-primary" value={v.color} onChange={e => updateVariant(i, "color", e.target.value)} /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground">HEX</label>
                        <input type="color" className="w-full h-9 bg-background rounded-lg px-1 py-1 outline-none border border-border/50" value={v.color_hex} onChange={e => updateVariant(i, "color_hex", e.target.value)} /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-muted-foreground">Stock</label>
                        <input type="number" className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none border border-border/50 focus:border-primary" value={v.stock} onChange={e => updateVariant(i, "stock", Number(e.target.value))} /></div>
                        <button type="button" onClick={() => removeVariant(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg self-end justify-self-end"><Trash className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 md:space-y-6">
              <div className="glass p-4 md:p-6 rounded-xl md:rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /><h3 className="font-bold text-sm">Images</h3></div>
                  <button type="button" onClick={addImageField} className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                </div>
                <div className="space-y-2">
                  {images.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder="https://..." className="flex-1 bg-secondary/50 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/50" value={url} onChange={e => updateImage(i, e.target.value)} />
                      <button type="button" onClick={() => removeImage(i)} className="p-2 text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {images.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-xl">No images</p>}
                </div>
              </div>

              <div className="glass p-4 md:p-6 rounded-xl md:rounded-2xl space-y-3">
                <h3 className="font-bold text-sm">Display Settings</h3>
                {[
                  { key: "is_featured", label: "Featured" },
                  { key: "is_new", label: "New Arrival" },
                  { key: "is_trending", label: "Trending" },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl cursor-pointer">
                    <span className="text-sm">{opt.label}</span>
                    <input type="checkbox" className="w-4 h-4 accent-primary" checked={(formData as any)[opt.key]} onChange={e => setFormData({...formData, [opt.key]: e.target.checked})} />
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="flex-1 gold-gradient text-background font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                  {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? "Update" : "Create"}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-3 rounded-xl border border-border hover:bg-secondary text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-secondary border border-border/50 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Search products..." />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {productsLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No products found</div>
        ) : (
          filtered.map((p: any) => {
            const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
            return (
              <div key={p.id} className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border/50">
                    {p.product_images?.[0] ? <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.brand} · {p.categories?.name || "Uncategorized"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">${p.price}</span>
                    {p.original_price && <span className="text-xs text-muted-foreground line-through">${p.original_price}</span>}
                  </div>
                  <span className={`text-[10px] font-bold ${totalStock > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => startEdit(p)} className="flex-1 bg-secondary text-foreground py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"><Edit className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => { if (window.confirm("Delete this product?")) deleteProduct.mutate(p.id); }} className="py-2 px-3 rounded-lg text-xs text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        {productsLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-left">
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Product</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Category</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Price</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Stock</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border/50">
                          {p.product_images?.[0] ? <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <div><p className="font-bold text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.brand}</p></div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="px-3 py-1 bg-secondary rounded-lg text-xs font-medium">{p.categories?.name || "Uncategorized"}</span></td>
                    <td className="py-4 px-6"><span className="font-bold">${p.price}</span>{p.original_price && <span className="text-xs text-muted-foreground line-through ml-1">${p.original_price}</span>}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="w-24 h-1.5 rounded-full overflow-hidden bg-secondary">
                          <div className={`h-full rounded-full ${totalStock > 10 ? 'bg-green-500' : totalStock > 0 ? 'bg-yellow-500' : 'bg-destructive'}`} style={{ width: `${Math.min(100, (totalStock / 50) * 100)}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${totalStock > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>{totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(p)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { if (window.confirm("Delete this product?")) deleteProduct.mutate(p.id); }} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No products found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

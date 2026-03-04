import { useState, useEffect } from "react";
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
      await seedProducts(true); // Clear and re-seed
      toast.success("Database synced successfully! All products restored.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast.error("Failed to sync database: " + error.message);
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
    const payload = {
      product: formData,
      images: images.filter(url => url.trim() !== ""),
      variants: variants.filter(v => v.size && v.color)
    };

    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...payload });
        setEditingId(null);
      } else {
        await createProduct.mutateAsync(payload);
        setIsAdding(false);
      }
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: "", slug: "", price: 0, original_price: 0, category_id: "", brand: "ShoeShop", 
      description: "", long_description: "", is_featured: false, is_new: false, is_trending: false
    });
    setImages([]);
    setVariants([]);
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, slug: p.slug, price: p.price, original_price: p.original_price || 0,
      category_id: p.category_id || "", brand: p.brand, description: p.description || "",
      long_description: p.long_description || "", is_featured: p.is_featured || false,
      is_new: p.is_new || false, is_trending: p.is_trending || false
    });
    setImages(p.product_images?.map((img: any) => img.image_url) || []);
    setVariants(p.product_variants || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addImageField = () => setImages([...images, ""]);
  const updateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    setImages(newImages);
  };
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const addVariant = () => setVariants([...variants, { size: "", color: "", color_hex: "#000000", stock: 0, price: null }]);
  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Product Management</h1>
          <p className="text-sm text-muted-foreground">Add and manage your store inventory</p>
        </div>
        {!isAdding && !editingId && (
          <div className="flex gap-3">
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="bg-secondary text-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 border border-border hover:bg-secondary/80 transition-all disabled:opacity-50"
            >
              {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
              Sync Database
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="gold-gradient text-background font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Add New Product
            </button>
          </div>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Basic Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Product Name</label>
                    <input required placeholder="e.g. Air Max 2024" className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Slug (URL)</label>
                    <input required placeholder="e.g. air-max-2024" className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Price ($)</label>
                    <input required type="number" step="0.01" placeholder="99.99" className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Original Price (Optional)</label>
                    <input type="number" step="0.01" placeholder="129.99" className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all" value={formData.original_price} onChange={e => setFormData({...formData, original_price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                    <select required className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Brand</label>
                    <input required placeholder="ShoeShop" className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Short Description</label>
                  <textarea placeholder="Brief overview..." className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Description (Markdown supported)</label>
                  <textarea placeholder="Detailed product specifications..." className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all h-40" value={formData.long_description} onChange={e => setFormData({...formData, long_description: e.target.value})} />
                </div>
              </div>

              {/* Variants Section */}
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Inventory & Variants</h3>
                  </div>
                  <button type="button" onClick={addVariant} className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
                
                {variants.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground italic">No variants added yet. Add sizes and colors here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variants.map((v, i) => (
                      <div key={i} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-secondary/30 p-4 rounded-xl relative group">
                        <div className="flex-1 min-w-[80px] space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Size</label>
                          <input placeholder="42" className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none border border-border/50 focus:border-primary" value={v.size} onChange={e => updateVariant(i, "size", e.target.value)} />
                        </div>
                        <div className="flex-1 min-w-[100px] space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Color</label>
                          <input placeholder="Red" className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none border border-border/50 focus:border-primary" value={v.color} onChange={e => updateVariant(i, "color", e.target.value)} />
                        </div>
                        <div className="w-16 space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">HEX</label>
                          <input type="color" className="w-full h-9 bg-background rounded-lg px-1 py-1 outline-none border border-border/50" value={v.color_hex} onChange={e => updateVariant(i, "color_hex", e.target.value)} />
                        </div>
                        <div className="w-24 space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Stock</label>
                          <input type="number" className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none border border-border/50 focus:border-primary" value={v.stock} onChange={e => updateVariant(i, "stock", Number(e.target.value))} />
                        </div>
                        <button type="button" onClick={() => removeVariant(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors mb-0.5">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Images & Settings */}
            <div className="space-y-6">
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Product Images</h3>
                  </div>
                  <button type="button" onClick={addImageField} className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add URL
                  </button>
                </div>
                
                <div className="space-y-3">
                  {images.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="relative flex-1 group">
                        <input 
                          placeholder="https://images.com/shoe.jpg" 
                          className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50" 
                          value={url} 
                          onChange={e => updateImage(i, e.target.value)} 
                        />
                        {url && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg overflow-hidden border border-border hidden group-focus-within:block group-hover:block">
                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removeImage(i)} className="p-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {images.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-xl">At least one image is recommended.</p>
                  )}
                </div>
              </div>

              <div className="glass p-6 rounded-2xl space-y-4">
                <h3 className="font-bold">Store Display Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                    <span className="text-sm font-medium">Featured Product</span>
                    <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                    <span className="text-sm font-medium">New Arrival</span>
                    <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                    <span className="text-sm font-medium">Trending</span>
                    <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.is_trending} onChange={e => setFormData({...formData, is_trending: e.target.checked})} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="flex-1 gold-gradient text-background font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingId ? "Update" : "Create"} Product
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-glass-dark border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
          placeholder="Search products by name, brand or category..." 
        />
      </div>

      <div className="glass rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        {productsLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-4">Loading your inventory...</p>
          </div>
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
                          {p.product_images?.[0] ? (
                            <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-secondary rounded-lg text-xs font-medium">
                        {p.categories?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">${p.price}</span>
                        {p.original_price && <span className="text-xs text-muted-foreground line-through">${p.original_price}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className={`w-24 h-1.5 rounded-full overflow-hidden bg-secondary`}>
                          <div 
                            className={`h-full rounded-full ${totalStock > 10 ? 'bg-green-500' : totalStock > 0 ? 'bg-yellow-500' : 'bg-destructive'}`} 
                            style={{ width: `${Math.min(100, (totalStock / 50) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${totalStock > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                          {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => startEdit(p)} 
                          className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this product?")) {
                              deleteProduct.mutate(p.id);
                            }
                          }} 
                          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

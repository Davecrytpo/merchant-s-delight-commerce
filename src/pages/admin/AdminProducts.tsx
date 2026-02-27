import { useState } from "react";
import { products } from "@/data/products";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button className="gold-gradient text-background font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Product</button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Search products..." /></div>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground"><th className="py-3 px-4 text-left">Product</th><th className="py-3 px-4 text-left">Category</th><th className="py-3 px-4 text-left">Price</th><th className="py-3 px-4 text-left">Rating</th><th className="py-3 px-4 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-3 px-4"><div className="flex items-center gap-3"><img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" /><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.brand}</p></div></div></td>
                <td className="py-3 px-4 text-muted-foreground">{p.category}</td>
                <td className="py-3 px-4 font-bold">${p.price}</td>
                <td className="py-3 px-4">{p.rating} ⭐</td>
                <td className="py-3 px-4 text-right"><button className="p-1.5 hover:text-primary"><Edit className="w-4 h-4" /></button><button className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

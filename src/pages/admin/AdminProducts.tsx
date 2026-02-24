import AdminLayout from "@/components/admin/AdminLayout";
import { products } from "@/data/products";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Product</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Category</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Variants</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Price</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const totalStock = p.variants.reduce((s, v) => s + v.inventory, 0);
                const minPrice = Math.min(...p.variants.map((v) => v.price));
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer">
                    <td className="px-5 py-3">
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">{p.category}</td>
                    <td className="px-5 py-3">{p.variants.length}</td>
                    <td className="px-5 py-3 font-medium">${minPrice.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={totalStock < 50 ? "text-destructive font-medium" : ""}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          p.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

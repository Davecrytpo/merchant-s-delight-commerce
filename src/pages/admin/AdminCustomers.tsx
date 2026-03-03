import { useState } from "react";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { Loader2, Users, Coins, Save, X, Edit2, Search } from "lucide-react";

export default function AdminCustomers() {
  const { customers, updatePoints } = useAdminCustomers();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState(0);

  const filtered = customers.data?.filter((c: any) => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.user_id?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleUpdate = async (userId: string) => {
    await updatePoints.mutateAsync({ userId, points: editPoints });
    setEditingId(null);
  };

  const startEdit = (c: any) => {
    setEditingId(c.user_id);
    setEditPoints(c.reward_points || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Customer Management</h1>
          <p className="text-sm text-muted-foreground">Manage users and reward points</p>
        </div>
        <div className="bg-secondary px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">{customers.data?.length || 0} Total</span>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-glass-dark border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
          placeholder="Search customers by name or ID..." 
        />
      </div>

      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        {customers.isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : !filtered.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No customers found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-left">
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Joined</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Role</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Reward Points</th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.user_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-foreground">{c.full_name || "Anonymous User"}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{c.user_id}</p>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      c.user_roles?.some((r: any) => r.role === 'admin') ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {c.user_roles?.map((r: any) => r.role).join(", ") || "User"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {editingId === c.user_id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          className="w-20 bg-background border border-border rounded px-2 py-1 outline-none" 
                          value={editPoints} 
                          onChange={(e) => setEditPoints(Number(e.target.value))}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="font-bold">{c.reward_points || 0}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {editingId === c.user_id ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUpdate(c.user_id)} 
                          className="p-1.5 hover:text-primary transition-colors"
                          disabled={updatePoints.isPending}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="p-1.5 hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEdit(c)} 
                        className="p-1.5 hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
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

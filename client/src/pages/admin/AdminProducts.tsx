import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Search, Edit2, Trash2, Package, AlertTriangle,
  ChevronDown, ChevronUp, Eye, EyeOff, Save, X, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const productSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  name: z.string().min(1, "Name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  pathway: z.string().optional(),
  format: z.string().optional(),
  size: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  compareAtPrice: z.string().optional(),
  phase: z.number().min(1).default(1),
  available: z.boolean().default(true),
  image: z.string().optional(),
  badge: z.string().optional(),
  howToUse: z.string().optional(),
  fullInci: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  stockQty: z.coerce.number().min(0).default(0),
  lowStockThreshold: z.coerce.number().min(0).default(10),
  sku: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  mode,
}: {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  mode: "create" | "edit";
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { available: true, phase: 1, stockQty: 0, lowStockThreshold: 10, ...defaultValues },
  });
  const available = watch("available");
  const [section, setSection] = useState<"basic" | "details" | "seo" | "inventory">("basic");

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Details" },
    { id: "seo", label: "SEO" },
    { id: "inventory", label: "Inventory" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-0">
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-5">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setSection(t.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${section === t.id ? "text-[#C9A96E] border-b-2 border-[#C9A96E]" : "text-gray-500 hover:text-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {section === "basic" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Product Name *</Label>
              <Input {...register("name")} placeholder="NEUROVÉCTRIX™ Core" className="bg-[#222] border-white/10 text-white text-sm" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">URL Slug *</Label>
              <Input {...register("slug")} placeholder="neurovectrix-core" className="bg-[#222] border-white/10 text-white text-sm" />
              {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Tagline</Label>
            <Input {...register("tagline")} placeholder="Expression Line Modulator" className="bg-[#222] border-white/10 text-white text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Description</Label>
            <Textarea {...register("description")} rows={4} placeholder="Product description..." className="bg-[#222] border-white/10 text-white text-sm resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Price (AUD) *</Label>
              <Input {...register("price")} placeholder="148.00" className="bg-[#222] border-white/10 text-white text-sm" />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Compare At Price</Label>
              <Input {...register("compareAtPrice")} placeholder="198.00" className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Phase</Label>
              <Input {...register("phase", { valueAsNumber: true })} type="number" min={1} max={3} className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={available} onCheckedChange={v => setValue("available", v)} id="available" />
            <Label htmlFor="available" className="text-sm text-gray-300 cursor-pointer">
              {available ? "Available for purchase" : "Hidden from store"}
            </Label>
          </div>
        </div>
      )}

      {section === "details" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Pathway</Label>
              <Input {...register("pathway")} placeholder="Neuromodulation" className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Format</Label>
              <Input {...register("format")} placeholder="Roll-on" className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Size</Label>
              <Input {...register("size")} placeholder="15ml" className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Badge</Label>
              <Input {...register("badge")} placeholder="Hero Product" className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Image URL</Label>
              <Input {...register("image")} placeholder="https://..." className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">How to Use</Label>
            <Textarea {...register("howToUse")} rows={3} placeholder="Application instructions..." className="bg-[#222] border-white/10 text-white text-sm resize-none" />
          </div>
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Full INCI List</Label>
            <Textarea {...register("fullInci")} rows={3} placeholder="Aqua (Water), Glycerin..." className="bg-[#222] border-white/10 text-white text-sm resize-none" />
          </div>
        </div>
      )}

      {section === "seo" && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Meta Title</Label>
            <Input {...register("metaTitle")} placeholder="NEUROVÉCTRIX™ Core | Reni Cosmetics" className="bg-[#222] border-white/10 text-white text-sm" />
          </div>
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Meta Description</Label>
            <Textarea {...register("metaDescription")} rows={3} placeholder="SEO description (150-160 chars)..." className="bg-[#222] border-white/10 text-white text-sm resize-none" />
          </div>
        </div>
      )}

      {section === "inventory" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">SKU</Label>
              <Input {...register("sku")} placeholder="RC-NVC-001" className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1.5 block">Stock Quantity</Label>
              <Input {...register("stockQty", { valueAsNumber: true })} type="number" min={0} className="bg-[#222] border-white/10 text-white text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-400 mb-1.5 block">Low Stock Alert Threshold</Label>
            <Input {...register("lowStockThreshold", { valueAsNumber: true })} type="number" min={0} className="bg-[#222] border-white/10 text-white text-sm" />
            <p className="text-[11px] text-gray-600 mt-1">Alert when stock falls below this number</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-white/10">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">
          <X size={14} className="mr-1.5" /> Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-[#C9A96E] hover:bg-[#b8955a] text-black font-semibold">
          <Save size={14} className="mr-1.5" />
          {isLoading ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [stockAdjust, setStockAdjust] = useState<{ id: number; name: string; current: number } | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.list.useQuery({ search: search || undefined });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { toast.success("Product created"); setCreateOpen(false); utils.products.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { toast.success("Product updated"); setEditProduct(null); utils.products.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { toast.success("Product deleted"); setDeleteId(null); utils.products.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const adjustStockMutation = trpc.products.adjustStock.useMutation({
    onSuccess: () => { toast.success("Stock updated"); setStockAdjust(null); setAdjustQty(0); utils.products.list.invalidate(); utils.products.lowStock.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleAvailableMutation = trpc.products.update.useMutation({
    onSuccess: () => utils.products.list.invalidate(),
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-sm text-gray-500 mt-1">{products?.length ?? 0} products in your store</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#C9A96E] hover:bg-[#b8955a] text-black font-semibold">
            <Plus size={16} className="mr-2" /> Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9 bg-[#1a1a1a] border-white/10 text-white text-sm"
          />
        </div>

        {/* Products Table */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/8 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {isLoading ? (
            <div className="px-5 py-12 text-center">
              <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Package size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No products yet</p>
              <p className="text-xs text-gray-600 mt-1">Add your first product to get started</p>
              <Button onClick={() => setCreateOpen(true)} className="mt-4 bg-[#C9A96E] hover:bg-[#b8955a] text-black text-xs">
                <Plus size={13} className="mr-1.5" /> Add Product
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {products.map(product => {
                const isLowStock = (product.stockQty ?? 0) <= (product.lowStockThreshold ?? 10);
                const isOutOfStock = (product.stockQty ?? 0) === 0;
                return (
                  <div key={product.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/2 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-gray-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{product.name}</div>
                        <div className="text-[11px] text-gray-500">{product.slug}</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-semibold text-white">${Number(product.price).toFixed(2)}</div>
                      {product.compareAtPrice && (
                        <div className="text-[11px] text-gray-500 line-through">${Number(product.compareAtPrice).toFixed(2)}</div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => setStockAdjust({ id: product.id, name: product.name, current: product.stockQty ?? 0 })}
                        className="flex items-center gap-1.5 group"
                      >
                        <span className={`text-sm font-semibold ${isOutOfStock ? "text-red-400" : isLowStock ? "text-amber-400" : "text-white"}`}>
                          {product.stockQty ?? 0}
                        </span>
                        {isLowStock && <AlertTriangle size={11} className={isOutOfStock ? "text-red-400" : "text-amber-400"} />}
                        <Edit2 size={10} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                      </button>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.available}
                          onCheckedChange={v => toggleAvailableMutation.mutate({ id: product.id, available: v })}
                          className="scale-75"
                        />
                        <span className={`text-xs ${product.available ? "text-green-400" : "text-gray-500"}`}>
                          {product.available ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Product Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            mode="create"
            onSubmit={data => createMutation.mutate(data as any)}
            onCancel={() => setCreateOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={open => !open && setEditProduct(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              mode="edit"
              defaultValues={{ ...editProduct, price: String(editProduct.price), compareAtPrice: editProduct.compareAtPrice ? String(editProduct.compareAtPrice) : undefined }}
              onSubmit={data => updateMutation.mutate({ id: editProduct.id, ...data } as any)}
              onCancel={() => setEditProduct(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stock Adjust Dialog */}
      <Dialog open={!!stockAdjust} onOpenChange={open => !open && setStockAdjust(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Adjust Stock</DialogTitle>
          </DialogHeader>
          {stockAdjust && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">{stockAdjust.name}</p>
              <div className="flex items-center gap-3 justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Current</div>
                  <div className="text-2xl font-bold text-white">{stockAdjust.current}</div>
                </div>
                <div className="text-gray-600 text-lg">→</div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">New</div>
                  <div className={`text-2xl font-bold ${Math.max(0, stockAdjust.current + adjustQty) === 0 ? "text-red-400" : "text-green-400"}`}>
                    {Math.max(0, stockAdjust.current + adjustQty)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <button onClick={() => setAdjustQty(q => q - 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <Minus size={14} />
                </button>
                <Input
                  type="number"
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="w-24 text-center bg-[#222] border-white/10 text-white"
                />
                <button onClick={() => setAdjustQty(q => q + 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-[11px] text-gray-600 text-center">Enter a positive number to add stock, negative to remove</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setStockAdjust(null); setAdjustQty(0); }} className="text-gray-400">Cancel</Button>
            <Button
              onClick={() => stockAdjust && adjustStockMutation.mutate({ id: stockAdjust.id, qty: adjustQty })}
              disabled={adjustStockMutation.isPending || adjustQty === 0}
              className="bg-[#C9A96E] hover:bg-[#b8955a] text-black"
            >
              {adjustStockMutation.isPending ? "Saving..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. The product will be permanently removed from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-gray-400 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

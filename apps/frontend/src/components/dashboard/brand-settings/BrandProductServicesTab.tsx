import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Trash2, ExternalLink, Image as ImageIcon, Check, Loader2, Sparkles, Tag, ArrowRight, X, Camera, Upload } from 'lucide-react';

interface BrandProductServicesTabProps {
  initialProducts?: any[];
  onSaveSuccess?: () => void;
}

export default function BrandProductServicesTab({ initialProducts = [], onSaveSuccess }: BrandProductServicesTabProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // New product state
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [category, setCategory] = useState('Apparel & Accessories');
  const [price, setPrice] = useState('$99');
  const [description, setDescription] = useState('');

  // Sync products list whenever initialProducts prop updates from backend
  React.useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/brand/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name,
          imageUrl,
          productUrl,
          category,
          price,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add product.');
      }

      const created = await res.json();
      setProducts([created, ...products]);
      
      // Reset form & close modal immediately
      setName('');
      setImageUrl('');
      setProductUrl('');
      setDescription('');
      setShowAddForm(false);
      
      setStatusMsg({ type: 'success', text: 'Product added successfully to your catalog!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error adding product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/brand/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        onSaveSuccess?.();
      }
    } catch (err) {
      // Ignore
    } finally {
      setDeletingId(null);
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempPreview = URL.createObjectURL(file);
    setImageUrl(tempPreview);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/file-upload/upload`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
      }
    } catch (err) {
      // Ignore
    } finally {
      setIsUploadingImage(false);
    }
  };

  const [priceNumeric, setPriceNumeric] = useState<number>(99);

  const modalMarkup = (
    <AnimatePresence>
      {showAddForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay Click to Close */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setShowAddForm(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl bg-slate-900/95 border border-purple-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl text-left my-auto backdrop-blur-xl space-y-6"
          >
            {/* Top Right Close Button (No Heading Section) */}
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Form */}
            <form onSubmit={handleAddProduct} className="space-y-5">
              {/* Product Image Placeholder Avatar (Click to Upload) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Product Image / Thumbnail</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-purple-500 transition-all relative group shadow-inner"
                    title="Click to upload image from device"
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Product preview" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-purple-400 transition-colors p-2 text-center">
                        {isUploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[9px] font-medium leading-none text-slate-400">Upload Photo</span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-semibold">
                      <Camera className="w-4 h-4 mb-0.5 text-purple-300" />
                      <span>{isUploadingImage ? 'Uploading...' : 'Change Photo'}</span>
                    </div>

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400">Image Web Link</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://domain.com/photo.png) or click avatar on left to upload"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product / Service Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Hydrating Serum / Pro SaaS Plan"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Apparel & Accessories">Apparel & Accessories</option>
                    <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                    <option value="Electronics & Tech">Electronics & Tech</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Fitness & Supplements">Fitness & Supplements</option>
                    <option value="Digital Services">Digital Services</option>
                  </select>
                </div>

                {/* Price / Value Interactive Range Slider (Without preset tag pills) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-300">Price / Value Range</label>
                    <span className="px-3 py-1 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-extrabold shadow-sm">
                      {priceNumeric === 0 ? 'Free Sample' : priceNumeric >= 1000 ? '$1,000+' : `$${priceNumeric}`}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={10}
                    value={priceNumeric}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceNumeric(val);
                      setPrice(val === 0 ? 'Free Sample' : val >= 1000 ? '$1,000+' : `$${val}`);
                    }}
                    className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product / Service URL</label>
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://yourbrand.com/products/item"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description / Campaign Highlights</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key features, target benefits or promotion details for creators..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-y min-h-[120px]"
                  />
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Offering</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
      {mounted && typeof document !== 'undefined' ? createPortal(modalMarkup, document.body) : null}

      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>Product & Service Offerings</span>
          </h3>
          <p className="text-xs text-slate-400">Manage products or services available for influencer campaigns</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/40 text-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs font-medium ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Product List Grid */}
      {products.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl p-6">
          <ShoppingBag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-medium">No products or services registered yet.</p>
          <p className="text-[11px] text-slate-500 mt-1">Click "Add Product" above to catalog offerings for creators.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => (
            <div key={item.id} className="relative group bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-pink-400" />
                        {item.category || 'General'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {item.description && <p className="text-[11px] text-slate-400/90 line-clamp-2 mt-1">{item.description}</p>}
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-300">{item.price || 'N/A'}</span>
                {item.productUrl && (
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Link</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Button */}
      <div className="pt-4 border-t border-white/10 flex justify-end">
        <button
          type="button"
          onClick={() => onSaveSuccess?.()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2"
        >
          <span>Save & Continue to Next Section</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

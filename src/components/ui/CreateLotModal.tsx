import React, { useState } from 'react';
import { Package, X, Loader2 } from 'lucide-react';
import { createScrapLot } from '../../services/supabaseApi';
import { useAuth } from '../../contexts/AuthContext';

interface CreateLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateLotModal({ isOpen, onClose, onSuccess }: CreateLotModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'mixed_electronics',
    weightKg: 10,
    basePrice: 500,
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await createScrapLot(
        user.id,
        formData.category,
        formData.weightKg,
        formData.basePrice,
        formData.description
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Failed to create lot: " + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-md hover:bg-white/10">
          <X size={18} />
        </button>
        
        <div className="flex items-center gap-2 mb-6">
          <Package className="text-primary" size={24} />
          <h2 className="text-lg font-bold">Create Marketplace Lot</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Lot Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              <option value="mixed_electronics">Mixed Electronics</option>
              <option value="mobile_phones">Mobile Phones Only</option>
              <option value="circuit_boards">Circuit Boards</option>
              <option value="laptops">Laptops / PCs</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total Weight (kg)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.weightKg}
                onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Base Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Item Description & Details</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              placeholder="List out the specific devices, conditions, and any notes for the recyclers..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'List on Marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
}

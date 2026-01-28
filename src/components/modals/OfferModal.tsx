import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Autocomplete } from '../ui/Autocomplete';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  equipmentId?: string;
  equipmentType?: string;
  onOfferSuccess?: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ 
  isOpen, 
  onClose, 
  requestId, 
  equipmentId, 
  equipmentType,
  onOfferSuccess 
}) => {
  const [form, setForm] = useState({
    equipmentName: '',
    dailyRate: '',
    currency: 'SAR',
    price: '',
    expiresAt: '',
    notes: '',
  });
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        equipmentName: '',
        dailyRate: '',
        currency: 'SAR',
        price: '',
        expiresAt: '',
        notes: '',
      });
      setSelectedEquipment(null);
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment);
    if (equipment) {
      setForm(prev => ({ ...prev, equipmentName: equipment.name || equipment.title || '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!form.dailyRate || !form.price || !form.expiresAt) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        requestId: requestId,
        dailyRate: parseFloat(form.dailyRate),
        currency: form.currency,
        price: parseFloat(form.price),
        expiresAt: form.expiresAt,
        notes: form.notes,
      };
      // Use selected equipment ID if available, otherwise use the passed equipmentId
      if (selectedEquipment?.id) {
        payload.equipmentId = selectedEquipment.id;
      } else if (equipmentId) {
        payload.equipmentId = equipmentId;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/offers`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit offer');
      setSuccess(true);
      if (onOfferSuccess) onOfferSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Offer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Autocomplete
          value={form.equipmentName}
          onChange={(value) => setForm(prev => ({ ...prev, equipmentName: value }))}
          onSelect={handleEquipmentSelect}
          placeholder="Search for equipment..."
          label="Equipment Name"
          required={!equipmentId}
          disabled={!!equipmentId}
          equipmentType={equipmentType}
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Daily Rate <span className="text-red-500">*</span></label>
            <Input name="dailyRate" type="number" value={form.dailyRate} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Select name="currency" value={form.currency} onChange={handleChange}>
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Total Price <span className="text-red-500">*</span></label>
            <Input name="price" type="number" value={form.price} onChange={handleChange} required min="0" step="0.01" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expires At <span className="text-red-500">*</span></label>
          <Input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Offer submitted successfully!</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Offer'}</Button>
        </div>
      </form>
    </Modal>
  );
};

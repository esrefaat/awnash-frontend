import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Autocomplete } from '../ui/Autocomplete';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  equipmentId?: string;
  equipmentType?: string;
  onBidSuccess?: () => void;
}

export const BidModal: React.FC<BidModalProps> = ({ 
  isOpen, 
  onClose, 
  requestId, 
  equipmentId, 
  equipmentType,
  onBidSuccess 
}) => {
  const [form, setForm] = useState({
    equipment_name: '',
    daily_rate: '',
    daily_rate_currency: 'SAR',
    total_amount: '',
    total_amount_currency: 'SAR',
    expires_at: '',
    note: '',
  });
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        equipment_name: '',
        daily_rate: '',
        daily_rate_currency: 'SAR',
        total_amount: '',
        total_amount_currency: 'SAR',
        expires_at: '',
        note: '',
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
      setForm(prev => ({ ...prev, equipment_name: equipment.name || equipment.title || '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!form.daily_rate || !form.total_amount || !form.expires_at) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        request_id: requestId,
        daily_rate: parseFloat(form.daily_rate),
        daily_rate_currency: form.daily_rate_currency,
        total_amount: parseFloat(form.total_amount),
        total_amount_currency: form.total_amount_currency,
        expires_at: form.expires_at,
        note: form.note,
      };
      // Use selected equipment ID if available, otherwise use the passed equipmentId
      if (selectedEquipment?.id) {
        payload.equipment_id = selectedEquipment.id;
      } else if (equipmentId) {
        payload.equipment_id = equipmentId;
      }
      const res = await fetch('http://localhost:3001/api/booking/bid', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit bid');
      setSuccess(true);
      if (onBidSuccess) onBidSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Bid" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Autocomplete
          value={form.equipment_name}
          onChange={(value) => setForm(prev => ({ ...prev, equipment_name: value }))}
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
            <Input name="daily_rate" type="number" value={form.daily_rate} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Select name="daily_rate_currency" value={form.daily_rate_currency} onChange={handleChange}>
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Total Amount <span className="text-red-500">*</span></label>
            <Input name="total_amount" type="number" value={form.total_amount} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Select name="total_amount_currency" value={form.total_amount_currency} onChange={handleChange}>
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expires At <span className="text-red-500">*</span></label>
          <Input name="expires_at" type="datetime-local" value={form.expires_at} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Note</label>
          <Textarea name="note" value={form.note} onChange={handleChange} rows={3} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Bid submitted successfully!</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Bid'}</Button>
        </div>
      </form>
    </Modal>
  );
}; 
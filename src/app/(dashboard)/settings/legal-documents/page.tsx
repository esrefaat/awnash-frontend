'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/Button';
import {
  faFileContract,
  faPlus,
  faCheck,
  faEdit,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { legalService, type LegalDocument } from '@/services/legalService';

const DOC_TYPES = [
  { value: 'terms_of_service', label: 'Terms of Service' },
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'owner_agreement', label: 'Owner Agreement' },
  { value: 'commission_agreement', label: 'Commission Agreement' },
  { value: 'rental_agreement', label: 'Rental Agreement' },
];

export default function LegalDocumentsPage() {
  const [selectedType, setSelectedType] = useState('terms_of_service');
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState<Partial<LegalDocument> | null>(null);
  const [form, setForm] = useState({
    version: '',
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await legalService.listDocuments(selectedType);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleCreate = async () => {
    try {
      await legalService.createDocument({ type: selectedType, ...form });
      setShowForm(false);
      setForm({ version: '', title: '', titleAr: '', content: '', contentAr: '', effectiveDate: new Date().toISOString().split('T')[0] });
      fetchDocs();
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await legalService.activateDocument(id);
      fetchDocs();
    } catch (err) {
      console.error('Failed to activate document:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <FontAwesomeIcon icon={faFileContract} className="text-indigo-600" />
            Legal Documents
          </h1>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Manage platform legal document templates</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" /> New Version
        </Button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {DOC_TYPES.map(dt => (
          <button
            key={dt.value}
            onClick={() => setSelectedType(dt.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium border',
              selectedType === dt.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-card text-gray-700 dark:text-foreground border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted'
            )}
          >
            {dt.label}
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-400 dark:text-muted-foreground">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-muted-foreground">No documents yet. Create the first version.</div>
        ) : documents.map(doc => (
          <div key={doc.id} className={cn(
            'bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-4',
            doc.isActive && 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium dark:text-foreground">{doc.title}</span>
                  <span className="text-sm text-gray-500 dark:text-muted-foreground">v{doc.version}</span>
                  {doc.isActive && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                  Effective: {new Date(doc.effectiveDate).toLocaleDateString()} | Created: {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                {!doc.isActive && (
                  <Button size="sm" variant="outline" onClick={() => handleActivate(doc.id)}>
                    <FontAwesomeIcon icon={faCheck} className="mr-1" /> Activate
                  </Button>
                )}
              </div>
            </div>
            {doc.content && (
              <p className="text-sm text-gray-600 dark:text-muted-foreground mt-2 line-clamp-2">{doc.content.substring(0, 200)}...</p>
            )}
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border dark:border-border">
            <div className="flex items-center justify-between p-6 border-b dark:border-border">
              <h2 className="text-lg font-bold dark:text-foreground">New Document Version</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Version</label>
                  <input type="text" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="e.g. 1.0" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-muted dark:border-border dark:text-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Effective Date</label>
                  <input type="date" value={form.effectiveDate} onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-muted dark:border-border dark:text-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Title (English)</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-muted dark:border-border dark:text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Title (Arabic)</label>
                <input type="text" value={form.titleAr} onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))} dir="rtl" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-muted dark:border-border dark:text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Content (English)</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-muted dark:border-border dark:text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Content (Arabic)</label>
                <textarea value={form.contentAr} onChange={e => setForm(f => ({ ...f, contentAr: e.target.value }))} rows={8} dir="rtl" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-muted dark:border-border dark:text-foreground" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Document</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

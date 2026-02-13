'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdCard,
  faSearch,
  faFilter,
  faEye,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faCalendarAlt,
  faUser,
  faTruck,
  faFileAlt,
  faComment,
  faDownload,
  faPrint,
  faSort,
  faSortUp,
  faSortDown,
  faCheckSquare,
  faSquare,
  faClipboardCheck,
  faTimesCircle,
  faCheckCircle,
  faClockRotateLeft,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

// Types
interface Document {
  id: string;
  ownerName: string;
  ownerEmail: string;
  documentType: 'license' | 'tax_doc' | 'operator_permit' | 'insurance';
  equipmentName?: string;
  uploadDate: string;
  expirationDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  fileUrl: string;
  fileName: string;
  notes?: string;
  adminNotes?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
}

const DocumentsVerification: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Mock data
  const [documents] = useState<Document[]>([
    {
      id: 'DOC-001',
      ownerName: 'Ahmed Al-Mansouri',
      ownerEmail: 'ahmed@example.com',
      documentType: 'license',
      equipmentName: 'CAT 320D Excavator',
      uploadDate: '2024-06-20',
      expirationDate: '2025-06-20',
      status: 'pending',
      fileUrl: '/documents/license-001.pdf',
      fileName: 'equipment_license_cat320d.pdf',
      notes: 'Equipment registration license for CAT 320D'
    },
    {
      id: 'DOC-002',
      ownerName: 'Fatima Al-Zahra',
      ownerEmail: 'fatima.zahra@example.com',
      documentType: 'tax_doc',
      uploadDate: '2024-06-19',
      expirationDate: '2024-12-31',
      status: 'approved',
      fileUrl: '/documents/tax-002.pdf',
      fileName: 'tax_registration_2024.pdf',
      verifiedBy: 'Admin User',
      verifiedDate: '2024-06-19',
      adminNotes: 'All tax documents verified and valid'
    },
    {
      id: 'DOC-003',
      ownerName: 'Omar Al-Sabah',
      ownerEmail: 'omar.sabah@example.com',
      documentType: 'operator_permit',
      equipmentName: 'Liebherr LTM 1100 Crane',
      uploadDate: '2024-06-18',
      expirationDate: '2024-08-15',
      status: 'rejected',
      fileUrl: '/documents/permit-003.pdf',
      fileName: 'crane_operator_permit.pdf',
      verifiedBy: 'Admin User',
      verifiedDate: '2024-06-18',
      rejectionReason: 'Permit expires too soon. Please upload renewed permit.',
      adminNotes: 'Expiration date is less than 3 months away'
    },
    {
      id: 'DOC-004',
      ownerName: 'Sara Al-Khalifa',
      ownerEmail: 'sara.khalifa@example.com',
      documentType: 'insurance',
      equipmentName: 'JCB 3CX Backhoe',
      uploadDate: '2024-06-17',
      expirationDate: '2024-07-15',
      status: 'pending',
      fileUrl: '/documents/insurance-004.pdf',
      fileName: 'equipment_insurance_jcb.pdf',
      notes: 'Comprehensive insurance coverage'
    },
    {
      id: 'DOC-005',
      ownerName: 'Mohammed Al-Rashid',
      ownerEmail: 'mohammed.rashid@example.com',
      documentType: 'license',
      equipmentName: 'Volvo EC140E Excavator',
      uploadDate: '2024-06-16',
      expirationDate: '2025-12-31',
      status: 'approved',
      fileUrl: '/documents/license-005.pdf',
      fileName: 'volvo_excavator_license.pdf',
      verifiedBy: 'Admin User',
      verifiedDate: '2024-06-16',
      adminNotes: 'Valid equipment license with extended validity'
    }
  ]);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('uploadDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtered and sorted documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesType = documentTypeFilter === 'all' || doc.documentType === documentTypeFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Document];
      let bValue: any = b[sortField as keyof Document];
      
      if (sortField === 'uploadDate' || sortField === 'expirationDate') {
        aValue = new Date(aValue || '');
        bValue = new Date(bValue || '');
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [documents, searchTerm, documentTypeFilter, statusFilter, sortField, sortDirection]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      license: isRTL ? 'رخصة المعدة' : 'Equipment License',
      tax_doc: isRTL ? 'وثيقة ضريبية' : 'Tax Document',
      operator_permit: isRTL ? 'تصريح تشغيل' : 'Operator Permit',
      insurance: isRTL ? 'تأمين' : 'Insurance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: {
        variant: 'outline' as const,
        className: 'border-yellow-500 text-yellow-500 bg-yellow-500/10',
        icon: faClockRotateLeft,
        label: isRTL ? 'قيد المراجعة' : 'Pending'
      },
      approved: {
        variant: 'outline' as const,
        className: 'border-green-500 text-green-500 bg-green-500/10',
        icon: faCheckCircle,
        label: isRTL ? 'مقبول' : 'Approved'
      },
      rejected: {
        variant: 'outline' as const,
        className: 'border-red-500 text-red-500 bg-red-500/10',
        icon: faTimesCircle,
        label: isRTL ? 'مرفوض' : 'Rejected'
      }
    };

    const config = configs[status as keyof typeof configs];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={cn('flex items-center gap-1', config.className)}>
        <FontAwesomeIcon icon={config.icon} className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const isDocumentExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expiry = new Date(expirationDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleApproveDocument = (document: Document) => {
    console.log('Approving document:', document.id);
    // API call would go here
  };

  const handleRejectDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowRejectModal(true);
  };

  const handleBulkApprove = () => {
    console.log('Bulk approving documents:', selectedDocuments);
    // API call would go here
    setSelectedDocuments([]);
  };

  const handleBulkReject = () => {
    // For bulk reject, you might want to show a different modal or handle differently
    console.log('Bulk rejecting documents:', selectedDocuments);
  };

  const submitRejection = () => {
    if (selectedDocument && rejectionReason.trim()) {
      console.log('Rejecting document:', selectedDocument.id, 'Reason:', rejectionReason);
      // API call would go here
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedDocument(null);
    }
  };

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  return (
    <div className={cn("min-h-screen bg-background", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <FontAwesomeIcon icon={faIdCard} className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isRTL ? 'التحقق من الوثائق' : 'Document Verification'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isRTL ? 'مراجعة والتحقق من الوثائق القانونية المرفوعة من قبل الملاك' : 'Review and verify legal documents uploaded by equipment owners'}
              </p>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDocuments.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl mb-6">
              <span className="text-blue-400 font-medium">
                {isRTL ? `${selectedDocuments.length} وثيقة مختارة` : `${selectedDocuments.length} documents selected`}
              </span>
              <div className={cn('flex items-center gap-3', isRTL && 'space-x-reverse')}>
                <Button
                  onClick={handleBulkApprove}
                  className="bg-green-600 hover:bg-green-700 text-foreground"
                >
                  <FontAwesomeIcon icon={faCheck} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'قبول الجميع' : 'Approve All'}
                </Button>
                <Button
                  onClick={handleBulkReject}
                  className="bg-red-600 hover:bg-red-700 text-foreground"
                >
                  <FontAwesomeIcon icon={faTimes} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'رفض الجميع' : 'Reject All'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className={cn('absolute top-3 h-4 w-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} 
                />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث بالاسم، الإيميل، أو المعدة...' : 'Search by owner, email, or equipment...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    'w-full bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4',
                    'py-2'
                  )}
                />
              </div>
            </div>

            {/* Document Type Filter */}
            <div>
              <select
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع أنواع الوثائق' : 'All Document Types'}</option>
                <option value="license">{isRTL ? 'رخصة المعدة' : 'Equipment License'}</option>
                <option value="tax_doc">{isRTL ? 'وثيقة ضريبية' : 'Tax Document'}</option>
                <option value="operator_permit">{isRTL ? 'تصريح تشغيل' : 'Operator Permit'}</option>
                <option value="insurance">{isRTL ? 'تأمين' : 'Insurance'}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="pending">{isRTL ? 'قيد المراجعة' : 'Pending'}</option>
                <option value="approved">{isRTL ? 'مقبول' : 'Approved'}</option>
                <option value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</option>
              </select>
            </div>

            {/* Export */}
            <div className={cn('flex justify-end', isRTL && 'justify-start')}>
              <Button className="bg-awnash-primary hover:bg-awnash-primary-hover text-black">
                <FontAwesomeIcon icon={faDownload} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-4">
                    <button
                      onClick={handleSelectAll}
                      className="text-foreground hover:text-awnash-primary transition-colors"
                    >
                      <FontAwesomeIcon 
                        icon={selectedDocuments.length === filteredDocuments.length ? faCheckSquare : faSquare} 
                        className="h-4 w-4" 
                      />
                    </button>
                  </th>
                  <th 
                    className={cn('px-6 py-4 text-foreground font-semibold cursor-pointer hover:bg-muted', isRTL ? 'text-right' : 'text-left')}
                    onClick={() => handleSort('ownerName')}
                  >
                    <div className="flex items-center gap-2">
                      <span>{isRTL ? 'المالك' : 'Owner'}</span>
                      <FontAwesomeIcon icon={getSortIcon('ownerName')} className="h-3 w-3" />
                    </div>
                  </th>
                  <th className={cn('px-6 py-4 text-foreground font-semibold', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'نوع الوثيقة' : 'Document Type'}
                  </th>
                  <th className={cn('px-6 py-4 text-foreground font-semibold', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'المعدة' : 'Equipment'}
                  </th>
                  <th 
                    className={cn('px-6 py-4 text-foreground font-semibold cursor-pointer hover:bg-muted', isRTL ? 'text-right' : 'text-left')}
                    onClick={() => handleSort('uploadDate')}
                  >
                    <div className="flex items-center gap-2">
                      <span>{isRTL ? 'تاريخ الرفع' : 'Upload Date'}</span>
                      <FontAwesomeIcon icon={getSortIcon('uploadDate')} className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className={cn('px-6 py-4 text-foreground font-semibold cursor-pointer hover:bg-muted', isRTL ? 'text-right' : 'text-left')}
                    onClick={() => handleSort('expirationDate')}
                  >
                    <div className="flex items-center gap-2">
                      <span>{isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}</span>
                      <FontAwesomeIcon icon={getSortIcon('expirationDate')} className="h-3 w-3" />
                    </div>
                  </th>
                  <th className={cn('px-6 py-4 text-foreground font-semibold', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className={cn('px-6 py-4 text-foreground font-semibold', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocuments.map((document) => (
                  <tr 
                    key={document.id} 
                    className={cn(
                      'hover:bg-muted transition-colors',
                      isDocumentExpiringSoon(document.expirationDate) && 'bg-red-900/20 border-red-500/30'
                    )}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleSelectDocument(document.id)}
                        className="text-foreground hover:text-awnash-primary transition-colors"
                      >
                        <FontAwesomeIcon 
                          icon={selectedDocuments.includes(document.id) ? faCheckSquare : faSquare} 
                          className="h-4 w-4" 
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{document.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{document.ownerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon 
                          icon={document.documentType === 'license' ? faFileAlt : 
                                document.documentType === 'tax_doc' ? faBuilding :
                                document.documentType === 'operator_permit' ? faClipboardCheck : faFileAlt} 
                          className="h-4 w-4 text-muted-foreground" 
                        />
                        <span className="text-foreground">{getDocumentTypeLabel(document.documentType)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {document.equipmentName ? (
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{document.equipmentName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground">{formatDate(document.uploadDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {document.expirationDate ? (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-foreground',
                            isDocumentExpiringSoon(document.expirationDate) && 'text-red-400 font-semibold'
                          )}>
                            {formatDate(document.expirationDate)}
                          </span>
                          {isDocumentExpiringSoon(document.expirationDate) && (
                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(document.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreviewDocument(document)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-muted rounded transition-colors"
                          title={isRTL ? 'معاينة الوثيقة' : 'Preview Document'}
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                        
                        {document.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveDocument(document)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-muted rounded transition-colors"
                              title={isRTL ? 'قبول' : 'Approve'}
                            >
                              <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectDocument(document)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-muted rounded transition-colors"
                              title={isRTL ? 'رفض' : 'Reject'}
                            >
                              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faFileAlt} className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {isRTL ? 'لا توجد وثائق' : 'No documents found'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'لا توجد وثائق تطابق المعايير المحددة' : 'No documents match the current filters'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={isRTL ? 'معاينة الوثيقة' : 'Document Preview'}
          size="xl"
        >
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">
                    {isRTL ? 'اسم الملف:' : 'File Name:'}
                  </span>
                  <p className="text-gray-900">{selectedDocument.fileName}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    {isRTL ? 'المالك:' : 'Owner:'}
                  </span>
                  <p className="text-gray-900">{selectedDocument.ownerName}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    {isRTL ? 'نوع الوثيقة:' : 'Document Type:'}
                  </span>
                  <p className="text-gray-900">{getDocumentTypeLabel(selectedDocument.documentType)}</p>
                </div>
                {selectedDocument.equipmentName && (
                  <div>
                    <span className="font-semibold text-gray-700">
                      {isRTL ? 'المعدة:' : 'Equipment:'}
                    </span>
                    <p className="text-gray-900">{selectedDocument.equipmentName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Viewer */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FontAwesomeIcon icon={faFileAlt} className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-gray-600 mb-4">
                {isRTL ? 'معاينة الوثيقة' : 'Document Preview'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {selectedDocument.fileName}
              </p>
              <div className={cn('flex justify-center gap-3', isRTL && 'space-x-reverse')}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-foreground">
                  <FontAwesomeIcon icon={faEye} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'فتح الوثيقة' : 'Open Document'}
                </Button>
                <Button variant="outline">
                  <FontAwesomeIcon icon={faDownload} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'تحميل' : 'Download'}
                </Button>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedDocument.adminNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {isRTL ? 'ملاحظات الإدارة:' : 'Admin Notes:'}
                </h4>
                <p className="text-blue-800">{selectedDocument.adminNotes}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedDocument.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">
                  {isRTL ? 'سبب الرفض:' : 'Rejection Reason:'}
                </h4>
                <p className="text-red-800">{selectedDocument.rejectionReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Document Modal */}
      {showRejectModal && selectedDocument && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={isRTL ? 'رفض الوثيقة' : 'Reject Document'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? 'سبب الرفض:' : 'Rejection Reason:'}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={isRTL ? 'اكتب سبب رفض هذه الوثيقة...' : 'Enter the reason for rejecting this document...'}
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-semibold text-gray-700">
                  {isRTL ? 'الوثيقة:' : 'Document:'}
                </span>
                <span className={`text-gray-900 ${isRTL ? 'ml-2' : 'mr-2'}`}>{selectedDocument.fileName}</span>
              </div>
              <div className="text-sm mt-1">
                <span className="font-semibold text-gray-700">
                  {isRTL ? 'المالك:' : 'Owner:'}
                </span>
                <span className={`text-gray-900 ${isRTL ? 'ml-2' : 'mr-2'}`}>{selectedDocument.ownerName}</span>
              </div>
            </div>

            <div className={cn('flex justify-end gap-3 pt-4', isRTL && 'space-x-reverse')}>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={submitRejection}
                disabled={!rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-foreground disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTimes} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'رفض الوثيقة' : 'Reject Document'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DocumentsVerification; 
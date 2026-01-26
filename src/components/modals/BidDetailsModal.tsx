import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faFilePdf,
  faDownload,
  faExternalLinkAlt,
  faUser,
  faCalendar,
  faDollarSign,
  faNoteSticky,
  faImage,
  faTimes,
  faCheckCircle,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Offer as Bid } from '@/services/offersService';
import { formatSimpleCurrency } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';

interface BidDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: Bid | null;
  isRTL?: boolean;
}

export const BidDetailsModal: React.FC<BidDetailsModalProps> = ({
  isOpen,
  onClose,
  bid,
  isRTL = false
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);

  if (!bid) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBidStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const handleDocumentAction = (documentUrl: string, action: 'view' | 'download') => {
    if (action === 'view') {
      // Open PDF in new tab
      window.open(documentUrl, '_blank');
    } else {
      // Download PDF
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = `document-${Date.now()}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isRTL ? 'تفاصيل العرض' : 'Bid Details'} size="lg">
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isRTL ? 'عرض من' : 'Bid from'} {bid.bidder.full_name}
            </h3>
            <p className="text-sm text-gray-300">{bid.bidder.email}</p>
          </div>
          {getBidStatusBadge(bid.status)}
        </div>

        {/* Images Carousel */}
        {bid.images && bid.images.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white flex items-center">
              <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-blue-400 mr-2" />
              {isRTL ? 'الصور' : 'Images'}
            </h4>
            
            <div className="relative">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={bid.images[currentImageIndex]} 
                  alt={`Bid image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {bid.images.length}
                </div>
              </div>

              {/* Navigation Buttons */}
              {bid.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? bid.images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === bid.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Thumbnail Navigation */}
              {bid.images.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  {bid.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {bid.documents && bid.documents.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white flex items-center">
              <FontAwesomeIcon icon={faFilePdf} className="h-4 w-4 text-red-400 mr-2" />
              {isRTL ? 'المستندات' : 'Documents'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bid.documents.map((document, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faFilePdf} className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isRTL ? 'مستند' : 'Document'} {index + 1}
                      </p>
                      <p className="text-xs text-gray-300">PDF</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDocumentAction(document, 'view')}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title={isRTL ? 'عرض المستند' : 'View Document'}
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDocumentAction(document, 'download')}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title={isRTL ? 'تحميل المستند' : 'Download Document'}
                    >
                      <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bid Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-green-400 mr-2" />
              {isRTL ? 'المعلومات المالية' : 'Financial Information'}
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">{isRTL ? 'السعر اليومي:' : 'Daily Rate:'}</span>
                <span className="font-medium text-white">
                  {formatSimpleCurrency(bid.daily_rate, bid.daily_rate_currency)}/{isRTL ? 'يوم' : 'day'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">{isRTL ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                <span className="font-medium text-white">
                  {formatSimpleCurrency(bid.total_amount, bid.total_amount_currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white flex items-center">
              <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-blue-400 mr-2" />
              {isRTL ? 'التواريخ' : 'Timeline'}
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">{isRTL ? 'تاريخ التقديم:' : 'Submitted:'}</span>
                <span className="font-medium text-white">{formatDate(bid.created_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">{isRTL ? 'ينتهي في:' : 'Expires:'}</span>
                <span className="font-medium text-white">{formatDate(bid.expires_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Request Information */}
        {bid.request && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white flex items-center">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-purple-400 mr-2" />
              {isRTL ? 'معلومات الطلب' : 'Request Information'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-300">{isRTL ? 'نوع المعدة:' : 'Equipment Type:'}</p>
                <p className="font-medium text-white capitalize">{bid.request.equipment_type}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-300">{isRTL ? 'مقدم الطلب:' : 'Requester:'}</p>
                <p className="font-medium text-white">{bid.request.requester.full_name}</p>
                <p className="text-sm text-gray-300">{bid.request.requester.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-300">{isRTL ? 'تاريخ البداية:' : 'Start Date:'}</p>
                <p className="font-medium text-white">{formatDate(bid.request.start_date)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-300">{isRTL ? 'تاريخ النهاية:' : 'End Date:'}</p>
                <p className="font-medium text-white">{formatDate(bid.request.end_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {bid.note && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-white flex items-center">
              <FontAwesomeIcon icon={faNoteSticky} className="h-4 w-4 text-yellow-400 mr-2" />
              {isRTL ? 'الملاحظات' : 'Notes'}
            </h4>
            
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
              <p className="text-gray-200">{bid.note}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

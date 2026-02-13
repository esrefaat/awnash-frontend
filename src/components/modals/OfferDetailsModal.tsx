"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  ExternalLink,
  User,
  Calendar,
  DollarSign,
  StickyNote,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Offer } from "@/services/offersService";
import { formatSimpleCurrency } from "@/lib/currencyUtils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

// =============================================================================
// Types
// =============================================================================

interface OfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  isRTL?: boolean;
}

// =============================================================================
// Status Badge Component
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Pending" },
    accepted: { bg: "bg-green-500/10", text: "text-green-400", label: "Accepted" },
    rejected: { bg: "bg-red-500/10", text: "text-red-400", label: "Rejected" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        config.bg,
        config.text,
        `border-current/20`
      )}
    >
      {config.label}
    </span>
  );
}

// =============================================================================
// Section Header Component
// =============================================================================

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
}

function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <h4 className="text-md font-medium text-foreground flex items-center gap-2 mb-4">
      {icon}
      {title}
    </h4>
  );
}

// =============================================================================
// Info Row Component
// =============================================================================

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

// =============================================================================
// Image Carousel Component
// =============================================================================

interface ImageCarouselProps {
  images: string[];
  isRTL: boolean;
}

function ImageCarousel({ images, isRTL }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const prevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<ImageIcon className="h-4 w-4 text-blue-400" />}
        title={isRTL ? "الصور" : "Images"}
      />

      <div className="relative">
        <div className="relative w-full h-64 bg-background rounded-xl overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Counter */}
          <div className="absolute top-4 right-4 bg-black/60 text-foreground px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-foreground p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-foreground p-2 rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  index === currentIndex ? "bg-awnash-primary" : "bg-muted hover:bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Documents Section Component
// =============================================================================

interface DocumentsSectionProps {
  documents: string[];
  isRTL: boolean;
}

function DocumentsSection({ documents, isRTL }: DocumentsSectionProps) {
  if (!documents || documents.length === 0) return null;

  const handleAction = (url: string, action: "view" | "download") => {
    if (action === "view") {
      window.open(url, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-${Date.now()}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<FileText className="h-4 w-4 text-red-400" />}
        title={isRTL ? "المستندات" : "Documents"}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isRTL ? "مستند" : "Document"} {index + 1}
                </p>
                <p className="text-xs text-muted-foreground">PDF</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(doc, "view")}
                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                title={isRTL ? "عرض" : "View"}
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleAction(doc, "download")}
                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                title={isRTL ? "تحميل" : "Download"}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  isOpen,
  onClose,
  offer,
  isRTL = false,
}) => {
  if (!offer) return null;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-muted border-border"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <DialogHeader className="border-b border-border pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {isRTL ? "تفاصيل العرض" : "Offer Details"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? "عرض من" : "Offer from"}{" "}
                {offer.bidder?.fullName || offer.owner?.name}
              </p>
            </div>
            <StatusBadge status={offer.status} />
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Images */}
          <ImageCarousel images={offer.images || []} isRTL={isRTL} />

          {/* Documents */}
          <DocumentsSection documents={offer.documents || []} isRTL={isRTL} />

          {/* Financial & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial */}
            <div className="space-y-4">
              <SectionHeader
                icon={<DollarSign className="h-4 w-4 text-green-400" />}
                title={isRTL ? "المعلومات المالية" : "Financial Information"}
              />
              <div className="space-y-3 p-4 bg-background/50 rounded-xl border border-border">
                <InfoRow
                  label={isRTL ? "السعر اليومي:" : "Daily Rate:"}
                  value={`${formatSimpleCurrency(offer.dailyRate, offer.dailyRateCurrency)}/${isRTL ? "يوم" : "day"}`}
                />
                <InfoRow
                  label={isRTL ? "المبلغ الإجمالي:" : "Total Amount:"}
                  value={formatSimpleCurrency(offer.price, offer.currency)}
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <SectionHeader
                icon={<Calendar className="h-4 w-4 text-blue-400" />}
                title={isRTL ? "التواريخ" : "Timeline"}
              />
              <div className="space-y-3 p-4 bg-background/50 rounded-xl border border-border">
                <InfoRow
                  label={isRTL ? "تاريخ التقديم:" : "Submitted:"}
                  value={formatDate(offer.createdAt)}
                />
                <InfoRow
                  label={isRTL ? "ينتهي في:" : "Expires:"}
                  value={formatDate(offer.expiresAt)}
                />
              </div>
            </div>
          </div>

          {/* Request Information */}
          {offer.request && (
            <div className="space-y-4">
              <SectionHeader
                icon={<User className="h-4 w-4 text-purple-400" />}
                title={isRTL ? "معلومات الطلب" : "Request Information"}
              />
              <div className="grid grid-cols-2 gap-4 p-4 bg-background/50 rounded-xl border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "نوع المعدة:" : "Equipment Type:"}
                  </p>
                  <p className="font-medium text-foreground capitalize">
                    {offer.request.equipmentType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "مقدم الطلب:" : "Requester:"}
                  </p>
                  <p className="font-medium text-foreground">
                    {offer.request.requester.fullName || offer.request.requester.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تاريخ البداية:" : "Start Date:"}
                  </p>
                  <p className="font-medium text-foreground">
                    {formatDate(offer.request.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تاريخ النهاية:" : "End Date:"}
                  </p>
                  <p className="font-medium text-foreground">
                    {formatDate(offer.request.endDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {offer.note && (
            <div className="space-y-4">
              <SectionHeader
                icon={<StickyNote className="h-4 w-4 text-yellow-400" />}
                title={isRTL ? "الملاحظات" : "Notes"}
              />
              <div className="p-4 bg-background/50 rounded-xl border border-border">
                <p className="text-muted-foreground">{offer.note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-6 border-t border-border mt-6">
          <Button
            onClick={onClose}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            variant="outline"
          >
            {isRTL ? "إغلاق" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

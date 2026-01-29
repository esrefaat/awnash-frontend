'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faSearch,
  faFilter,
  faEye,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faImage,
  faVideo,
  faFile,
  faFilePdf,
  faCalendarAlt,
  faUser,
  faSort,
  faSortUp,
  faSortDown,
  faCheckSquare,
  faSquare,
  faCheckCircle,
  faClockRotateLeft,
  faTimesCircle,
  faFlag,
  faExpand,
  faSpinner,
  faRobot,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import moderationService, {
  MediaFile,
  MediaStatus,
  MediaType,
  MediaContext,
  ContextGroup,
  REJECTION_REASON_PRESETS,
  ModerationLabel
} from '@/services/moderationService';

type StatusFilter = 'all' | 'pending' | 'flagged' | 'approved' | 'rejected';
type MediaTypeFilter = 'all' | 'image' | 'video' | 'pdf' | 'document';

const MediaModeration: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [contextFilter, setContextFilter] = useState<MediaContext | 'all'>('all');
  const [groupByContext, setGroupByContext] = useState(false);
  const [contextGroups, setContextGroups] = useState<{ [key: string]: ContextGroup }>({});
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const limit = 20;

  // Refs for infinite scrolling
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const loadingRef = React.useRef(false);

  // Fetch media with infinite scroll support
  const fetchMedia = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await moderationService.getMediaList(
        pageNum,
        limit,
        statusFilter === 'all' ? undefined : statusFilter as MediaStatus,
        contextFilter === 'all' ? undefined : contextFilter,
        groupByContext
      );

      if (append) {
        setMediaFiles(prev => [...prev, ...response.data]);
      } else {
        setMediaFiles(response.data);
      }
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.total);
      setContextGroups(response.contextGroups || {});
      setPage(pageNum);
      setHasMore(pageNum < response.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError(isRTL ? 'فشل في جلب الوسائط' : 'Failed to fetch media');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [statusFilter, contextFilter, groupByContext, isRTL]);

  // Load more media for infinite scroll
  const loadMoreMedia = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    fetchMedia(page + 1, true);
  }, [fetchMedia, page, hasMore]);

  // Initial load and reload when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMedia(1, false);
  }, [statusFilter, contextFilter, groupByContext]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          loadMoreMedia();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMoreMedia]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filtered and sorted media
  const filteredMedia = useMemo(() => {
    let filtered = mediaFiles.filter(media => {
      const matchesSearch =
        media.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        media.status === statusFilter;

      const matchesType =
        mediaTypeFilter === 'all' ||
        media.mediaType === mediaTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof MediaFile];
      let bValue: any = b[sortField as keyof MediaFile];

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue || '');
        bValue = new Date(bValue || '');
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [mediaFiles, searchTerm, statusFilter, mediaTypeFilter, sortField, sortDirection]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.IMAGE:
        return faImage;
      case MediaType.VIDEO:
        return faVideo;
      case MediaType.PDF:
        return faFilePdf;
      default:
        return faFile;
    }
  };

  const getMediaTypeLabel = (type: MediaType) => {
    const labels = {
      image: isRTL ? 'صورة' : 'Image',
      video: isRTL ? 'فيديو' : 'Video',
      pdf: isRTL ? 'PDF' : 'PDF',
      document: isRTL ? 'مستند' : 'Document'
    };
    return labels[type] || type;
  };

  const getContextLabel = (context?: string) => {
    const labels: { [key: string]: { en: string; ar: string; icon: string } } = {
      'request': { en: 'Booking Request', ar: 'طلب حجز', icon: '📋' },
      'equipment': { en: 'Equipment', ar: 'معدات', icon: '🚜' },
      'equipment-type': { en: 'Equipment Type', ar: 'نوع معدات', icon: '📦' },
      'chat': { en: 'Chat', ar: 'محادثة', icon: '💬' },
      'profile': { en: 'Profile', ar: 'ملف شخصي', icon: '👤' },
      'dispute': { en: 'Dispute', ar: 'نزاع', icon: '⚠️' },
      'video-thumbnail': { en: 'Video Thumbnail', ar: 'صورة فيديو', icon: '🎬' },
    };
    const info = labels[context || ''];
    if (!info) return { label: context || (isRTL ? 'غير محدد' : 'Unknown'), icon: '📄' };
    return { label: isRTL ? info.ar : info.en, icon: info.icon };
  };

  const getStatusBadge = (status: MediaStatus, score?: number) => {
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
      },
      flagged: {
        variant: 'outline' as const,
        className: 'border-orange-500 text-orange-500 bg-orange-500/10',
        icon: faFlag,
        label: isRTL ? 'مُعلَّم للمراجعة' : 'Flagged'
      }
    };

    const config = configs[status];
    if (!config) return null;

    return (
      <div className="flex items-center gap-2">
        <Badge variant={config.variant} className={cn('flex items-center gap-1', config.className)}>
          <FontAwesomeIcon icon={config.icon} className="h-3 w-3" />
          <span>{config.label}</span>
        </Badge>
        {score !== undefined && score !== null && (
          <span className={cn(
            'text-xs px-2 py-0.5 rounded',
            score < 50 ? 'bg-green-500/20 text-green-400' :
            score < 90 ? 'bg-orange-500/20 text-orange-400' :
            'bg-red-500/20 text-red-400'
          )}>
            {score.toFixed(0)}%
          </span>
        )}
      </div>
    );
  };

  const getModerationScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-gray-400';
    if (score < 50) return 'text-green-400';
    if (score < 90) return 'text-orange-400';
    return 'text-red-400';
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

  const handleSelectMedia = (mediaId: string) => {
    setSelectedMedia(prev =>
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const handleSelectAll = () => {
    const pendingMedia = filteredMedia.filter(m => m.status === MediaStatus.PENDING || m.status === MediaStatus.FLAGGED);
    if (selectedMedia.length === pendingMedia.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(pendingMedia.map(m => m.id));
    }
  };

  const handleApproveMedia = async (media: MediaFile) => {
    setProcessingIds(prev => new Set(prev).add(media.id));
    try {
      await moderationService.approveMedia(media.id);
      setMediaFiles(prev => prev.map(m => 
        m.id === media.id ? { ...m, status: MediaStatus.APPROVED } : m
      ));
      setSuccessMessage(isRTL ? 'تم قبول الوسائط بنجاح' : 'Media approved successfully');
    } catch (err) {
      console.error('Failed to approve media:', err);
      setError(isRTL ? 'فشل في قبول الوسائط' : 'Failed to approve media');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(media.id);
        return next;
      });
    }
  };

  const handleRejectMedia = (media: MediaFile) => {
    setCurrentMedia(media);
    setRejectionReason('');
    setSelectedPreset('');
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!currentMedia) return;
    
    setProcessingIds(prev => new Set(prev).add(currentMedia.id));
    try {
      const reason = rejectionReason || (selectedPreset ? REJECTION_REASON_PRESETS[selectedPreset as keyof typeof REJECTION_REASON_PRESETS]?.[isRTL ? 'ar' : 'en'] : '');
      await moderationService.rejectMedia(currentMedia.id, reason);
      setMediaFiles(prev => prev.map(m =>
        m.id === currentMedia.id ? { ...m, status: MediaStatus.REJECTED, rejectionReason: reason } : m
      ));
      setShowRejectModal(false);
      setCurrentMedia(null);
      setRejectionReason('');
      setSelectedPreset('');
      setSuccessMessage(isRTL ? 'تم رفض الوسائط بنجاح' : 'Media rejected successfully');
    } catch (err) {
      console.error('Failed to reject media:', err);
      setError(isRTL ? 'فشل في رفض الوسائط' : 'Failed to reject media');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(currentMedia.id);
        return next;
      });
    }
  };

  const handleBulkApprove = async () => {
    const idsToApprove = selectedMedia.filter(id => {
      const media = mediaFiles.find(m => m.id === id);
      return media && (media.status === MediaStatus.PENDING || media.status === MediaStatus.FLAGGED);
    });

    if (idsToApprove.length === 0) return;

    setProcessingIds(prev => new Set([...prev, ...idsToApprove]));
    try {
      await moderationService.bulkApprove(idsToApprove);
      setMediaFiles(prev => prev.map(m =>
        idsToApprove.includes(m.id) ? { ...m, status: MediaStatus.APPROVED } : m
      ));
      setSelectedMedia([]);
      setSuccessMessage(isRTL 
        ? `تم قبول ${idsToApprove.length} ملف بنجاح` 
        : `Successfully approved ${idsToApprove.length} files`);
    } catch (err) {
      console.error('Failed to bulk approve:', err);
      setError(isRTL ? 'فشل في قبول الملفات' : 'Failed to approve files');
    } finally {
      setProcessingIds(new Set());
    }
  };

  const handleBulkReject = async () => {
    setCurrentMedia(null);
    setRejectionReason('');
    setSelectedPreset('');
    setShowRejectModal(true);
  };

  const submitBulkRejection = async () => {
    const idsToReject = selectedMedia.filter(id => {
      const media = mediaFiles.find(m => m.id === id);
      return media && (media.status === MediaStatus.PENDING || media.status === MediaStatus.FLAGGED);
    });

    if (idsToReject.length === 0) return;

    setProcessingIds(prev => new Set([...prev, ...idsToReject]));
    try {
      const reason = rejectionReason || (selectedPreset ? REJECTION_REASON_PRESETS[selectedPreset as keyof typeof REJECTION_REASON_PRESETS]?.[isRTL ? 'ar' : 'en'] : '');
      await moderationService.bulkReject(idsToReject, reason);
      setMediaFiles(prev => prev.map(m =>
        idsToReject.includes(m.id) ? { ...m, status: MediaStatus.REJECTED, rejectionReason: reason } : m
      ));
      setSelectedMedia([]);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedPreset('');
      setSuccessMessage(isRTL 
        ? `تم رفض ${idsToReject.length} ملف بنجاح` 
        : `Successfully rejected ${idsToReject.length} files`);
    } catch (err) {
      console.error('Failed to bulk reject:', err);
      setError(isRTL ? 'فشل في رفض الملفات' : 'Failed to reject files');
    } finally {
      setProcessingIds(new Set());
    }
  };

  const handlePreviewMedia = (media: MediaFile) => {
    setCurrentMedia(media);
    setShowPreviewModal(true);
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset && REJECTION_REASON_PRESETS[preset as keyof typeof REJECTION_REASON_PRESETS]) {
      setRejectionReason(REJECTION_REASON_PRESETS[preset as keyof typeof REJECTION_REASON_PRESETS][isRTL ? 'ar' : 'en']);
    }
  };

  const renderModerationLabels = (labels?: ModerationLabel[]) => {
    if (!labels || labels.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {labels.slice(0, 3).map((label, idx) => (
          <span
            key={idx}
            className={cn(
              'text-xs px-2 py-0.5 rounded',
              label.confidence >= 90 ? 'bg-red-500/20 text-red-400' :
              label.confidence >= 70 ? 'bg-orange-500/20 text-orange-400' :
              'bg-gray-500/20 text-gray-400'
            )}
          >
            {label.name} ({label.confidence.toFixed(0)}%)
          </span>
        ))}
        {labels.length > 3 && (
          <span className="text-xs text-gray-500">+{labels.length - 3}</span>
        )}
      </div>
    );
  };

  // Statistics
  const pendingCount = mediaFiles.filter(m => m.status === MediaStatus.PENDING).length;
  const flaggedCount = mediaFiles.filter(m => m.status === MediaStatus.FLAGGED).length;

  return (
    <div className={cn("min-h-screen bg-gray-900", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
            <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-600 rounded-2xl">
              <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isRTL ? 'إشراف على المحتوى' : 'Content Moderation'}
              </h1>
              <p className="text-gray-400 mt-1">
                {isRTL 
                  ? 'مراجعة والموافقة على الوسائط المرفوعة من المستخدمين' 
                  : 'Review and approve user-uploaded media content'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingCount}</p>
                  <p className="text-sm text-gray-400">{isRTL ? 'قيد المراجعة' : 'Pending Review'}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <FontAwesomeIcon icon={faFlag} className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{flaggedCount}</p>
                  <p className="text-sm text-gray-400">{isRTL ? 'مُعلَّم للمراجعة' : 'Flagged for Review'}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FontAwesomeIcon icon={faRobot} className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalCount}</p>
                  <p className="text-sm text-gray-400">{isRTL ? 'إجمالي في القائمة' : 'Total in Queue'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedMedia.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-purple-600/10 border border-purple-600/20 rounded-xl mb-6">
              <span className="text-purple-400 font-medium">
                {isRTL ? `${selectedMedia.length} ملف مختار` : `${selectedMedia.length} files selected`}
              </span>
              <div className={cn('flex items-center gap-3', isRTL && 'space-x-reverse')}>
                <Button
                  onClick={handleBulkApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={processingIds.size > 0}
                >
                  {processingIds.size > 0 ? (
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faCheck} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  )}
                  {isRTL ? 'قبول الكل' : 'Approve All'}
                </Button>
                <Button
                  onClick={handleBulkReject}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={processingIds.size > 0}
                >
                  <FontAwesomeIcon icon={faTimes} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'رفض الكل' : 'Reject All'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className={cn('absolute top-3 h-4 w-4 text-gray-400', isRTL ? 'right-3' : 'left-3')}
                />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث بالاسم أو المستخدم...' : 'Search by name or user...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    'w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4',
                    'py-2'
                  )}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="pending">{isRTL ? 'قيد المراجعة' : 'Pending'}</option>
                <option value="flagged">{isRTL ? 'مُعلَّم' : 'Flagged'}</option>
                <option value="approved">{isRTL ? 'مقبول' : 'Approved'}</option>
                <option value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</option>
              </select>
            </div>

            {/* Context Filter */}
            <div>
              <select
                value={contextFilter}
                onChange={(e) => { setContextFilter(e.target.value as MediaContext | 'all'); setPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{isRTL ? 'جميع السياقات' : 'All Contexts'}</option>
                <option value="request">{isRTL ? 'طلبات الحجز' : 'Booking Requests'}</option>
                <option value="equipment">{isRTL ? 'المعدات' : 'Equipment'}</option>
                <option value="equipment-type">{isRTL ? 'أنواع المعدات' : 'Equipment Types'}</option>
                <option value="chat">{isRTL ? 'المحادثات' : 'Chat'}</option>
                <option value="profile">{isRTL ? 'الملفات الشخصية' : 'Profiles'}</option>
                <option value="dispute">{isRTL ? 'النزاعات' : 'Disputes'}</option>
              </select>
            </div>

            {/* Media Type Filter */}
            <div>
              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value as MediaTypeFilter)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                <option value="image">{isRTL ? 'صور' : 'Images'}</option>
                <option value="video">{isRTL ? 'فيديو' : 'Videos'}</option>
                <option value="pdf">{isRTL ? 'PDF' : 'PDF'}</option>
                <option value="document">{isRTL ? 'مستندات' : 'Documents'}</option>
              </select>
            </div>

            {/* Group By Context Toggle + Refresh */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={groupByContext}
                  onChange={(e) => setGroupByContext(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                {isRTL ? 'تجميع' : 'Group'}
              </label>
              <Button 
                onClick={() => fetchMedia(1, false)}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                disabled={loading}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-500" />
            <span className="text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Media Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
            <FontAwesomeIcon icon={faImage} className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {isRTL ? 'لا توجد وسائط' : 'No media found'}
            </h3>
            <p className="text-gray-500">
              {isRTL ? 'لا توجد ملفات تطابق المعايير المحددة' : 'No files match the current filters'}
            </p>
          </div>
        ) : (
          <>
            {/* Media Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-4">
                        <button
                          onClick={handleSelectAll}
                          className="text-white hover:text-purple-400 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={selectedMedia.length === filteredMedia.filter(m => m.status === MediaStatus.PENDING || m.status === MediaStatus.FLAGGED).length && selectedMedia.length > 0 ? faCheckSquare : faSquare}
                            className="h-4 w-4"
                          />
                        </button>
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'معاينة' : 'Preview'}
                      </th>
                      <th
                        className={cn('px-6 py-4 text-white font-semibold cursor-pointer hover:bg-gray-600', isRTL ? 'text-right' : 'text-left')}
                        onClick={() => handleSort('originalName')}
                      >
                        <div className="flex items-center gap-2">
                          <span>{isRTL ? 'اسم الملف' : 'Filename'}</span>
                          <FontAwesomeIcon icon={getSortIcon('originalName')} className="h-3 w-3" />
                        </div>
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'المستخدم' : 'User'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'السياق' : 'Context'}
                      </th>
                      <th
                        className={cn('px-6 py-4 text-white font-semibold cursor-pointer hover:bg-gray-600', isRTL ? 'text-right' : 'text-left')}
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-2">
                          <span>{isRTL ? 'تاريخ الرفع' : 'Upload Date'}</span>
                          <FontAwesomeIcon icon={getSortIcon('createdAt')} className="h-3 w-3" />
                        </div>
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'تصنيف آلي' : 'Auto Labels'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredMedia.map((media) => (
                      <tr
                        key={media.id}
                        className={cn(
                          'hover:bg-gray-700 transition-colors',
                          media.status === MediaStatus.FLAGGED && 'bg-orange-900/10 border-orange-500/30',
                          processingIds.has(media.id) && 'opacity-50'
                        )}
                      >
                        <td className="px-4 py-4">
                          {(media.status === MediaStatus.PENDING || media.status === MediaStatus.FLAGGED) && (
                            <button
                              onClick={() => handleSelectMedia(media.id)}
                              className="text-white hover:text-purple-400 transition-colors"
                              disabled={processingIds.has(media.id)}
                            >
                              <FontAwesomeIcon
                                icon={selectedMedia.includes(media.id) ? faCheckSquare : faSquare}
                                className="h-4 w-4"
                              />
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handlePreviewMedia(media)}
                            className="relative group"
                          >
                            {media.mediaType === MediaType.IMAGE ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700">
                                <img
                                  src={media.thumbnailUrl || media.url}
                                  alt={media.originalName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Use a simple gray placeholder as data URI
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext fill="%239CA3AF" font-family="Arial" font-size="12" x="50" y="55" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                  <FontAwesomeIcon icon={faExpand} className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
                                <FontAwesomeIcon icon={getMediaTypeIcon(media.mediaType)} className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-white truncate max-w-[200px]" title={media.originalName}>
                              {media.originalName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {getMediaTypeLabel(media.mediaType)} • {formatFileSize(media.size)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {media.user ? (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{media.user.name}</p>
                                <p className="text-sm text-gray-400">{media.user.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getContextLabel(media.context).icon}</span>
                            <div>
                              <p className="text-white text-sm">{getContextLabel(media.context).label}</p>
                              {media.contextId && (
                                <p className="text-gray-500 text-xs font-mono truncate max-w-[120px]" title={media.contextId}>
                                  {media.contextId.slice(0, 8)}...
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">{formatDate(media.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(media.status, media.moderationScore)}
                        </td>
                        <td className="px-6 py-4">
                          {renderModerationLabels(media.moderationLabels)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreviewMedia(media)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded transition-colors"
                              title={isRTL ? 'معاينة' : 'Preview'}
                            >
                              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            </button>

                            {(media.status === MediaStatus.PENDING || media.status === MediaStatus.FLAGGED) && (
                              <>
                                <button
                                  onClick={() => handleApproveMedia(media)}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
                                  title={isRTL ? 'قبول' : 'Approve'}
                                  disabled={processingIds.has(media.id)}
                                >
                                  {processingIds.has(media.id) ? (
                                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRejectMedia(media)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
                                  title={isRTL ? 'رفض' : 'Reject'}
                                  disabled={processingIds.has(media.id)}
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
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="py-4">
              {loadingMore ? (
                <div className="flex justify-center items-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                  <span className={`text-gray-400 text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
                    {isRTL ? 'جاري تحميل المزيد...' : 'Loading more...'}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-400 text-center">
                  {hasMore 
                    ? (isRTL ? 'قم بالتمرير لتحميل المزيد' : 'Scroll to load more')
                    : (isRTL 
                        ? `تم عرض ${mediaFiles.length} من ${totalCount} ملف` 
                        : `Showing ${mediaFiles.length} of ${totalCount} files`)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && currentMedia && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={isRTL ? 'معاينة الملف' : 'File Preview'}
          size="xl"
        >
          <div className="space-y-6">
            {/* Media Preview */}
            <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
              {currentMedia.mediaType === MediaType.IMAGE ? (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.originalName}
                  className="max-w-full max-h-[500px] object-contain rounded-lg"
                />
              ) : currentMedia.mediaType === MediaType.VIDEO ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="max-w-full max-h-[500px] rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon icon={getMediaTypeIcon(currentMedia.mediaType)} className="h-20 w-20 text-gray-500 mb-4" />
                  <p className="text-gray-400">{currentMedia.originalName}</p>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">{isRTL ? 'اسم الملف:' : 'Filename:'}</span>
                  <p className="text-gray-900">{currentMedia.originalName}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">{isRTL ? 'النوع:' : 'Type:'}</span>
                  <p className="text-gray-900">{getMediaTypeLabel(currentMedia.mediaType)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">{isRTL ? 'الحجم:' : 'Size:'}</span>
                  <p className="text-gray-900">{formatFileSize(currentMedia.size)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">{isRTL ? 'تاريخ الرفع:' : 'Upload Date:'}</span>
                  <p className="text-gray-900">{formatDate(currentMedia.createdAt)}</p>
                </div>
                {currentMedia.user && (
                  <div className="col-span-2">
                    <span className="font-semibold text-gray-700">{isRTL ? 'المستخدم:' : 'User:'}</span>
                    <p className="text-gray-900">{currentMedia.user.name} ({currentMedia.user.email})</p>
                  </div>
                )}
              </div>
            </div>

            {/* Moderation Info */}
            {(currentMedia.moderationScore !== undefined || currentMedia.moderationLabels?.length) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faRobot} className="h-4 w-4" />
                  {isRTL ? 'نتائج التصنيف الآلي' : 'Auto-Moderation Results'}
                </h4>
                {currentMedia.moderationScore !== undefined && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-800">{isRTL ? 'درجة الثقة:' : 'Confidence Score:'}</span>
                    <span className={cn('font-bold', getModerationScoreColor(currentMedia.moderationScore))}>
                      {currentMedia.moderationScore.toFixed(1)}%
                    </span>
                  </div>
                )}
                {currentMedia.moderationLabels && currentMedia.moderationLabels.length > 0 && (
                  <div>
                    <span className="text-blue-800">{isRTL ? 'التصنيفات:' : 'Labels:'}</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentMedia.moderationLabels.map((label, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            'px-3 py-1 rounded-full text-sm',
                            label.confidence >= 90 ? 'bg-red-100 text-red-800' :
                            label.confidence >= 70 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          )}
                        >
                          {label.name}: {label.confidence.toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Reason */}
            {currentMedia.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">
                  {isRTL ? 'سبب الرفض:' : 'Rejection Reason:'}
                </h4>
                <p className="text-red-800">{currentMedia.rejectionReason}</p>
              </div>
            )}

            {/* Actions */}
            {(currentMedia.status === MediaStatus.PENDING || currentMedia.status === MediaStatus.FLAGGED) && (
              <div className={cn('flex justify-end gap-3 pt-4 border-t', isRTL && 'space-x-reverse')}>
                <Button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleRejectMedia(currentMedia);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <FontAwesomeIcon icon={faTimes} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'رفض' : 'Reject'}
                </Button>
                <Button
                  onClick={() => {
                    handleApproveMedia(currentMedia);
                    setShowPreviewModal(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <FontAwesomeIcon icon={faCheck} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'قبول' : 'Approve'}
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={isRTL ? 'رفض الملف' : 'Reject Media'}
          size="md"
        >
          <div className="space-y-4">
            {currentMedia ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">{isRTL ? 'الملف:' : 'File:'}</span>
                  <span className={`text-gray-900 ${isRTL ? 'ml-2' : 'mr-2'}`}>{currentMedia.originalName}</span>
                </div>
                {currentMedia.user && (
                  <div className="text-sm mt-1">
                    <span className="font-semibold text-gray-700">{isRTL ? 'المستخدم:' : 'User:'}</span>
                    <span className={`text-gray-900 ${isRTL ? 'ml-2' : 'mr-2'}`}>{currentMedia.user.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-700">
                  {isRTL 
                    ? `سيتم رفض ${selectedMedia.length} ملف` 
                    : `${selectedMedia.length} files will be rejected`}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? 'اختر سبب سريع:' : 'Quick Reason:'}
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{isRTL ? 'اختر سبب...' : 'Select a reason...'}</option>
                {Object.entries(REJECTION_REASON_PRESETS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {isRTL ? value.ar : value.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? 'سبب الرفض:' : 'Rejection Reason:'}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={isRTL ? 'اكتب سبب رفض هذا الملف...' : 'Enter the reason for rejecting this media...'}
              />
            </div>

            <div className={cn('flex justify-end gap-3 pt-4', isRTL && 'space-x-reverse')}>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={currentMedia ? submitRejection : submitBulkRejection}
                disabled={!rejectionReason.trim() && !selectedPreset}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTimes} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {currentMedia 
                  ? (isRTL ? 'رفض الملف' : 'Reject Media')
                  : (isRTL ? `رفض ${selectedMedia.length} ملف` : `Reject ${selectedMedia.length} Files`)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MediaModeration;

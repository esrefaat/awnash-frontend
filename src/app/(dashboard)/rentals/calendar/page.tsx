'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/Button';
import {
  faCalendarAlt,
  faChevronLeft,
  faChevronRight,
  faCalendarDay,
  faFilter,
  faTimes,
  faCalendarCheck,
  faFileAlt,
  faBullhorn,
  faBox,
  faUser,
  faMapMarkerAlt,
  faEye,
  faEdit,
  faCheck,
  faClock,
  faCalendarPlus,
  faExclamationTriangle,
  faUsers,
  faPhone,
  faEnvelope,
  faIdCard,
  faTools,
  faCog,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

// Calendar event interfaces
interface CalendarEvent {
  id: string;
  title: string;
  type: 'booking' | 'return' | 'document' | 'campaign';
  date: string;
  endDate?: string;
  description: string;
  metadata: BookingEvent | ReturnEvent | DocumentEvent | CampaignEvent;
}

interface BookingEvent {
  bookingId: string;
  equipmentName: string;
  equipmentType: string;
  renterName: string;
  renterId: string;
  duration: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  amount: number;
}

interface ReturnEvent {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  ownerName: string;
  ownerId: string;
  renterName: string;
  location: string;
  isOverdue: boolean;
}

interface DocumentEvent {
  documentId: string;
  documentType: string;
  ownerName: string;
  ownerId: string;
  expirationDate: string;
  status: 'expiring' | 'expired' | 'renewed';
  daysUntilExpiry: number;
}

interface CampaignEvent {
  campaignId: string;
  campaignName: string;
  channels: string[];
  targetAudience: number;
  status: 'scheduled' | 'sent' | 'failed';
  createdBy: string;
}

type ViewMode = 'month' | 'week' | 'day';

const OperationalCalendar: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filters, setFilters] = useState({
    eventTypes: {
      booking: true,
      return: true,
      document: true,
      campaign: true
    },
    city: '',
    equipmentType: '',
    role: ''
  });

  // Mock events data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Excavator Booking - Ahmed Al-Rashid',
      type: 'booking',
      date: '2024-01-15T09:00:00Z',
      endDate: '2024-01-17T18:00:00Z',
      description: 'Heavy excavator rental for construction project',
      metadata: {
        bookingId: 'BK-2024-001',
        equipmentName: 'CAT 320D Excavator',
        equipmentType: 'excavator',
        renterName: 'Ahmed Al-Rashid',
        renterId: 'USR-001',
        duration: '3 days',
        location: 'Riyadh',
        status: 'confirmed',
        amount: 4500
      } as BookingEvent
    },
    {
      id: '2',
      title: 'Equipment Return Due - Bobcat Loader',
      type: 'return',
      date: '2024-01-16T15:00:00Z',
      description: 'Bobcat skid steer loader return due',
      metadata: {
        equipmentId: 'EQ-001',
        equipmentName: 'Bobcat S570 Skid Steer',
        equipmentType: 'skid-steer',
        ownerName: 'Sarah Equipment Co.',
        ownerId: 'OWN-002',
        renterName: 'Mohammed Construction',
        location: 'Dubai',
        isOverdue: false
      } as ReturnEvent
    },
    {
      id: '3',
      title: 'License Expiring - Fatima Al-Sabah',
      type: 'document',
      date: '2024-01-18T00:00:00Z',
      description: 'Commercial driving license expires in 7 days',
      metadata: {
        documentId: 'DOC-001',
        documentType: 'Commercial Driving License',
        ownerName: 'Fatima Al-Sabah',
        ownerId: 'OWN-003',
        expirationDate: '2024-01-25T00:00:00Z',
        status: 'expiring',
        daysUntilExpiry: 7
      } as DocumentEvent
    },
    {
      id: '4',
      title: 'Weekend Equipment Promotion',
      type: 'campaign',
      date: '2024-01-19T10:00:00Z',
      description: 'Scheduled promotional campaign for weekend equipment rentals',
      metadata: {
        campaignId: 'CAMP-001',
        campaignName: 'Weekend Equipment Special - 20% Off',
        channels: ['push', 'email', 'sms'],
        targetAudience: 2450,
        status: 'scheduled',
        createdBy: 'Marketing Team'
      } as CampaignEvent
    },
    {
      id: '5',
      title: 'Dump Truck Booking - Qatar Construction',
      type: 'booking',
      date: '2024-01-20T08:00:00Z',
      endDate: '2024-01-22T17:00:00Z',
      description: 'Large dump truck rental for highway project',
      metadata: {
        bookingId: 'BK-2024-002',
        equipmentName: 'Volvo A40G Dump Truck',
        equipmentType: 'dump-truck',
        renterName: 'Qatar Construction Ltd.',
        renterId: 'USR-002',
        duration: '3 days',
        location: 'Doha',
        status: 'confirmed',
        amount: 6800
      } as BookingEvent
    },
    {
      id: '6',
      title: 'Insurance Expired - Abdullah Motors',
      type: 'document',
      date: '2024-01-14T00:00:00Z',
      description: 'Equipment insurance has expired',
      metadata: {
        documentId: 'DOC-002',
        documentType: 'Equipment Insurance',
        ownerName: 'Abdullah Motors',
        ownerId: 'OWN-004',
        expirationDate: '2024-01-14T00:00:00Z',
        status: 'expired',
        daysUntilExpiry: -1
      } as DocumentEvent
    }
  ];

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);
    
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const getEventTypeConfig = (type: string) => {
    const configs = {
      booking: { 
        color: 'bg-blue-500', 
        icon: faCalendarCheck, 
        text: isRTL ? 'حجز' : 'Booking',
        bgClass: 'bg-blue-100 border-blue-300',
        textClass: 'text-blue-800'
      },
      return: { 
        color: 'bg-yellow-500', 
        icon: faBox, 
        text: isRTL ? 'إرجاع' : 'Return',
        bgClass: 'bg-yellow-100 border-yellow-300',
        textClass: 'text-yellow-800'
      },
      document: { 
        color: 'bg-red-500', 
        icon: faFileAlt, 
        text: isRTL ? 'وثائق' : 'Document',
        bgClass: 'bg-red-100 border-red-300',
        textClass: 'text-red-800'
      },
      campaign: { 
        color: 'bg-green-500', 
        icon: faBullhorn, 
        text: isRTL ? 'حملة' : 'Campaign',
        bgClass: 'bg-green-100 border-green-300',
        textClass: 'text-green-800'
      }
    };
    return configs[type as keyof typeof configs];
  };

  const isDateInRange = (eventDate: string, currentDate: Date, viewMode: ViewMode) => {
    const eventDay = new Date(eventDate);
    const current = new Date(currentDate);

    switch (viewMode) {
      case 'month':
        return eventDay.getMonth() === current.getMonth() && 
               eventDay.getFullYear() === current.getFullYear();
      case 'week':
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return eventDay >= weekStart && eventDay <= weekEnd;
      case 'day':
        return eventDay.toDateString() === current.toDateString();
      default:
        return false;
    }
  };

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      // Filter by event type
      if (!filters.eventTypes[event.type]) return false;
      
      // Filter by date range based on view mode
      if (!isDateInRange(event.date, currentDate, viewMode)) return false;

      // Filter by city
      if (filters.city) {
        const location = 'location' in event.metadata ? event.metadata.location : '';
        if (!location.toLowerCase().includes(filters.city.toLowerCase())) return false;
      }

      // Filter by equipment type
      if (filters.equipmentType) {
        const equipmentType = 'equipmentType' in event.metadata ? event.metadata.equipmentType : '';
        if (!equipmentType.toLowerCase().includes(filters.equipmentType.toLowerCase())) return false;
      }

      return true;
    });
  }, [mockEvents, filters, currentDate, viewMode]);

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', options);
  };

  const openEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const renderCalendarHeader = () => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Title and Navigation */}
        <div className={cn("flex items-center space-x-4", isRTL && "space-x-reverse")}>
          <h2 className="text-2xl font-bold text-white">
            {formatDate(currentDate)}
          </h2>
          <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigateDate('today')}
            >
              <FontAwesomeIcon icon={faCalendarDay} className={isRTL ? "ml-1" : "mr-1"} />
              {isRTL ? 'اليوم' : 'Today'}
            </Button>
            <Button
              variant="dark"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <FontAwesomeIcon icon={isRTL ? faChevronRight : faChevronLeft} />
            </Button>
            <Button
              variant="dark"
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <FontAwesomeIcon icon={isRTL ? faChevronLeft : faChevronRight} />
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isRTL 
                ? (mode === 'month' ? 'شهر' : mode === 'week' ? 'أسبوع' : 'يوم')
                : mode.charAt(0).toUpperCase() + mode.slice(1)
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faFilter} className={isRTL ? "ml-2" : "mr-2"} />
        {isRTL ? 'المرشحات' : 'Filters'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Event Types */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'أنواع الأحداث' : 'Event Types'}
          </label>
          <div className="space-y-2">
            {Object.entries(filters.eventTypes).map(([type, checked]) => {
              const config = getEventTypeConfig(type);
              return (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setFilters({
                      ...filters,
                      eventTypes: { ...filters.eventTypes, [type]: e.target.checked }
                    })}
                    className={`${isRTL ? 'ml-2' : 'mr-2'} text-blue-600 focus:ring-blue-500`}
                  />
                  <FontAwesomeIcon icon={config.icon} className={`${isRTL ? 'ml-1' : 'mr-1'} ${config.color.replace('bg-', 'text-')}`} />
                  <span className="text-gray-300 text-sm">{config.text}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'المدينة' : 'City'}
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRTL ? 'جميع المدن' : 'All Cities'}</option>
            <option value="riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</option>
            <option value="dubai">{isRTL ? 'دبي' : 'Dubai'}</option>
            <option value="doha">{isRTL ? 'الدوحة' : 'Doha'}</option>
            <option value="kuwait">{isRTL ? 'الكويت' : 'Kuwait'}</option>
          </select>
        </div>

        {/* Equipment Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'نوع المعدة' : 'Equipment Type'}
          </label>
          <select
            value={filters.equipmentType}
            onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRTL ? 'جميع المعدات' : 'All Equipment'}</option>
            <option value="excavator">{isRTL ? 'حفارات' : 'Excavators'}</option>
            <option value="dump-truck">{isRTL ? 'شاحنات قلابة' : 'Dump Trucks'}</option>
            <option value="skid-steer">{isRTL ? 'محملات مدمجة' : 'Skid Steers'}</option>
            <option value="crane">{isRTL ? 'رافعات' : 'Cranes'}</option>
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'الدور' : 'Role'}
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
            <option value="owner">{isRTL ? 'مالك' : 'Owner'}</option>
            <option value="renter">{isRTL ? 'مستأجر' : 'Renter'}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

    const dayNames = isRTL 
      ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-700">
          {dayNames.map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-300 border-r border-gray-600 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }, (_, index) => {
            const dayNumber = index - firstDay + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
            const dayEvents = isCurrentMonth ? getEventsForDate(cellDate) : [];
            const isToday = isCurrentMonth && cellDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-600 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-750' : 'bg-gray-800'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                {isCurrentMonth && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                      {dayNumber}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const config = getEventTypeConfig(event.type);
                        return (
                          <div
                            key={event.id}
                            onClick={() => openEventModal(event)}
                            className={`p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${config.bgClass} ${config.textClass} border`}
                          >
                            <FontAwesomeIcon icon={config.icon} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />  
                            {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-400 pl-1">
                          +{dayEvents.length - 3} {isRTL ? 'المزيد' : 'more'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventModal = () => {
    if (!selectedEvent || !showEventModal) return null;

    const config = getEventTypeConfig(selectedEvent.type);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon icon={config.icon} className={`${isRTL ? 'ml-3' : 'mr-3'} ${config.color.replace('bg-', 'text-')}`} />  
              <h2 className="text-xl font-bold text-white">
                {selectedEvent.title}
              </h2>
            </div>
            <button
              onClick={() => setShowEventModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Event Details based on type */}
            {selectedEvent.type === 'booking' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'رقم الحجز:' : 'Booking ID:'}</span>
                    <div className="text-white">{(selectedEvent.metadata as BookingEvent).bookingId}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'المبلغ:' : 'Amount:'}</span>
                    <div className="text-white">${(selectedEvent.metadata as BookingEvent).amount}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'المعدة:' : 'Equipment:'}</span>
                    <div className="text-white">{(selectedEvent.metadata as BookingEvent).equipmentName}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'المدة:' : 'Duration:'}</span>
                    <div className="text-white">{(selectedEvent.metadata as BookingEvent).duration}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'المستأجر:' : 'Renter:'}</span>
                    <div className="text-white">{(selectedEvent.metadata as BookingEvent).renterName}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'الموقع:' : 'Location:'}</span>
                    <div className="text-white">{(selectedEvent.metadata as BookingEvent).location}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedEvent.type === 'document' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'نوع الوثيقة:' : 'Document Type:'}</span>
                    <div className="text-white">{(selectedEvent.metadata as DocumentEvent).documentType}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'المالك:' : 'Owner:'}</span>
                    <div className="text-white">{(selectedEvent.metadata as DocumentEvent).ownerName}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'تاريخ الانتهاء:' : 'Expiry Date:'}</span>
                    <div className="text-white">
                      {new Date((selectedEvent.metadata as DocumentEvent).expirationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">{isRTL ? 'الحالة:' : 'Status:'}</span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      (selectedEvent.metadata as DocumentEvent).status === 'expired' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(selectedEvent.metadata as DocumentEvent).status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className={cn("flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700", isRTL && "space-x-reverse")}>
              <Button variant="success">
                <FontAwesomeIcon icon={faEye} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />  
                {isRTL ? 'عرض التفاصيل' : 'View Details'}
              </Button>
              <Button variant="accent">
                <FontAwesomeIcon icon={faEdit} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />  
                {isRTL ? 'تعديل' : 'Edit'}
              </Button>
              {selectedEvent.type === 'document' && (
                <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <FontAwesomeIcon icon={faCheck} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />  
                  {isRTL ? 'تم المراجعة' : 'Mark Reviewed'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className={`${isRTL ? 'ml-3' : 'mr-3'} text-blue-400`} />  
            {isRTL ? 'التقويم التشغيلي' : 'Operational Calendar'}
          </h1>
          <p className="text-gray-400">
            {isRTL ? 'تتبع الأحداث التشغيلية والمواعيد المهمة' : 'Track operational events and important dates'}
          </p>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Calendar Header */}
        {renderCalendarHeader()}

        {/* Calendar View */}
        {viewMode === 'month' && renderMonthView()}

        {/* Event Modal */}
        {renderEventModal()}
      </div>
    </div>
  );
};

export default OperationalCalendar; 
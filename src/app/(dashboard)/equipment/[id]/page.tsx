'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEdit,
  faCalendarCheck,
  faMapMarkerAlt,
  faDollarSign,
  faWeight,
  faCog,
  faChartLine,
  faCalendar,
  faUser,
  faPhone,
  faEnvelope,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { equipmentService, Equipment } from '@/services/equipmentService';

interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
}

interface RecentBooking {
  id: string;
  renterName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
}

const EquipmentView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const equipmentId = params.id as string;

  // State
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Load equipment data
  useEffect(() => {
    if (equipmentId) {
      loadEquipmentData();
    }
  }, [equipmentId]);

  const loadEquipmentData = async () => {
    setLoading(true);
    try {
      // Load equipment details
      const equipmentResponse = await equipmentService.getEquipmentById(equipmentId);
      setEquipment(equipmentResponse);

      // Load booking stats (mock data for now)
      setBookingStats({
        totalBookings: 24,
        activeBookings: 2,
        completedBookings: 22,
        totalRevenue: 45600,
        averageRating: 4.7,
        utilizationRate: 78
      });

      // Load recent bookings (mock data for now)
      setRecentBookings([
        {
          id: '1',
          renterName: 'Ahmed Construction Co.',
          startDate: '2024-09-20',
          endDate: '2024-09-25',
          totalAmount: 3500,
          status: 'active'
        },
        {
          id: '2',
          renterName: 'Modern Building Ltd.',
          startDate: '2024-09-10',
          endDate: '2024-09-15',
          totalAmount: 2800,
          status: 'completed'
        },
        {
          id: '3',
          renterName: 'City Infrastructure',
          startDate: '2024-09-01',
          endDate: '2024-09-08',
          totalAmount: 4200,
          status: 'completed'
        }
      ]);
    } catch (error: any) {
      setError(error.message || (isRTL ? 'فشل في تحميل بيانات المعدة' : 'Failed to load equipment data'));
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    // TODO: Implement booking modal or redirect to booking page
    setShowBookingModal(true);
  };

  const handleEdit = () => {
    router.push(`/equipment/edit/${equipmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            {isRTL ? 'العودة' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-6 space-y-6", isRTL && "font-arabic")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              className={cn("w-4 h-4", isRTL ? "ml-2 rotate-180" : "mr-2")} 
            />
            {isRTL ? 'العودة' : 'Back'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {equipment.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isRTL ? 'تفاصيل المعدة والأداء' : 'Equipment Details & Performance'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleBookNow}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FontAwesomeIcon icon={faCalendarCheck} className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'احجز الآن' : 'Book Now'}
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            <FontAwesomeIcon icon={faEdit} className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'تعديل' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Equipment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faCog} className="w-5 h-5 text-blue-500 mr-3" />
                {isRTL ? 'معلومات المعدة' : 'Equipment Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipment Images */}
                <div>
                  {equipment.image_urls && equipment.image_urls.length > 0 ? (
                    <div className="space-y-2">
                      <img
                        src={equipment.image_urls[0]}
                        alt={equipment.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {equipment.image_urls.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {equipment.image_urls.slice(1, 4).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`${equipment.name} ${index + 2}`}
                              className="w-full h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faCog} className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Equipment Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {isRTL ? 'التفاصيل الأساسية' : 'Basic Details'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? 'النوع:' : 'Type:'}</span>
                        <span className="font-medium capitalize">{equipment.equipment_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? 'الحجم:' : 'Size:'}</span>
                        <span className="font-medium capitalize">{equipment.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? 'الموقع:' : 'Location:'}</span>
                        <span className="font-medium flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 mr-1 text-red-500" />
                          {equipment.city}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? 'السعر اليومي:' : 'Daily Rate:'}</span>
                        <span className="font-medium text-green-600">
                          <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3 mr-1" />
                          {equipment.daily_rate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isRTL ? 'الحالة:' : 'Status:'}</span>
                        <Badge className={getStatusColor(equipment.status)}>
                          {equipment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {isRTL ? 'الوصف' : 'Description'}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {equipment.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          {bookingStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-green-500 mr-3" />
                  {isRTL ? 'إحصائيات الأداء' : 'Performance Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{bookingStats.totalBookings}</div>
                    <div className="text-sm text-gray-600">{isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${bookingStats.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{bookingStats.utilizationRate}%</div>
                    <div className="text-sm text-gray-600">{isRTL ? 'معدل الاستخدام' : 'Utilization Rate'}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{bookingStats.averageRating}</div>
                    <div className="text-sm text-gray-600">{isRTL ? 'متوسط التقييم' : 'Average Rating'}</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{bookingStats.activeBookings}</div>
                    <div className="text-sm text-gray-600">{isRTL ? 'الحجوزات النشطة' : 'Active Bookings'}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{bookingStats.completedBookings}</div>
                    <div className="text-sm text-gray-600">{isRTL ? 'الحجوزات المكتملة' : 'Completed'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-orange-500 mr-3" />
                {isRTL ? 'الحجوزات الأخيرة' : 'Recent Bookings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{booking.renterName}</div>
                        <div className="text-sm text-gray-600">
                          {booking.startDate} - {booking.endDate}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${booking.totalAmount}</div>
                      <Badge className={getBookingStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Owner Info & Quick Actions */}
        <div className="space-y-6">
          {/* Owner Information */}
          {equipment.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-purple-500 mr-3" />
                  {isRTL ? 'معلومات المالك' : 'Owner Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{equipment.owner.full_name}</div>
                      <div className="text-sm text-gray-600">{equipment.owner.email}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <Button variant="outline" className="w-full">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                      {isRTL ? 'اتصل بالمالك' : 'Contact Owner'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-green-500 mr-3" />
                {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleBookNow}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="w-4 h-4 mr-2" />
                  {isRTL ? 'احجز الآن' : 'Book Now'}
                </Button>
                <Button variant="outline" className="w-full">
                  <FontAwesomeIcon icon={faBookmark} className="w-4 h-4 mr-2" />
                  {isRTL ? 'إضافة للمفضلة' : 'Add to Favorites'}
                </Button>
                <Button variant="outline" className="w-full">
                  <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 mr-2" />
                  {isRTL ? 'عرض التقارير' : 'View Reports'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-blue-500 mr-3" />
                {isRTL ? 'التوفر' : 'Availability'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  equipment.is_available 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                )}>
                  <FontAwesomeIcon 
                    icon={equipment.is_available ? faCheckCircle : faExclamationTriangle} 
                    className="w-4 h-4 mr-2" 
                  />
                  {equipment.is_available 
                    ? (isRTL ? 'متاح للحجز' : 'Available for Booking')
                    : (isRTL ? 'غير متاح' : 'Not Available')
                  }
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {isRTL 
                    ? 'آخر تحديث: اليوم' 
                    : 'Last updated: Today'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal Placeholder */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {isRTL ? 'حجز المعدة' : 'Book Equipment'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isRTL 
                ? 'سيتم تطوير نموذج الحجز قريباً' 
                : 'Booking form will be implemented soon'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentView;

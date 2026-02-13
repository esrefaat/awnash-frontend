'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/Button';
import {
  faGavel,
  faSearch,
  faFilter,
  faCalendar,
  faEye,
  faUser,
  faBuilding,
  faTruck,
  faExclamationTriangle,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faTimes,
  faDollarSign,
  faBan,
  faEdit,
  faDownload,
  faComment,
  faImage,
  faPaperclip,
  faCalendarAlt,
  faHandshake,
  faWarning
} from '@fortawesome/free-solid-svg-icons';

interface Dispute {
  id: string;
  bookingId: string;
  equipmentName: string;
  equipmentImage: string;
  renterName: string;
  ownerName: string;
  reason: 'damage' | 'late_return' | 'wrong_equipment' | 'other';
  status: 'open' | 'under_review' | 'resolved';
  submissionDate: string;
  description: string;
  attachments: string[];
  raisedBy: 'renter' | 'owner';
  assignedTo?: string;
  deadline?: string;
  resolutionTime?: number;
  refundAmount?: number;
  penaltyAmount?: number;
}

interface DisputeAction {
  id: string;
  disputeId: string;
  adminName: string;
  action: string;
  timestamp: string;
  notes?: string;
}

const DisputesManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [raisedByFilter, setRaisedByFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [penaltyAmount, setPenaltyAmount] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Mock disputes data
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: 'DIS-001',
      bookingId: 'BK-2024-001',
      equipmentName: 'Caterpillar 320D Excavator',
      equipmentImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop',
      renterName: 'Ahmed Construction Co.',
      ownerName: 'Gulf Heavy Equipment',
      reason: 'damage',
      status: 'open',
      submissionDate: '2024-06-15',
      description: 'The excavator was returned with hydraulic fluid leaking from the main arm. This was not present during pickup inspection.',
      attachments: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop'],
      raisedBy: 'owner',
      deadline: '2024-06-18',
      assignedTo: 'Sarah Mohammed'
    },
    {
      id: 'DIS-002',
      bookingId: 'BK-2024-002',
      equipmentName: 'Liebherr LTM 1095-5.1 Crane',
      equipmentImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
      renterName: 'Skyline Projects',
      ownerName: 'Advanced Lifting Solutions',
      reason: 'late_return',
      status: 'under_review',
      submissionDate: '2024-06-14',
      description: 'Equipment was returned 3 days late due to project delays. Owner is claiming additional costs.',
      attachments: [],
      raisedBy: 'renter',
      assignedTo: 'Omar Abdullah',
      deadline: '2024-06-17'
    },
    {
      id: 'DIS-003',
      bookingId: 'BK-2024-003',
      equipmentName: 'Komatsu D65PX Bulldozer',
      equipmentImage: 'https://images.unsplash.com/photo-1459664018906-085c36f472af?w=100&h=100&fit=crop',
      renterName: 'Desert Infrastructure',
      ownerName: 'Heavy Machinery Rentals',
      reason: 'wrong_equipment',
      status: 'resolved',
      submissionDate: '2024-06-10',
      description: 'Received D55 model instead of D65 as booked. Project requirements were not met.',
      attachments: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop'],
      raisedBy: 'renter',
      resolutionTime: 48,
      refundAmount: 5000,
      penaltyAmount: 0
    }
  ]);

  // Mock action log
  const disputeActions: DisputeAction[] = [
    {
      id: 'ACT-001',
      disputeId: 'DIS-001',
      adminName: 'Sarah Mohammed',
      action: 'Dispute assigned for review',
      timestamp: '2024-06-15 10:30',
      notes: 'Initial assessment required'
    },
    {
      id: 'ACT-002',
      disputeId: 'DIS-003',
      adminName: 'Omar Abdullah',
      action: 'Partial refund issued',
      timestamp: '2024-06-12 14:15',
      notes: 'SAR 5,000 refunded to renter for equipment mismatch'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      damage: isRTL ? 'ضرر' : 'Damage',
      late_return: isRTL ? 'تأخير الإرجاع' : 'Late Return',
      wrong_equipment: isRTL ? 'معدة خاطئة' : 'Wrong Equipment',
      other: isRTL ? 'أخرى' : 'Other'
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  const getRaisedByIcon = (raisedBy: string) => {
    return raisedBy === 'owner' ? faBuilding : faUser;
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.renterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesRaisedBy = raisedByFilter === 'all' || dispute.raisedBy === raisedByFilter;
    const matchesReason = reasonFilter === 'all' || dispute.reason === reasonFilter;
    
    return matchesSearch && matchesStatus && matchesRaisedBy && matchesReason;
  });

  const handleResolveDispute = () => {
    if (selectedDispute) {
      setDisputes(disputes.map(d => 
        d.id === selectedDispute.id 
          ? { ...d, status: 'resolved', refundAmount: parseFloat(refundAmount) || 0, penaltyAmount: parseFloat(penaltyAmount) || 0 }
          : d
      ));
      setSelectedDispute(null);
      setRefundAmount('');
      setPenaltyAmount('');
      setAdminNotes('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, icon, bgColor, textColor }: any) => (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className={`text-3xl font-bold mb-2 ${textColor}`}>{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${bgColor}`}>
          <FontAwesomeIcon icon={icon} className="h-8 w-8 text-foreground" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isRTL ? 'مركز النزاعات' : 'Dispute Center'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة النزاعات المثارة من المستأجرين والمالكين' : 'Handle disputes raised by renters and owners'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title={isRTL ? "النزاعات المفتوحة" : "Open Disputes"}
            value={disputes.filter(d => d.status === 'open').length}
            subtitle={isRTL ? "تحتاج مراجعة" : "Need Review"}
            icon={faExclamationTriangle}
            bgColor="bg-red-600"
            textColor="text-red-400"
          />
          <StatCard
            title={isRTL ? "تحت المراجعة" : "Under Review"}
            value={disputes.filter(d => d.status === 'under_review').length}
            subtitle={isRTL ? "قيد المعالجة" : "In Progress"}
            icon={faClock}
            bgColor="bg-yellow-600"
            textColor="text-yellow-400"
          />
          <StatCard
            title={isRTL ? "تم الحل" : "Resolved"}
            value={disputes.filter(d => d.status === 'resolved').length}
            subtitle={isRTL ? "هذا الشهر" : "This Month"}
            icon={faCheckCircle}
            bgColor="bg-green-600"
            textColor="text-green-400"
          />
          <StatCard
            title={isRTL ? "متوسط وقت الحل" : "Avg Resolution"}
            value={`48h`}
            subtitle={isRTL ? "الوقت المستغرق" : "Time Taken"}
            icon={faGavel}
            bgColor="bg-blue-600"
            textColor="text-blue-400"
          />
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'البحث' : 'Search'}
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث برقم الحجز أو اسم المستخدم...' : 'Search by booking ID or user name...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'الحالة' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="open">{isRTL ? 'مفتوح' : 'Open'}</option>
                <option value="under_review">{isRTL ? 'تحت المراجعة' : 'Under Review'}</option>
                <option value="resolved">{isRTL ? 'تم الحل' : 'Resolved'}</option>
              </select>
            </div>

            {/* Raised By Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'مُثار من' : 'Raised By'}
              </label>
              <select
                value={raisedByFilter}
                onChange={(e) => setRaisedByFilter(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'الجميع' : 'All'}</option>
                <option value="owner">{isRTL ? 'المالك' : 'Owner'}</option>
                <option value="renter">{isRTL ? 'المستأجر' : 'Renter'}</option>
              </select>
            </div>

            {/* Reason Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'السبب' : 'Reason'}
              </label>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الأسباب' : 'All Reasons'}</option>
                <option value="damage">{isRTL ? 'ضرر' : 'Damage'}</option>
                <option value="late_return">{isRTL ? 'تأخير الإرجاع' : 'Late Return'}</option>
                <option value="wrong_equipment">{isRTL ? 'معدة خاطئة' : 'Wrong Equipment'}</option>
                <option value="other">{isRTL ? 'أخرى' : 'Other'}</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'من تاريخ' : 'Date From'}
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">
              {isRTL ? 'جدول النزاعات' : 'Disputes Table'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'رقم النزاع' : 'Dispute ID'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المعدة' : 'Equipment'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الأطراف' : 'Parties'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'السبب' : 'Reason'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'تاريخ الإرسال' : 'Submitted'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FontAwesomeIcon 
                          icon={getRaisedByIcon(dispute.raisedBy)} 
                          className={`h-4 w-4 text-blue-400 ${isRTL ? 'ml-2' : 'mr-2'}`}  
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground">{dispute.id}</div>
                          <div className="text-xs text-blue-400 cursor-pointer hover:underline">
                            {dispute.bookingId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={dispute.equipmentImage} 
                          alt={dispute.equipmentName}
                          className={`h-12 w-12 rounded-lg object-cover ${isRTL ? 'ml-3' : 'mr-3'}`}  
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground truncate max-w-32">
                            {dispute.equipmentName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div>
                        <div className="font-medium">{dispute.renterName}</div>
                        <div className="text-xs text-muted-foreground">vs {dispute.ownerName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-600 text-foreground rounded-full text-xs font-medium">
                        {getReasonLabel(dispute.reason)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status === 'open' && (isRTL ? 'مفتوح' : 'Open')}
                        {dispute.status === 'under_review' && (isRTL ? 'تحت المراجعة' : 'Under Review')}
                        {dispute.status === 'resolved' && (isRTL ? 'تم الحل' : 'Resolved')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(dispute.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        <FontAwesomeIcon icon={faEye} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                        {isRTL ? 'مراجعة' : 'Review'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispute Detail Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {isRTL ? 'تفاصيل النزاع' : 'Dispute Details'} - {selectedDispute.id}
                </h2>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Dispute Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {isRTL ? 'ملخص النزاع' : 'Dispute Summary'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isRTL ? 'رقم الحجز:' : 'Booking ID:'}</span>
                        <span className="text-blue-400 font-medium">{selectedDispute.bookingId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isRTL ? 'مُثار من:' : 'Raised by:'}</span>
                        <span className="text-foreground">
                          {selectedDispute.raisedBy === 'owner' ? selectedDispute.ownerName : selectedDispute.renterName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isRTL ? 'المهلة الزمنية:' : 'Deadline:'}</span>
                        <span className={`font-medium ${selectedDispute.deadline && new Date(selectedDispute.deadline) < new Date() ? 'text-red-400' : 'text-yellow-400'}`}>
                          {selectedDispute.deadline ? new Date(selectedDispute.deadline).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {isRTL ? 'تفاصيل المعدة' : 'Equipment Details'}
                    </h3>
                    <div className={cn("flex items-center space-x-4", isRTL && "space-x-reverse")}>
                      <img 
                        src={selectedDispute.equipmentImage} 
                        alt={selectedDispute.equipmentName}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground">{selectedDispute.equipmentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'السبب:' : 'Reason:'} {getReasonLabel(selectedDispute.reason)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {isRTL ? 'وصف النزاع' : 'Dispute Description'}
                  </h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground">{selectedDispute.description}</p>
                  </div>
                </div>

                {/* Attachments */}
                {selectedDispute.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {isRTL ? 'المرفقات' : 'Attachments'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedDispute.attachments.map((attachment, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={attachment} 
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <button className="absolute top-2 right-2 bg-black bg-opacity-50 text-foreground p-1 rounded">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {isRTL ? 'إجراءات الإدارة' : 'Admin Actions'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Financial Actions */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-muted-foreground">
                        {isRTL ? 'الإجراءات المالية' : 'Financial Actions'}
                      </h4>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          {isRTL ? 'مبلغ الاسترداد (ريال سعودي)' : 'Refund Amount (SAR)'}
                        </label>
                        <input
                          type="number"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          {isRTL ? 'مبلغ الغرامة (ريال سعودي)' : 'Penalty Amount (SAR)'}
                        </label>
                        <input
                          type="number"
                          value={penaltyAmount}
                          onChange={(e) => setPenaltyAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Administrative Actions */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-muted-foreground">
                        {isRTL ? 'ملاحظات الإدارة' : 'Admin Notes'}
                      </h4>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                        placeholder={isRTL ? 'أضف ملاحظات داخلية...' : 'Add internal notes...'}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                      variant="success"
                      onClick={handleResolveDispute}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                      {isRTL ? 'حل النزاع' : 'Resolve Dispute'}
                    </Button>
                    <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-foreground">
                      <FontAwesomeIcon icon={faUser} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                      {isRTL ? 'إسناد للمراجع' : 'Assign Reviewer'}
                    </Button>
                    <Button variant="destructive">
                      <FontAwesomeIcon icon={faBan} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                      {isRTL ? 'حظر المستخدم' : 'Ban User'}
                    </Button>
                    <Button variant="accent">
                      <FontAwesomeIcon icon={faFileAlt} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                      {isRTL ? 'إعادة تحقق من الوثائق' : 'Re-verify Documents'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DisputesManagement;
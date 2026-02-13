'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faChartLine,
  faDollarSign,
  faStar,
  faUserCheck,
  faUserShield,
  faUserTie,
  faUserCog,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usersService } from '@/services/usersService';
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle';

// Types for stats
interface UserStats {
  total: number;
  active: number;
  verified: number;
  admins: number;
  owners: number;
  renters: number;
  hybrid: number;
}

const UsersAnalytics: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { contentStyle, labelStyle, itemStyle } = useChartTooltipStyle();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await usersService.getUserStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user stats:', err);
        setError('Failed to load statistics');
        // Use fallback data
        setStats({
          total: 0,
          active: 0,
          verified: 0,
          admins: 0,
          owners: 0,
          renters: 0,
          hybrid: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Chart data derived from stats
  const userRoleData = stats ? [
    { name: isRTL ? 'مستأجرون' : 'Renters', value: stats.renters, color: '#3B82F6' },
    { name: isRTL ? 'مالكو معدات' : 'Owners', value: stats.owners, color: '#10B981' },
    { name: isRTL ? 'هجين' : 'Hybrid', value: stats.hybrid, color: '#F59E0B' },
    { name: isRTL ? 'مشرفون' : 'Admins', value: stats.admins, color: '#EF4444' }
  ] : [];

  // Mock data for growth chart (would come from API in production)
  const userGrowthData = [
    { month: isRTL ? 'يوليو' : 'Jul', users: 120 },
    { month: isRTL ? 'أغسطس' : 'Aug', users: 145 },
    { month: isRTL ? 'سبتمبر' : 'Sep', users: 189 },
    { month: isRTL ? 'أكتوبر' : 'Oct', users: 234 },
    { month: isRTL ? 'نوفمبر' : 'Nov', users: 298 },
    { month: isRTL ? 'ديسمبر' : 'Dec', users: 356 },
    { month: isRTL ? 'يناير' : 'Jan', users: stats?.total || 412 }
  ];

  // Mock data for activity chart (would come from API in production)
  const activityData = [
    { hour: '00', logins: 5 },
    { hour: '04', logins: 8 },
    { hour: '08', logins: 45 },
    { hour: '12', logins: 78 },
    { hour: '16', logins: 92 },
    { hour: '20', logins: 56 }
  ];

  const StatCard = ({ title, value, change, icon, color }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    color: string;
  }) => (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className="text-sm text-emerald-400 mt-1">+{change}% {isRTL ? 'هذا الشهر' : 'this month'}</p>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", color)}>
          <FontAwesomeIcon icon={icon} className="h-6 w-6 text-foreground" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background text-foreground space-y-6 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'تحليلات المستخدمين' : 'User Analytics'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'نظرة شاملة على إحصائيات وتفاعل المستخدمين' : 'Overview of user statistics and engagement'}
        </p>
      </div>

      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-yellow-400">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
          value={stats?.total.toLocaleString() || '0'}
          change="15"
          icon={faUsers}
          color="bg-gradient-to-r from-blue-400 to-blue-600"
        />
        <StatCard
          title={isRTL ? 'المستخدمون النشطون' : 'Active Users'}
          value={stats?.active || 0}
          change="8"
          icon={faChartLine}
          color="bg-gradient-to-r from-emerald-400 to-emerald-600"
        />
        <StatCard
          title={isRTL ? 'المستخدمون الموثقون' : 'Verified Users'}
          value={stats?.verified || 0}
          change="12"
          icon={faUserCheck}
          color="bg-gradient-to-r from-purple-400 to-purple-600"
        />
        <StatCard
          title={isRTL ? 'مالكو المعدات' : 'Equipment Owners'}
          value={stats?.owners || 0}
          change="5"
          icon={faUserTie}
          color="bg-gradient-to-r from-orange-400 to-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* User Role Distribution */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {isRTL ? 'توزيع أدوار المستخدمين' : 'User Roles Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={contentStyle} labelStyle={labelStyle} itemStyle={itemStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {userRoleData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className={cn("w-3 h-3 rounded-full", isRTL ? "ml-2" : "mr-2")} 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {isRTL ? 'نمو المستخدمين' : 'User Growth'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={contentStyle} labelStyle={labelStyle} itemStyle={itemStyle} />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Login Activity */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {isRTL ? 'نشاط تسجيل الدخول (24 ساعة)' : 'Login Activity (24h)'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={contentStyle} labelStyle={labelStyle} itemStyle={itemStyle} />
              <Bar 
                dataKey="logins" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
              <FontAwesomeIcon icon={faCrown} className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'المشرفون' : 'Admins'}</p>
              <p className="text-xl font-bold text-foreground">{stats?.admins || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <FontAwesomeIcon icon={faUserTie} className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'مالكو المعدات' : 'Owners'}</p>
              <p className="text-xl font-bold text-foreground">{stats?.owners || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <FontAwesomeIcon icon={faUserCog} className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'المستأجرون' : 'Renters'}</p>
              <p className="text-xl font-bold text-foreground">{stats?.renters || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
              <FontAwesomeIcon icon={faUserShield} className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'هجين' : 'Hybrid'}</p>
              <p className="text-xl font-bold text-foreground">{stats?.hybrid || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersAnalytics;

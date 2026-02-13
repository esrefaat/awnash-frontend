"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { 
  faMapMarkerAlt, 
  faUser,
  faPhone,
  faEnvelope,
  faTruck,
  faCalendarAlt,
  faClock,
  faExclamationTriangle,
  faFlag,
  faCheckCircle,
  faPlus,
  faBell,
  faEye,
  faFilter,
  faSearch,
  faExpand,
  faTimes,
  faBuilding,
  faCogs,
  faStar,
  faComment,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface ActiveRental {
  id: string;
  bookingId: string;
  equipmentName: string;
  equipmentImage: string;
  ownerName: string;
  ownerId: string;
  renterName: string;
  renterId: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };
  rentalPeriod: {
    start: string;
    end: string;
  };
  status: 'active' | 'ending-soon' | 'overdue';
  flagged: boolean;
  flagReason?: string;
  flagNote?: string;
  category: string;
  dailyRate: number;
  totalAmount: number;
  completedAt?: string;
  notes?: string;
}

export default function LiveRentalsMap() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n?.language === 'ar' || false;
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);
  const [selectedRental, setSelectedRental] = useState<ActiveRental | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [showEndingSoon, setShowEndingSoon] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [searchEquipment, setSearchEquipment] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [reminderType, setReminderType] = useState<'driver' | 'owner'>('driver');
  const [extendDuration, setExtendDuration] = useState(1);
  const [zoomToEndingSoon, setZoomToEndingSoon] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [L, setL] = useState<any>(null);

  // Load Leaflet dynamically on client side
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const leaflet = await import('leaflet');
        
        // Fix for default markers in React Leaflet
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        setL(leaflet);
        setLeafletLoaded(true);
      }
    };
    
    loadLeaflet();
  }, []);

  // Custom icons for different rental statuses
  const createCustomIcon = (color: string, flagged: boolean = false) => {
    if (!L) return null;
    
    const iconHtml = `
      <div style="
        width: 30px; 
        height: 30px; 
        background-color: ${color}; 
        border: 3px solid white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ${flagged ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        <i style="color: white; font-size: 12px;" class="fas ${flagged ? 'fa-flag' : 'fa-truck'}"></i>
      </div>
    `;
    
    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  // Mock active rentals data
  const mockActiveRentals: ActiveRental[] = [
    {
      id: '1',
      bookingId: 'BK-2024-001',
      equipmentName: 'CAT D9 Bulldozer',
      equipmentImage: '/api/placeholder/80/60',
      ownerName: 'Ahmed Al-Mansouri',
      ownerId: 'OWN-001',
      renterName: 'Gulf Construction LLC',
      renterId: 'RNT-001',
      driverName: 'Mohammed Hassan',
      driverPhone: '+971-50-123-4567',
      driverEmail: 'mohammed.hassan@email.com',
      location: {
        lat: 25.2048,
        lng: 55.2708,
        address: 'Dubai Marina Construction Site',
        city: 'Dubai'
      },
      rentalPeriod: {
        start: '2024-06-18T08:00:00Z',
        end: '2024-06-25T18:00:00Z'
      },
      status: 'active',
      flagged: false,
      category: 'Bulldozer',
      dailyRate: 2500,
      totalAmount: 17500
    },
    {
      id: '2',
      bookingId: 'BK-2024-002',
      equipmentName: 'Liebherr LTM 1100 Crane',
      equipmentImage: '/api/placeholder/80/60',
      ownerName: 'Fatima Al-Zahra',
      ownerId: 'OWN-002',
      renterName: 'Emirates Tower Development',
      renterId: 'RNT-002',
      driverName: 'Omar Al-Rashid',
      driverPhone: '+971-55-987-6543',
      driverEmail: 'omar.rashid@email.com',
      location: {
        lat: 25.1972,
        lng: 55.2744,
        address: 'Business Bay Development',
        city: 'Dubai'
      },
      rentalPeriod: {
        start: '2024-06-19T06:00:00Z',
        end: '2024-06-21T20:00:00Z'
      },
      status: 'ending-soon',
      flagged: true,
      flagReason: 'Equipment damage reported',
      flagNote: 'Minor hydraulic leak detected during daily inspection',
      category: 'Crane',
      dailyRate: 4500,
      totalAmount: 13500
    },
    {
      id: '3',
      bookingId: 'BK-2024-003',
      equipmentName: 'Komatsu D85 Bulldozer',
      equipmentImage: '/api/placeholder/80/60',
      ownerName: 'Omar Al-Sabah',
      ownerId: 'OWN-003',
      renterName: 'Qatar Infrastructure',
      renterId: 'RNT-003',
      driverName: 'Hassan Al-Thani',
      driverPhone: '+974-33-456-7890',
      driverEmail: 'hassan.thani@email.com',
      location: {
        lat: 25.3548,
        lng: 51.1839,
        address: 'Lusail City Development',
        city: 'Doha'
      },
      rentalPeriod: {
        start: '2024-06-15T07:00:00Z',
        end: '2024-06-20T19:00:00Z'
      },
      status: 'overdue',
      flagged: true,
      flagReason: 'Rental period exceeded',
      flagNote: 'Customer requested extension but payment pending',
      category: 'Bulldozer',
      dailyRate: 2200,
      totalAmount: 13200
    }
  ];

  useEffect(() => {
    setActiveRentals(mockActiveRentals);
  }, []);

  // Add custom styles for map markers and drawer z-index
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const mapStyles = `
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          background: white;
          box-shadow: 0 3px 15px rgba(0,0,0,0.2);
          z-index: 1002 !important;
        }
        
        .leaflet-popup-content {
          margin: 8px;
          min-width: 200px;
        }
        
        .leaflet-popup-pane {
          z-index: 1000 !important;
        }
        
        .leaflet-popup {
          z-index: 1001 !important;
        }
        
        .leaflet-popup-tip {
          background: white;
          z-index: 1001 !important;
        }
        
        .leaflet-container {
          z-index: 1 !important;
        }
        
        /* Fix for command drawer appearing behind map */
        [role="dialog"] {
          z-index: 9999 !important;
        }
        
        .fixed.inset-0 {
          z-index: 9998 !important;
        }
        
        /* Dialog overlay */
        .bg-black\\/50, .bg-black\\/80 {
          z-index: 9997 !important;
        }
        
        /* Drawer content */
        .translate-x-0, .translate-x-full {
          z-index: 9999 !important;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = mapStyles;
      document.head.appendChild(styleSheet);

      return () => {
        document.head.removeChild(styleSheet);
      };
    }
  }, []);

  const filteredRentals = activeRentals.filter(rental => {
    if (showFlaggedOnly && !rental.flagged) return false;
    if (showEndingSoon && rental.status !== 'ending-soon') return false;
    if (searchCity && !rental.location.city.toLowerCase().includes(searchCity.toLowerCase())) return false;
    if (searchDriver && !rental.driverName.toLowerCase().includes(searchDriver.toLowerCase())) return false;
    if (searchEquipment && !rental.equipmentName.toLowerCase().includes(searchEquipment.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: ActiveRental['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-500', text: 'Active', textColor: 'text-foreground' },
      'ending-soon': { color: 'bg-yellow-500', text: 'Ending Soon', textColor: 'text-black' },
      overdue: { color: 'bg-red-500', text: 'Overdue', textColor: 'text-foreground' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.color, config.textColor)}>
        {config.text}
      </span>
    );
  };

  const getStatusIcon = (status: ActiveRental['status']) => {
    const icons = {
      active: faCheckCircle,
      'ending-soon': faClock,
      overdue: faExclamationTriangle
    };
    return icons[status];
  };

  const handleMarkerClick = (rental: ActiveRental) => {
    setSelectedRental(rental);
    setDrawerOpen(true);
  };

  const handleSendReminder = async (type: 'driver' | 'owner') => {
    // Mock API call
    setTimeout(() => {
      alert(`Reminder sent to ${type} successfully!`);
    }, 1000);
  };

  const handleFlagBooking = async () => {
    if (!selectedRental || !flagReason) return;
    
    // Mock API call
    setTimeout(() => {
      setActiveRentals(prev => prev.map(rental => 
        rental.id === selectedRental.id 
          ? { ...rental, flagged: true, flagReason, flagNote }
          : rental
      ));
      setFlagReason('');
      setFlagNote('');
      alert('Booking flagged successfully!');
    }, 1000);
  };

  const handleMarkCompleted = async () => {
    if (!selectedRental) return;
    
    setTimeout(() => {
      setActiveRentals(prev => prev.filter(rental => rental.id !== selectedRental.id));
      setDrawerOpen(false);
      alert('Rental marked as completed!');
    }, 1000);
  };

  const handleExtendRental = async () => {
    setTimeout(() => {
      alert(`Rental extended by ${extendDuration} day(s)!`);
    }, 1000);
  };

  const handleZoomToEndingSoon = () => {
    setZoomToEndingSoon(!zoomToEndingSoon);
    setShowEndingSoon(!showEndingSoon);
  };

  if (!leafletLoaded) {
    return (
      <div className="min-h-screen bg-background p-6 font-montserrat" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Live Rental Map</h1>
              <p className="text-muted-foreground mt-1">Real-time tracking of active equipment rentals</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-awnash-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 font-montserrat" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Rental Map</h1>
            <p className="text-muted-foreground mt-1">Real-time tracking of active equipment rentals</p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant={zoomToEndingSoon ? "default" : "dark"}
              onClick={handleZoomToEndingSoon}
              className={zoomToEndingSoon ? "bg-yellow-600 hover:bg-yellow-700 text-black" : ""}
            >
              <FontAwesomeIcon icon={faClock} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              Ending Soon
            </Button>
            
            <Button variant="accent">
              <FontAwesomeIcon icon={faExpand} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
              <label className="text-sm font-medium text-muted-foreground">Filters:</label>
            </div>
            
            <label className={cn("flex items-center space-x-2 cursor-pointer", isRTL && "space-x-reverse")}>
              <input
                type="checkbox"
                checked={showFlaggedOnly}
                onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                className="rounded border-border bg-muted text-awnash-primary focus:ring-awnash-primary"
              />
              <span className="text-sm text-muted-foreground">Flagged Only</span>
            </label>

            <div className="flex gap-2">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
                />
              </div>
              
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by driver..."
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
                />
              </div>
              
              <div className="relative">
                <FontAwesomeIcon icon={faTruck} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by equipment..."
                  value={searchEquipment}
                  onChange={(e) => setSearchEquipment(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredRentals.length} of {activeRentals.length} active rentals
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
          <div className="h-[70vh] relative">
            {leafletLoaded && (
              <MapContainer
                center={[25.2048, 55.2708]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {filteredRentals.map((rental) => {
                  const getMarkerColor = (status: string) => {
                    switch (status) {
                      case 'active': return '#10B981';
                      case 'ending-soon': return '#F59E0B';
                      case 'overdue': return '#EF4444';
                      default: return '#6B7280';
                    }
                  };

                  return (
                    <Marker
                      key={rental.id}
                      position={[rental.location.lat, rental.location.lng]}
                      icon={createCustomIcon(getMarkerColor(rental.status), rental.flagged)}
                      eventHandlers={{
                        click: () => handleMarkerClick(rental),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <img 
                              src={rental.equipmentImage} 
                              alt={rental.equipmentName}
                              className="w-12 h-8 object-cover rounded"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{rental.equipmentName}</h3>
                              <p className="text-xs text-gray-600">{rental.bookingId}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-700">{rental.driverName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-700">{rental.location.address}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              {getStatusBadge(rental.status)}
                              {rental.flagged && (
                                <FontAwesomeIcon icon={faFlag} className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            variant="accent"
                            size="sm"
                            onClick={() => handleMarkerClick(rental)}
                            className="w-full mt-2"
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Command Drawer */}
        <div 
          className={cn(
            "fixed inset-y-0 right-0 z-[9999] w-96 bg-card border-l border-border shadow-xl transform transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {selectedRental && (
            <div className="p-6 h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Rental Control</h2>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Equipment Info */}
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={selectedRental.equipmentImage} 
                    alt={selectedRental.equipmentName}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedRental.equipmentName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRental.bookingId}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedRental.status)}
                  {selectedRental.flagged && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faFlag} className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-400">Flagged</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver & Owner Info */}
              <div className="space-y-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                    Driver Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{selectedRental.driverName}</p>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{selectedRental.driverPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{selectedRental.driverEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} className="h-4 w-4" />
                    Owner & Renter
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Owner:</p>
                      <p className="text-muted-foreground">{selectedRental.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Renter:</p>
                      <p className="text-muted-foreground">{selectedRental.renterName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-muted rounded-lg p-4 mb-6">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4" />
                  Current Location
                </h4>
                <div className="text-sm">
                  <p className="text-muted-foreground">{selectedRental.location.address}</p>
                  <p className="text-muted-foreground">{selectedRental.location.city}</p>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-muted rounded-lg p-4 mb-6">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4" />
                  Rental Period
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start:</p>
                    <p className="text-muted-foreground">{new Date(selectedRental.rentalPeriod.start).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End:</p>
                    <p className="text-muted-foreground">{new Date(selectedRental.rentalPeriod.end).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Daily Rate:</p>
                    <p className="text-muted-foreground">SAR {selectedRental.dailyRate.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Flag Rental Section */}
              {!selectedRental.flagged && (
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFlag} className="h-4 w-4" />
                    Flag Rental
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Reason</label>
                      <select
                        value={flagReason}
                        onChange={(e) => setFlagReason(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
                      >
                        <option value="">Select reason...</option>
                        <option value="Equipment damage">Equipment damage</option>
                        <option value="Late return">Late return</option>
                        <option value="Payment issue">Payment issue</option>
                        <option value="Safety concern">Safety concern</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Note</label>
                      <textarea
                        value={flagNote}
                        onChange={(e) => setFlagNote(e.target.value)}
                        placeholder="Additional details..."
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
                      />
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={handleFlagBooking}
                      disabled={!flagReason}
                      className="w-full"
                    >
                      Flag Rental
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    variant="accent"
                    onClick={() => handleSendReminder('driver')}
                    className="flex-1 justify-center"
                  >
                    <FontAwesomeIcon icon={faBell} className="h-4 w-4 mr-2" />
                    Remind Driver
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handleSendReminder('owner')}
                    className="flex-1 justify-center bg-purple-600 hover:bg-purple-700"
                  >
                    <FontAwesomeIcon icon={faBell} className="h-4 w-4 mr-2" />
                    Remind Owner
                  </Button>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">Extend Rental</h4>
                  <div className="flex gap-2">
                    <select
                      value={extendDuration}
                      onChange={(e) => setExtendDuration(Number(e.target.value))}
                      className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
                    >
                      <option value={1}>1 day</option>
                      <option value={2}>2 days</option>
                      <option value={3}>3 days</option>
                      <option value={7}>1 week</option>
                    </select>
                    <Button 
                      variant="default"
                      onClick={handleExtendRental}
                    >
                      Extend
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="success"
                  onClick={handleMarkCompleted}
                  className="w-full justify-center"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Overlay */}
        {drawerOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faSearch, faTimes, faLocationArrow } from '@fortawesome/free-solid-svg-icons';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location | null;
  isRTL?: boolean;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
  isRTL = false
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [manualLat, setManualLat] = useState(initialLocation?.lat?.toString() || '');
  const [manualLng, setManualLng] = useState(initialLocation?.lng?.toString() || '');
  const [manualAddress, setManualAddress] = useState(initialLocation?.address || '');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  // Default center (Riyadh, Saudi Arabia)
  const defaultCenter: [number, number] = [24.7136, 46.6753];

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError(isRTL ? 'متصفحك لا يدعم تحديد الموقع' : 'Your browser does not support geolocation');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        const location: Location = { lat: latitude, lng: longitude, address };
        setCurrentLocation(location);
        
        // If no location is selected yet, use current location
        if (!selectedLocation) {
          setSelectedLocation(location);
          setManualLat(latitude.toString());
          setManualLng(longitude.toString());
          setManualAddress(address);
        }
      } catch (error) {
        console.error('Error getting address for current location:', error);
        const location: Location = { 
          lat: latitude, 
          lng: longitude, 
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
        };
        setCurrentLocation(location);
        
        if (!selectedLocation) {
          setSelectedLocation(location);
          setManualLat(latitude.toString());
          setManualLng(longitude.toString());
          setManualAddress(location.address);
        }
      }
    } catch (error: any) {
      console.error('Error getting current location:', error);
      let errorMessage = isRTL ? 'فشل في الحصول على موقعك الحالي' : 'Failed to get your current location';
      
      if (error.code === 1) {
        errorMessage = isRTL ? 'تم رفض طلب تحديد الموقع' : 'Location access denied';
      } else if (error.code === 2) {
        errorMessage = isRTL ? 'غير قادر على تحديد موقعك' : 'Unable to determine your location';
      } else if (error.code === 3) {
        errorMessage = isRTL ? 'انتهت مهلة طلب تحديد الموقع' : 'Location request timed out';
      }
      
      setLocationError(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Get address from coordinates using Nominatim (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      const location: Location = { lat, lng, address };
      setSelectedLocation(location);
      setManualLat(lat.toString());
      setManualLng(lng.toString());
      setManualAddress(address);
    } catch (error) {
      console.error('Error getting address:', error);
      const location: Location = { 
        lat, 
        lng, 
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` 
      };
      setSelectedLocation(location);
      setManualLat(lat.toString());
      setManualLng(lng.toString());
      setManualAddress(location.address);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const address = result.display_name;
        
        const location: Location = { lat, lng, address };
        setSelectedLocation(location);
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        setManualAddress(address);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) return;
    
    const location: Location = {
      lat,
      lng,
      address: manualAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
    
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setManualLat('');
    setManualLng('');
    setManualAddress('');
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {isRTL ? 'اختر الموقع من الخريطة' : 'Pick Location from Map'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="space-y-4">
            <div className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden relative" style={{ height: '400px' }}>
              <MapContainer
                center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleMapClick} />
                {selectedLocation && (
                  <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
                )}
              </MapContainer>
              
              {/* Current Location Button */}
              <div className="absolute top-4 right-4 z-[1000]">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg"
                  title={isRTL ? 'استخدم موقعي الحالي' : 'Use my current location'}
                >
                  <FontAwesomeIcon 
                    icon={faLocationArrow} 
                    className={`mr-2 ${isGettingLocation ? 'animate-spin' : ''}`}
                  />
                  {isGettingLocation ? (isRTL ? 'جاري التحديد...' : 'Locating...') : (isRTL ? 'موقعي' : 'My Location')}
                </Button>
              </div>
              
              {/* Location Error */}
              {locationError && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                  <div className="bg-red-900/90 border border-red-700 text-red-200 p-3 rounded-lg text-sm">
                    {locationError}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {isRTL ? 'البحث عن موقع' : 'Search for Location'}
              </label>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'أدخل اسم المدينة أو العنوان' : 'Enter city name or address'}
                  className="flex-1 bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </div>
            </div>
          </div>

          {/* Manual Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'إدخال الإحداثيات يدوياً' : 'Manual Coordinates Input'}
              </label>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {isRTL ? 'خط العرض' : 'Latitude'}
                  </label>
                  <Input
                    type="number"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="24.7136"
                    className="bg-gray-700 border-gray-600 text-white"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {isRTL ? 'خط الطول' : 'Longitude'}
                  </label>
                  <Input
                    type="number"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="46.6753"
                    className="bg-gray-700 border-gray-600 text-white"
                    step="any"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {isRTL ? 'العنوان' : 'Address'}
                </label>
                <Input
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder={isRTL ? 'أدخل العنوان' : 'Enter address'}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={handleManualSubmit}
                  className="w-full"
                  variant="secondary"
                >
                  {isRTL ? 'تطبيق الإحداثيات' : 'Apply Coordinates'}
                </Button>
                <Button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                  variant="secondary"
                >
                  <FontAwesomeIcon 
                    icon={faLocationArrow} 
                    className={`mr-2 ${isGettingLocation ? 'animate-spin' : ''}`}
                  />
                  {isGettingLocation ? (isRTL ? 'جاري تحديد الموقع...' : 'Getting location...') : (isRTL ? 'استخدم موقعي الحالي' : 'Use My Current Location')}
                </Button>
              </div>
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-400 mr-2" />
                      <span className="text-sm font-medium text-white">
                        {isRTL ? 'الموقع المحدد' : 'Selected Location'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{selectedLocation.address}</p>
                    <p className="text-xs text-gray-400">
                      {isRTL ? 'الإحداثيات:' : 'Coordinates:'} {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    onClick={handleClear}
                    className="text-red-400 hover:text-red-300 ml-2"
                    title={isRTL ? 'حذف الموقع' : 'Clear location'}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedLocation}
                className="flex-1"
              >
                {isRTL ? 'تأكيد الموقع' : 'Confirm Location'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
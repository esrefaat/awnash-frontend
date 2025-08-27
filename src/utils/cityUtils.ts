import { SAUDI_CITIES, getCityByValue, getCityLabel, getCitiesForDropdown } from '../config/cities';

/**
 * Utility functions for working with Saudi Arabian cities
 * This file demonstrates how to use the cities configuration throughout the app
 */

/**
 * Get a formatted list of cities for display
 * @param isRTL - Whether to use Arabic labels
 * @returns Array of cities with value and label
 */
export const getFormattedCities = (isRTL: boolean = false) => {
  return getCitiesForDropdown(isRTL);
};

/**
 * Get city display name by value
 * @param cityValue - The city value (e.g., 'riyadh')
 * @param isRTL - Whether to return Arabic name
 * @returns The display name of the city
 */
export const getCityDisplayName = (cityValue: string, isRTL: boolean = false): string => {
  return getCityLabel(cityValue, isRTL);
};

/**
 * Check if a city value is valid
 * @param cityValue - The city value to validate
 * @returns True if the city exists in our list
 */
export const isValidCity = (cityValue: string): boolean => {
  return getCityByValue(cityValue) !== undefined;
};

/**
 * Get cities grouped by region (for advanced filtering)
 * @param isRTL - Whether to use Arabic labels
 * @returns Object with regions as keys and cities as values
 */
export const getCitiesByRegion = (isRTL: boolean = false) => {
  const regions: { [key: string]: Array<{ value: string; label: string }> } = {};
  
  SAUDI_CITIES.forEach(city => {
    // Simple region grouping based on city names
    let region = 'Other';
    
    if (city.value.includes('riyadh') || city.value.includes('al_')) {
      region = isRTL ? 'الرياض والمناطق المجاورة' : 'Riyadh & Surrounding Areas';
    } else if (city.value.includes('jeddah') || city.value.includes('makkah') || city.value.includes('madinah')) {
      region = isRTL ? 'مكة المكرمة والمدينة المنورة' : 'Makkah & Madinah Region';
    } else if (city.value.includes('dammam') || city.value.includes('khobar') || city.value.includes('dhahran')) {
      region = isRTL ? 'المنطقة الشرقية' : 'Eastern Province';
    } else if (city.value.includes('tabuk') || city.value.includes('hail')) {
      region = isRTL ? 'المناطق الشمالية' : 'Northern Regions';
    } else if (city.value.includes('abha') || city.value.includes('jizan')) {
      region = isRTL ? 'المناطق الجنوبية' : 'Southern Regions';
    }
    
    if (!regions[region]) {
      regions[region] = [];
    }
    
    regions[region].push({
      value: city.value,
      label: isRTL ? city.arabicLabel : city.label
    });
  });
  
  return regions;
};

/**
 * Search cities by name (case-insensitive)
 * @param searchTerm - The search term
 * @param isRTL - Whether to search in Arabic names
 * @returns Array of matching cities
 */
export const searchCities = (searchTerm: string, isRTL: boolean = false) => {
  if (!searchTerm) return getCitiesForDropdown(isRTL);
  
  const term = searchTerm.toLowerCase();
  return SAUDI_CITIES
    .filter(city => {
      const englishName = city.label.toLowerCase();
      const arabicName = city.arabicLabel.toLowerCase();
      return englishName.includes(term) || arabicName.includes(term);
    })
    .map(city => ({
      value: city.value,
      label: isRTL ? city.arabicLabel : city.label
    }));
};

/**
 * Get popular cities (major cities)
 * @param isRTL - Whether to use Arabic labels
 * @returns Array of major cities
 */
export const getPopularCities = (isRTL: boolean = false) => {
  const popularCityValues = [
    'riyadh', 'jeddah', 'makkah', 'madinah', 'dammam', 
    'khobar', 'dhahran', 'taif', 'tabuk', 'abha'
  ];
  
  return SAUDI_CITIES
    .filter(city => popularCityValues.includes(city.value))
    .map(city => ({
      value: city.value,
      label: isRTL ? city.arabicLabel : city.label
    }));
};



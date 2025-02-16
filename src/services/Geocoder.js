export class Geocoder {
  constructor() {
    this.nominatimUrl = 'https://nominatim.openstreetmap.org/search';
    this.cache = new Map();
    this.lastRequest = 0;
  }

  async geocode(location, options = {}) {
    const cacheKey = location.toLowerCase();
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Rate limiting
    await this.enforceRateLimit();

    const params = {
      q: location,
      format: 'json',
      addressdetails: 1,
      limit: 1,
      ...options
    };

    try {
      const response = await axios.get(this.nominatimUrl, { params });
      
      if (response.data.length === 0) {
        throw new Error('Location not found');
      }

      const result = {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
        address: response.data[0].address
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw new Error('Geocoding service unavailable');
    }
  }

  async enforceRateLimit() {
    const elapsed = Date.now() - this.lastRequest;
    const minDelay = 1000; // 1 second between requests
    if (elapsed < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
    }
    this.lastRequest = Date.now();
  }

  async reverseGeocode(coords, options = {}) {
    const params = {
      lat: coords[1],
      lon: coords[0],
      format: 'json',
      ...options
    };

    try {
      const response = await axios.get(`${this.nominatimUrl}/reverse`, { params });
      return response.data.address;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }
}
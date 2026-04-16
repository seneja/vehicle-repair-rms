'use strict';

const { haversineKm, sortByDistance } = require('../geoHelper');

describe('geoHelper', () => {
  describe('haversineKm', () => {
    test('calculates distance between two points correctly', () => {
      // Colombo to Kandy (approx 95km-115km depending on exact points)
      const colomboLat = 6.9271, colomboLng = 79.8612;
      const kandyLat   = 7.2906, kandyLng   = 80.6337;
      
      const distance = haversineKm(colomboLat, colomboLng, kandyLat, kandyLng);
      
      // Expected distance is roughly 95.8km
      expect(distance).toBeGreaterThan(94);
      expect(distance).toBeLessThan(98);
    });

    test('returns 0 for the same point', () => {
      const lat = 6.9271, lng = 79.8612;
      expect(haversineKm(lat, lng, lat, lng)).toBe(0);
    });
  });

  describe('sortByDistance', () => {
    test('sorts workshops by distance ascending', () => {
      const userLat = 6.9271, userLng = 79.8612; // Colombo
      
      const workshops = [
        {
          name: 'Kandy Workshop',
          location: { coordinates: [80.6337, 7.2906] }, // Kandy (Far)
          toObject: function() { return { name: this.name, location: this.location }; }
        },
        {
          name: 'Colombo Workshop',
          location: { coordinates: [79.8612, 6.9270] }, // Just south of user (Near)
          toObject: function() { return { name: this.name, location: this.location }; }
        }
      ];

      const sorted = sortByDistance(workshops, userLat, userLng);
      
      expect(sorted[0].name).toBe('Colombo Workshop');
      expect(sorted[1].name).toBe('Kandy Workshop');
      expect(sorted[0].distanceKm).toBeLessThan(sorted[1].distanceKm);
    });
  });
});

const BASE_URL = 'http://localhost:3000/api/v2';
// Define the Konkan API base URL
// const KONKAN_API_BASE_URL = 'https://konkan-railway-api.railway.gov.in/api/v1';

export interface ApiTrain {
  name: string;
  status: 'left' | 'arrived' | 'running';
  station: string;
  statusTime: {
    hours: string;
    minutes: string;
  };
  delayedTime: {
    hours: string;
    minutes: string;
  };
  type: string;
  direction: 'up' | 'down';
}

export interface ApiTrainDetail {
  trainNo: string;
  name: string;
  timetable: Array<{
    station: string;
    arrival: string;
    departure: string;
    distance: number;
  }>;
  lastUpdatedAt: string;
  success: boolean;
}

export interface ApiStation {
  type: 'big' | 'small';
  state: string;
  description: string;
  distance: number;
}

export interface ApiStationDetail extends ApiStation {
  station: string;
  success: boolean;
}

// Konkan API specific interfaces
export interface KonkanTrain extends ApiTrain {
  section: string;
  congestionLevel?: string;
  weatherConditions?: string;
}

export interface KonkanStation extends ApiStation {
  zone: string;
  isJunction: boolean;
}

export interface TrainsResponse {
  lastUpdatedAt: string;
  trains: Record<string, ApiTrain>;
  success: boolean;
}

export interface StationsResponse {
  stations: Record<string, ApiStation>;
  success: boolean;
}

class ApiService {
  // Standard API methods
  async fetchAllTrains(): Promise<TrainsResponse> {
    try {
      // Try to fetch from Konkan API first
      try {
        return await this.fetchKonkanTrains();
      } catch (konkanError) {
        console.warn('Failed to fetch from Konkan API, falling back to mock API:', konkanError);
        // Fall back to mock API if Konkan API fails
        const response = await fetch(`${BASE_URL}/fetchTrains/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching trains:', error);
      throw error;
    }
  }

  async fetchTrain(trainNumber: string): Promise<ApiTrainDetail> {
    try {
      // Try to fetch from Konkan API first
      try {
        return await this.fetchKonkanTrainDetails(trainNumber);
      } catch (konkanError) {
        console.warn(`Failed to fetch train ${trainNumber} from Konkan API, falling back to mock API:`, konkanError);
        // Fall back to mock API if Konkan API fails
        const response = await fetch(`${BASE_URL}/fetchTrain/${trainNumber}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching train ${trainNumber}:`, error);
      throw error;
    }
  }

  async fetchAllStations(): Promise<StationsResponse> {
    try {
      // Try to fetch from Konkan API first
      try {
        return await this.fetchKonkanStations();
      } catch (konkanError) {
        console.warn('Failed to fetch stations from Konkan API, falling back to mock API:', konkanError);
        // Fall back to mock API if Konkan API fails
        const response = await fetch(`${BASE_URL}/fetchStations/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  }

  async fetchStation(stationName: string): Promise<ApiStationDetail> {
    try {
      // Try to fetch from Konkan API first
      try {
        return await this.fetchKonkanStationDetails(stationName);
      } catch (konkanError) {
        console.warn(`Failed to fetch station ${stationName} from Konkan API, falling back to mock API:`, konkanError);
        // Fall back to mock API if Konkan API fails
        const response = await fetch(`${BASE_URL}/fetchStation/${stationName}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching station ${stationName}:`, error);
      throw error;
    }
  }
  
  // Konkan API specific methods
  async fetchKonkanTrains(): Promise<TrainsResponse> {
    const response = await fetch(`$BASE_URL/trains`);
    if (!response.ok) {
      throw new Error(`Konkan API HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  
  async fetchKonkanTrainDetails(trainNumber: string): Promise<ApiTrainDetail> {
    const response = await fetch(`$BASE_URL/trains/${trainNumber}`);
    if (!response.ok) {
      throw new Error(`Konkan API HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  
  async fetchKonkanStations(): Promise<StationsResponse> {
    const response = await fetch(`$BASE_URL/stations`);
    if (!response.ok) {
      throw new Error(`Konkan API HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  
  async fetchKonkanStationDetails(stationName: string): Promise<ApiStationDetail> {
    const response = await fetch(`$BASE_URL/stations/${stationName}`);
    if (!response.ok) {
      throw new Error(`Konkan API HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  
  // Method to check if Konkan API is available
  async checkKonkanApiAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`$BASE_URL/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Short timeout to quickly determine if API is available
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (error) {
      console.error('Konkan API health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
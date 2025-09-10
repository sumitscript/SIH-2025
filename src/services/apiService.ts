const BASE_URL = 'http://localhost:3000/api/v2';

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
  async fetchAllTrains(): Promise<TrainsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/fetchTrains/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching trains:', error);
      throw error;
    }
  }

  async fetchTrain(trainNumber: string): Promise<ApiTrainDetail> {
    try {
      const response = await fetch(`${BASE_URL}/fetchTrain/${trainNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching train ${trainNumber}:`, error);
      throw error;
    }
  }

  async fetchAllStations(): Promise<StationsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/fetchStations/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  }

  async fetchStation(stationName: string): Promise<ApiStationDetail> {
    try {
      const response = await fetch(`${BASE_URL}/fetchStation/${stationName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching station ${stationName}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
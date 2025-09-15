// Train timetable data utility
export interface TimetableStop {
  station_name: string;
  station_code: string;
  arrival: string;
  departure: string;
  halt_time: string;
  distance_km: number;
  platform?: string | number;
}

export interface TrainTimetable {
  train_name: string;
  train_number: string;
  origin: string;
  destination: string;
  total_distance_km: number;
  journey_duration: string;
  total_stops: number;
  intermediate_stops: TimetableStop[];
}

// This would normally be loaded from the train_timetable.json file
// For now, we'll create a subset of the data structure
export const TRAIN_TIMETABLES: Record<string, TrainTimetable> = {
  "10103": {
    train_name: "MANDOVI EXPRESS",
    train_number: "10103",
    origin: "Mumbai CSM Terminus (CSMT)",
    destination: "Madgaon Junction (MAO)",
    total_distance_km: 765,
    journey_duration: "14h 45m",
    total_stops: 20,
    intermediate_stops: [
      {
        station_name: "Mumbai CSM Terminus",
        station_code: "CSMT",
        arrival: "Start",
        departure: "07:10",
        halt_time: "-",
        distance_km: 0.0,
        platform: 16
      },
      {
        station_name: "Mumbai Dadar Central",
        station_code: "DR",
        arrival: "07:22",
        departure: "07:25",
        halt_time: "3m",
        distance_km: 9.0,
        platform: 10
      },
      {
        station_name: "Thane",
        station_code: "TNA",
        arrival: "07:51",
        departure: "07:55",
        halt_time: "4m",
        distance_km: 34.0,
        platform: 7
      },
      {
        station_name: "Panvel Jn",
        station_code: "PNVL",
        arrival: "08:30",
        departure: "08:35",
        halt_time: "5m",
        distance_km: 69.0,
        platform: 7
      },
      {
        station_name: "Chiplun",
        station_code: "CHI",
        arrival: "12:28",
        departure: "12:30",
        halt_time: "2m",
        distance_km: 325.0,
        platform: 2
      },
      {
        station_name: "Ratnagiri",
        station_code: "RN",
        arrival: "14:45",
        departure: "14:50",
        halt_time: "5m",
        distance_km: 431.0,
        platform: 1
      },
      {
        station_name: "Kankavali",
        station_code: "KKW",
        arrival: "17:30",
        departure: "17:32",
        halt_time: "2m",
        distance_km: 587.0,
        platform: 2
      },
      {
        station_name: "Madgaon Jn",
        station_code: "MAO",
        arrival: "21:55",
        departure: "Ends",
        halt_time: "-",
        distance_km: 765.0,
        platform: 2
      }
    ]
  },
  "10104": {
    train_name: "MANDOVI EXPRESS",
    train_number: "10104",
    origin: "Madgaon Junction (MAO)",
    destination: "Mumbai CSM Terminus (CSMT)",
    total_distance_km: 764,
    journey_duration: "13h 15m",
    total_stops: 20,
    intermediate_stops: [
      {
        station_name: "Madgaon Junction",
        station_code: "MAO",
        arrival: "Start",
        departure: "08:30",
        halt_time: "-",
        distance_km: 0.0,
        platform: 1
      },
      {
        station_name: "Kankavali",
        station_code: "KKW",
        arrival: "11:00",
        departure: "11:02",
        halt_time: "2m",
        distance_km: 179.0,
        platform: 1
      },
      {
        station_name: "Ratnagiri",
        station_code: "RN",
        arrival: "14:00",
        departure: "14:05",
        halt_time: "5m",
        distance_km: 335.0,
        platform: 2
      },
      {
        station_name: "Chiplun",
        station_code: "CHI",
        arrival: "15:30",
        departure: "15:32",
        halt_time: "2m",
        distance_km: 441.0,
        platform: 1
      },
      {
        station_name: "Panvel Jn",
        station_code: "PNVL",
        arrival: "18:57",
        departure: "19:00",
        halt_time: "3m",
        distance_km: 697.0,
        platform: 5
      },
      {
        station_name: "Thane",
        station_code: "TNA",
        arrival: "20:37",
        departure: "20:40",
        halt_time: "3m",
        distance_km: 730.22,
        platform: 6
      },
      {
        station_name: "Mumbai CSM Terminus",
        station_code: "CSMT",
        arrival: "21:45",
        departure: "Ends",
        halt_time: "-",
        distance_km: 764.0,
        platform: 17
      }
    ]
  }
};

export const getPlatformForStation = (trainNumber: string, stationName: string): string | undefined => {
  const timetable = TRAIN_TIMETABLES[trainNumber];
  if (!timetable) return undefined;
  
  const stop = timetable.intermediate_stops.find(stop => 
    stop.station_name.toLowerCase().includes(stationName.toLowerCase()) ||
    stop.station_code.toLowerCase() === stationName.toLowerCase()
  );
  
  return stop?.platform?.toString();
};

export const getNextStation = (trainNumber: string, currentStation: string): { 
  station: string; 
  platform?: string; 
  arrival?: string; 
} | undefined => {
  const timetable = TRAIN_TIMETABLES[trainNumber];
  if (!timetable) return undefined;
  
  const currentIndex = timetable.intermediate_stops.findIndex(stop => 
    stop.station_name.toLowerCase().includes(currentStation.toLowerCase()) ||
    stop.station_code.toLowerCase() === currentStation.toLowerCase()
  );
  
  if (currentIndex >= 0 && currentIndex < timetable.intermediate_stops.length - 1) {
    const nextStop = timetable.intermediate_stops[currentIndex + 1];
    return {
      station: nextStop.station_name,
      platform: nextStop.platform?.toString(),
      arrival: nextStop.arrival
    };
  }
  
  return undefined;
};

export const getTrainTimetable = (trainNumber: string): TrainTimetable | undefined => {
  return TRAIN_TIMETABLES[trainNumber];
};
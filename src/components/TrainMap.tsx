import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { stationCoordinates } from '../utils/stationCoordinates';
import { apiService, ApiTrain } from '../services/apiService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const trainIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1167/1167986.png',
  iconSize: [32, 32],
});

interface LiveTrain extends ApiTrain {
  trainNo: string;
}

const TrainMap: React.FC = () => {
  const [liveTrains, setLiveTrains] = useState<LiveTrain[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await apiService.fetchAllStations();
        const stationData = response.stations;
        const stationNodes = Object.keys(stationData).map(stationName => {
          const station = stationData[stationName];
          const coordinates = stationCoordinates[stationName.toLowerCase()];
          return {
            id: stationName,
            name: stationName.charAt(0).toUpperCase() + stationName.slice(1),
            position: coordinates ? [coordinates.y, coordinates.x] : [0, 0],
            ...station
          };
        });
        setStations(stationNodes);

        // Manually define track connections based on Konkan Railway order
        const konkanRailwayStationsOrder = [
          'roha', 'kolad', 'indapur', 'mangaon', 'goregaon road', 'veer', 'sape wamne', 'karanjadi', 'vinhere', 'diwankhavati', 'khed', 'kalambani budruk', 'anjani', 'chiplun', 'kamathe', 'sawarda', 'aravali road', 'kadavai', 'sangameshwar road', 'ukshi', 'bhoke', 'ratnagiri', 'nivasar', 'adavali', 'vilavade', 'rajapur road', 'vaibhavwadi road', 'nandgaon road', 'kankavali', 'sindhudurg', 'kudal', 'zarap', 'sawantwadi road', 'madure',
          'pernem', 'thivim', 'karmali', 'verna', 'majorda', 'madgaon (margao)', 'balli', 'canacona',
          'asnoti', 'karwar', 'harwada', 'ankola', 'gokarna road', 'mirjan', 'kumta', 'honnavar', 'manki', 'murdeshwar', 'chitrapur', 'bhatkal', 'shiroor', 'mookambika road byndoor', 'bijoor', 'senapura', 'kundapura', 'barkur', 'udupi', 'padubidri', 'nandikoor', 'mulki', 'surathkal', 'thokur'
        ];

        const trackLines = [];
        for (let i = 0; i < konkanRailwayStationsOrder.length - 1; i++) {
          const fromStationName = konkanRailwayStationsOrder[i];
          const toStationName = konkanRailwayStationsOrder[i + 1];
          const fromStation = stationNodes.find(s => s.id === fromStationName);
          const toStation = stationNodes.find(s => s.id === toStationName);

          if (fromStation && toStation) {
            trackLines.push([fromStation.position, toStation.position]);
          }
        }
        setTracks(trackLines);

      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await apiService.fetchAllTrains();
        const trains = Object.entries(response.trains).map(([trainNo, trainData]) => ({
          ...trainData,
          trainNo,
        }));
        setLiveTrains(trains);
      } catch (error) {
        console.error('Error fetching trains:', error);
      }
    };

    fetchTrains();
    const interval = setInterval(fetchTrains, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const indiaBounds = [
    [6.75, 68.11],
    [35.67, 97.39],
  ];

  return (
    <MapContainer
      center={[15.3, 74.3]}
      zoom={9}
      style={{ height: '100vh', width: '100%' }}
      maxBounds={indiaBounds}
      maxBoundsViscosity={1.0}
      minZoom={7}
      maxZoom={12}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stations.map(station => {
        const isTrainAtStation = liveTrains.some(train => train.station.toLowerCase() === station.name.toLowerCase());
        return (
          <Marker key={station.id} position={station.position} icon={isTrainAtStation ? trainIcon : new L.Icon.Default()}>
            <Popup>
              <b>{station.name}</b><br/>
              {isTrainAtStation ? 'Train at station' : 'No train at station'}
            </Popup>
          </Marker>
        )
      })}
      {liveTrains.map(train => {
        const station = stations.find(s => s.name.toLowerCase() === train.station.toLowerCase());
        if (!station) return null;

        return (
          <Marker key={train.trainNo} position={station.position} icon={trainIcon}>
            <Popup>
              <b>{train.name} ({train.trainNo})</b><br/>
              Status: {train.status}<br/>
              Station: {train.station}
            </Popup>
          </Marker>
        );
      })}
      <Polyline positions={tracks} color="#4a5568" />
    </MapContainer>
  );
};

export default TrainMap;
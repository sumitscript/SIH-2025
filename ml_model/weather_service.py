import requests
import json
import time
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("weather_service")

class WeatherService:
    """Service to fetch and manage weather data for train stations"""
    
    def __init__(self, api_key=None, cache_duration=3600):
        """Initialize the weather service
        
        Args:
            api_key (str, optional): OpenWeatherMap API key. If not provided, will try to get from environment
            cache_duration (int, optional): How long to cache weather data in seconds. Defaults to 1 hour.
        """
        # Try to get API key from environment if not provided
        self.api_key = api_key or os.environ.get('OPENWEATHER_API_KEY', 'demo')
        self.cache_duration = cache_duration
        self.cache = {}
        self.last_fetch_time = {}
        
        # Base URL for OpenWeatherMap API
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
        
        # Weather conditions that can affect train operations
        self.severe_conditions = [
            'thunderstorm', 'drizzle', 'rain', 'snow', 'tornado',
            'squall', 'hurricane', 'tropical storm', 'dust', 'fog', 'haze', 'smoke'
        ]
    
    def get_weather_by_coordinates(self, lat, lon):
        """Get weather data for specific coordinates
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            
        Returns:
            dict: Weather data or None if failed
        """
        cache_key = f"{lat},{lon}"
        
        # Check if we have cached data that's still valid
        current_time = time.time()
        if cache_key in self.cache and current_time - self.last_fetch_time.get(cache_key, 0) < self.cache_duration:
            return self.cache[cache_key]
        
        # Construct the API URL
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric'  # Use metric units (Celsius)
        }
        
        try:
            # Make the API request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()  # Raise exception for HTTP errors
            
            # Parse the response
            weather_data = response.json()
            
            # Process the data into a more usable format
            processed_data = self._process_weather_data(weather_data)
            
            # Cache the data
            self.cache[cache_key] = processed_data
            self.last_fetch_time[cache_key] = current_time
            
            return processed_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching weather data: {e}")
            
            # If we have cached data, return it even if it's expired
            if cache_key in self.cache:
                logger.info("Returning expired cached data")
                return self.cache[cache_key]
            
            # Return a default weather object if we can't get data
            return self._get_default_weather()
    
    def get_weather_for_station(self, station_data):
        """Get weather data for a specific station
        
        Args:
            station_data (dict): Station data containing coordinates
            
        Returns:
            dict: Weather data
        """
        # Extract coordinates from station data
        coordinates = station_data.get('coordinates', {})
        
        # If coordinates are missing or invalid, return default weather
        if not coordinates or 'lat' not in coordinates or 'lon' not in coordinates:
            logger.warning(f"Missing coordinates for station {station_data.get('station', 'unknown')}")
            return self._get_default_weather()
        
        # Some APIs might have coordinates as strings, convert to float
        try:
            lat = float(coordinates['lat'])
            lon = float(coordinates['lon'])
        except (ValueError, TypeError):
            logger.warning(f"Invalid coordinates for station {station_data.get('station', 'unknown')}")
            return self._get_default_weather()
        
        # Get weather data for the coordinates
        weather_data = self.get_weather_by_coordinates(lat, lon)
        
        # Add station information to the weather data
        weather_data['station'] = station_data.get('station', 'unknown')
        weather_data['station_code'] = station_data.get('station_code', 'unknown')
        
        return weather_data
    
    def get_weather_for_all_stations(self, stations_data):
        """Get weather data for all stations
        
        Args:
            stations_data (list): List of station data dictionaries
            
        Returns:
            dict: Dictionary of station codes to weather data
        """
        weather_data = {}
        
        for station in stations_data:
            station_code = station.get('station_code', station.get('station', 'unknown'))
            weather_data[station_code] = self.get_weather_for_station(station)
        
        return weather_data
    
    def _process_weather_data(self, raw_data):
        """Process raw weather API data into a more usable format
        
        Args:
            raw_data (dict): Raw weather data from API
            
        Returns:
            dict: Processed weather data
        """
        try:
            # Extract relevant information
            weather = raw_data.get('weather', [{}])[0]
            main = raw_data.get('main', {})
            wind = raw_data.get('wind', {})
            rain = raw_data.get('rain', {})
            snow = raw_data.get('snow', {})
            clouds = raw_data.get('clouds', {})
            visibility = raw_data.get('visibility', 10000)  # Default 10km visibility
            
            # Calculate weather severity (0-10 scale, 10 being most severe)
            severity = self._calculate_weather_severity(weather, main, wind, rain, snow, visibility)
            
            # Determine if this weather could impact train operations
            impact_level = self._calculate_train_impact(severity, weather, wind, rain, snow, visibility)
            
            # Format the processed data
            processed_data = {
                'condition': weather.get('main', 'Unknown'),
                'description': weather.get('description', 'Unknown weather condition'),
                'temperature': main.get('temp', 20),  # Celsius
                'feels_like': main.get('feels_like', 20),  # Celsius
                'humidity': main.get('humidity', 50),  # Percentage
                'pressure': main.get('pressure', 1013),  # hPa
                'wind_speed': wind.get('speed', 0),  # m/s
                'wind_direction': wind.get('deg', 0),  # Degrees
                'wind_gust': wind.get('gust', 0),  # m/s
                'clouds': clouds.get('all', 0),  # Percentage
                'visibility': visibility / 1000,  # km (API returns meters)
                'rain_1h': rain.get('1h', 0),  # mm
                'rain_3h': rain.get('3h', 0),  # mm
                'snow_1h': snow.get('1h', 0),  # mm
                'snow_3h': snow.get('3h', 0),  # mm
                'timestamp': datetime.now().isoformat(),
                'severity': severity,
                'train_impact': impact_level,
                'train_impact_description': self._get_impact_description(impact_level)
            }
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing weather data: {e}")
            return self._get_default_weather()
    
    def _calculate_weather_severity(self, weather, main, wind, rain, snow, visibility):
        """Calculate weather severity on a scale of 0-10
        
        Args:
            weather (dict): Weather condition data
            main (dict): Main weather data
            wind (dict): Wind data
            rain (dict): Rain data
            snow (dict): Snow data
            visibility (int): Visibility in meters
            
        Returns:
            float: Severity score from 0-10
        """
        severity = 0
        
        # Check weather condition
        condition = weather.get('main', '').lower()
        if any(cond in condition for cond in ['thunderstorm', 'tornado', 'hurricane']):
            severity += 5
        elif any(cond in condition for cond in ['snow', 'blizzard']):
            severity += 4
        elif any(cond in condition for cond in ['rain', 'drizzle']):
            severity += 3
        elif any(cond in condition for cond in ['fog', 'mist', 'haze', 'smoke']):
            severity += 2
        elif any(cond in condition for cond in ['clouds', 'cloudy']):
            severity += 1
        
        # Check temperature extremes
        temp = main.get('temp', 20)
        if temp > 40 or temp < -10:
            severity += 2
        elif temp > 35 or temp < -5:
            severity += 1
        
        # Check wind speed
        wind_speed = wind.get('speed', 0)
        if wind_speed > 20:  # Strong gale
            severity += 3
        elif wind_speed > 10:  # Fresh breeze
            severity += 2
        elif wind_speed > 5:  # Gentle breeze
            severity += 1
        
        # Check precipitation
        rain_1h = rain.get('1h', 0)
        snow_1h = snow.get('1h', 0)
        
        if rain_1h > 10 or snow_1h > 5:  # Heavy rain/snow
            severity += 3
        elif rain_1h > 5 or snow_1h > 2:  # Moderate rain/snow
            severity += 2
        elif rain_1h > 1 or snow_1h > 0.5:  # Light rain/snow
            severity += 1
        
        # Check visibility
        if visibility < 1000:  # Very poor visibility
            severity += 3
        elif visibility < 5000:  # Poor visibility
            severity += 2
        elif visibility < 10000:  # Moderate visibility
            severity += 1
        
        # Cap severity at 10
        return min(severity, 10)
    
    def _calculate_train_impact(self, severity, weather, wind, rain, snow, visibility):
        """Calculate the impact on train operations
        
        Args:
            severity (float): Weather severity score
            weather (dict): Weather condition data
            wind (dict): Wind data
            rain (dict): Rain data
            snow (dict): Snow data
            visibility (int): Visibility in meters
            
        Returns:
            int: Impact level (0-5)
                0: No impact
                1: Minor impact (slight delays possible)
                2: Moderate impact (delays likely)
                3: Significant impact (delays certain, some cancellations possible)
                4: Severe impact (significant delays, cancellations likely)
                5: Extreme impact (service suspension possible)
        """
        # Start with severity-based impact
        if severity >= 8:
            impact = 5
        elif severity >= 6:
            impact = 4
        elif severity >= 4:
            impact = 3
        elif severity >= 2:
            impact = 2
        elif severity >= 1:
            impact = 1
        else:
            impact = 0
        
        # Specific conditions that affect trains
        condition = weather.get('main', '').lower()
        
        # Heavy snow is particularly problematic for trains
        if 'snow' in condition and snow.get('1h', 0) > 3:
            impact = max(impact, 4)
        
        # Heavy rain can cause flooding on tracks
        if ('rain' in condition or 'thunderstorm' in condition) and rain.get('1h', 0) > 8:
            impact = max(impact, 4)
        
        # Very strong winds can affect train stability
        if wind.get('speed', 0) > 25:
            impact = max(impact, 4)
        
        # Poor visibility affects train speed
        if visibility < 500:
            impact = max(impact, 3)
        
        return impact
    
    def _get_impact_description(self, impact_level):
        """Get a description of the impact on train operations
        
        Args:
            impact_level (int): Impact level (0-5)
            
        Returns:
            str: Description of the impact
        """
        descriptions = {
            0: "No impact on train operations expected.",
            1: "Minor impact. Slight delays possible.",
            2: "Moderate impact. Delays likely. Reduced speeds may be necessary.",
            3: "Significant impact. Delays certain. Some cancellations possible. Speed restrictions in effect.",
            4: "Severe impact. Significant delays and cancellations likely. Major speed restrictions.",
            5: "Extreme impact. Service suspension possible. Safety checks required before operation."
        }
        
        return descriptions.get(impact_level, "Unknown impact")
    
    def _get_default_weather(self):
        """Get a default weather object when API fails
        
        Returns:
            dict: Default weather data
        """
        return {
            'condition': 'Unknown',
            'description': 'Weather data unavailable',
            'temperature': 20,
            'feels_like': 20,
            'humidity': 50,
            'pressure': 1013,
            'wind_speed': 0,
            'wind_direction': 0,
            'wind_gust': 0,
            'clouds': 0,
            'visibility': 10,
            'rain_1h': 0,
            'rain_3h': 0,
            'snow_1h': 0,
            'snow_3h': 0,
            'timestamp': datetime.now().isoformat(),
            'severity': 0,
            'train_impact': 0,
            'train_impact_description': 'No impact on train operations expected.'
        }

# Example usage
if __name__ == "__main__":
    # Create a weather service instance
    weather_service = WeatherService()
    
    # Example station data
    station = {
        'station': 'Mumbai CSM Terminus',
        'station_code': 'CSMT',
        'coordinates': {
            'lat': 18.9398,
            'lon': 72.8355
        }
    }
    
    # Get weather for the station
    weather = weather_service.get_weather_for_station(station)
    
    # Print the weather data
    print(json.dumps(weather, indent=2))
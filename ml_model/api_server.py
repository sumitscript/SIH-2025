import os
import json
import time
import logging
import threading
import re
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from train_optimization_model import TrainOptimizationModel
from weather_service import WeatherService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api_server")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the model and weather service
model = TrainOptimizationModel()
weather_service = WeatherService()

# Load train and station data
def load_json_data(filename):
    try:
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), filename)
        with open(file_path, 'r') as f:
            data = json.load(f)
            # Ensure all stations have coordinates for weather data if loading stations
            if filename == 'stations.json':
                for station in data:
                    if 'coordinates' not in station:
                        # Add default coordinates if missing
                        station['coordinates'] = {
                            'lat': '20.5937',  # Default to central India
                            'lon': '78.9629'
                        }
            return data
    except Exception as e:
        logger.error(f"Error loading {filename}: {str(e)}")
        return {}

# Background training thread
def background_training():
    while True:
        try:
            # Load latest data
            train_data = fetch_train_data()
            station_data = load_json_data('stations.json')
            
            if train_data and station_data:
                logger.info("Starting background model training...")
                model.train_models(train_data, station_data)
                logger.info("Background model training completed")
            else:
                logger.warning("Insufficient data for background training")
                
        except Exception as e:
            logger.error(f"Error in background training: {str(e)}")
        
        # Sleep for 30 minutes before next training
        time.sleep(1800)

# Start background training thread
training_thread = threading.Thread(target=background_training, daemon=True)
training_thread.start()

# Fetch train data from the main API
def fetch_train_data():
    try:
        # In a real implementation, this would call the main API
        # For now, we'll use mock data
        return load_json_data('mock_train_data.json')
    except Exception as e:
        logger.error(f"Error fetching train data: {str(e)}")
        return {}

@app.route('/api/ml/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/api/ml/metrics', methods=['GET'])
def get_metrics():
    metrics = model.get_model_metrics()
    return jsonify(metrics)

@app.route('/api/ml/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        train_data = data.get('trains', {})
        station_data = data.get('stations', [])
        
        if not train_data or not station_data:
            # If no data provided in request, try to load from files
            train_data = fetch_train_data()
            station_data = load_json_data('stations.json')
        
        recommendations = model.generate_recommendations(train_data, station_data)
        
        # Enhance recommendations with expected delay and optimal speed
        for rec in recommendations:
            train_id = rec.get('affectedTrains', [''])[0]
            if train_id and train_id in train_data:
                # Extract delay prediction from reasoning
                delay_match = re.search(r'predicts additional (\d+) min delay', rec.get('reasoning', ''))
                expected_delay = delay_match.group(1) + ' min' if delay_match else None
                
                # Extract speed recommendation from implementation
                speed_match = re.search(r'Increase speed to (\d+) km/h', rec.get('implementation', ''))
                if not speed_match:
                    speed_match = re.search(r'Reduce speed to (\d+) km/h', rec.get('implementation', ''))
                optimal_speed = speed_match.group(1) + ' km/h' if speed_match else None
                
                # Add to recommendation
                rec['expectedDelay'] = expected_delay
                rec['optimalSpeed'] = optimal_speed
        
        return jsonify({
            'recommendations': recommendations,
            'model_metrics': model.get_model_metrics()
        })
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({
            'error': str(e),
            'recommendations': []
        }), 500

@app.route('/api/ml/weather/<station_name>', methods=['GET'])
def get_weather(station_name):
    try:
        weather_data = model.get_weather_data(station_name)
        return jsonify(weather_data)
    except Exception as e:
        logger.error(f"Error fetching weather data: {str(e)}")
        return jsonify({
            'error': str(e),
            'condition': 'Unknown',
            'temperature': 0,
            'wind_speed': 0,
            'precipitation': 0
        }), 500

@app.route('/api/weather/station/<station_code>', methods=['GET'])
def get_station_weather(station_code):
    """Get weather data for a specific station"""
    stations = load_json_data('stations.json')
    
    # Find the station by code
    station = None
    for s in stations:
        if s.get('station_code', '').lower() == station_code.lower() or s.get('station', '').lower() == station_code.lower():
            station = s
            break
    
    if not station:
        return jsonify({
            'error': f'Station with code {station_code} not found'
        }), 404
    
    # Get weather data for the station
    weather_data = weather_service.get_weather_for_station(station)
    
    return jsonify(weather_data)

@app.route('/api/weather/all', methods=['GET'])
def get_all_weather():
    """Get weather data for all stations"""
    stations = load_json_data('stations.json')
    weather_data = weather_service.get_weather_for_all_stations(stations)
    
    return jsonify(weather_data)

@app.route('/api/ml/train_delay', methods=['POST'])
def predict_train_delay():
    try:
        train_features = request.json
        delay = model.predict_train_delay(train_features)
        return jsonify({
            'predicted_delay': delay
        })
    except Exception as e:
        logger.error(f"Error predicting train delay: {str(e)}")
        return jsonify({
            'error': str(e),
            'predicted_delay': 0
        }), 500

@app.route('/api/ml/congestion', methods=['POST'])
def predict_congestion():
    try:
        section_features = request.json
        congestion = model.predict_section_congestion(section_features)
        return jsonify({
            'congestion_level': congestion
        })
    except Exception as e:
        logger.error(f"Error predicting congestion: {str(e)}")
        return jsonify({
            'error': str(e),
            'congestion_level': 50
        }), 500

@app.route('/api/ml/optimal_speed', methods=['POST'])
def recommend_speed():
    try:
        data = request.json
        train_features = data.get('train_features', {})
        congestion_level = data.get('congestion_level', 50)
        
        speed = model.recommend_optimal_speed(train_features, congestion_level)
        return jsonify({
            'optimal_speed': speed
        })
    except Exception as e:
        logger.error(f"Error recommending optimal speed: {str(e)}")
        return jsonify({
            'error': str(e),
            'optimal_speed': 60
        }), 500

@app.route('/api/ml/train', methods=['POST'])
def train_model():
    try:
        data = request.json
        train_data = data.get('trains', {})
        station_data = data.get('stations', [])
        
        if not train_data or not station_data:
            # If no data provided in request, try to load from files
            train_data = fetch_train_data()
            station_data = load_json_data('stations.json')
        
        success = model.train_models(train_data, station_data)
        
        return jsonify({
            'success': success,
            'model_metrics': model.get_model_metrics()
        })
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    # Create mock data for initial training
    try:
        mock_data_path = os.path.join(os.path.dirname(__file__), 'mock_train_data.json')
        if not os.path.exists(mock_data_path):
            # Create simple mock data
            mock_train_data = {
                'train-001': {
                    'id': 'train-001',
                    'type': 'Express',
                    'station': 'delhi',
                    'status': 'running',
                    'delayedTime': {'hours': '0', 'minutes': '10'}
                },
                'train-002': {
                    'id': 'train-002',
                    'type': 'Passenger',
                    'station': 'mumbai',
                    'status': 'running',
                    'delayedTime': {'hours': '0', 'minutes': '5'}
                }
            }
            with open(mock_data_path, 'w') as f:
                json.dump(mock_train_data, f)
            logger.info(f"Created mock train data at {mock_data_path}")
    except Exception as e:
        logger.error(f"Error creating mock data: {str(e)}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
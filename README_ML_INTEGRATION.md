# Train Traffic Optimization ML Integration

This document explains how to set up and run the advanced ML model for train traffic optimization that has been integrated with the existing TypeScript frontend.

## Features

The ML model provides the following capabilities:

- **Delay Prediction**: Predicts train delays based on historical data, current conditions, and weather
- **Congestion Prediction**: Identifies potential congestion points in the network
- **Optimal Speed Recommendation**: Calculates optimal speeds for trains to avoid collisions and minimize delays
- **Platform Bottleneck Management**: Identifies and manages platform bottlenecks
- **Weather Impact Analysis**: Integrates real-time weather data to assess impact on train operations
- **Routing Optimization**: Suggests optimal routes based on current network conditions

## Setup and Installation

### Prerequisites

- Python 3.8 or higher
- Node.js and npm (already required for the frontend)

### Installation

1. Run the setup script to install all required Python packages and start the ML server:

```
setup_and_run_ml.bat
```

This script will:
- Install all required Python packages
- Generate mock data for initial training
- Start the ML API server

## Architecture

The ML integration consists of the following components:

### Backend (Python)

- `train_optimization_model.py`: Core ML model implementation
- `api_server.py`: Flask API server that exposes ML functionality
- `weather_service.py`: Service for fetching and processing weather data
- `generate_mock_data.py`: Utility to generate training data

### Frontend Integration (TypeScript)

- `mlService.ts`: Service for communicating with the ML API
- `AIRecommendationEngine.tsx`: UI component that displays ML insights and recommendations

## API Endpoints

The ML API server exposes the following endpoints:

- `GET /api/health`: Health check endpoint
- `GET /api/ml/metrics`: Get model metrics (accuracy, last trained time)
- `POST /api/ml/recommendations`: Generate recommendations based on train data
- `GET /api/weather/all`: Get weather data for all stations
- `GET /api/weather/station/<station_code>`: Get weather for a specific station
- `POST /api/ml/train_delay`: Predict train delay
- `POST /api/ml/congestion`: Predict congestion
- `POST /api/ml/optimal_speed`: Recommend optimal speed
- `POST /api/ml/train`: Train the model with new data

## Fallback Mechanism

If the ML API server is not available, the system will fall back to using the local TypeScript-based recommendation model. This ensures that the system remains operational even if the ML service is down.

## Weather Data

The system uses the OpenWeatherMap API to fetch weather data for each station. The weather data is used to:

1. Assess potential impact on train operations
2. Adjust speed recommendations based on weather conditions
3. Provide weather alerts for stations with severe conditions

## Model Details

The ML model uses a combination of:

- Random Forest for delay prediction
- Gradient Boosting for congestion prediction
- Neural Networks for optimal speed recommendation
- Decision Trees for routing optimization

## Troubleshooting

### ML Server Not Starting

1. Check if Python is installed and in your PATH
2. Ensure all required packages are installed: `pip install -r ml_model/requirements.txt`
3. Check if port 5000 is already in use by another application

### Weather Data Not Showing

1. Check if the OpenWeatherMap API key is set correctly
2. Ensure stations have valid coordinates in the stations.json file

## Future Improvements

- Implement real-time model updates based on actual train data
- Add more sophisticated weather impact models
- Integrate with additional data sources for better predictions
- Implement A/B testing to compare different ML models
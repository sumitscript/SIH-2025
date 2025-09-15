# Train Traffic Optimization ML Model

This directory contains a machine learning model for optimizing train traffic control. The model predicts delays, congestion, optimal speeds, and generates recommendations for train traffic management.

## Features

- **Delay Prediction**: Predicts train delays based on historical data, current conditions, and weather
- **Congestion Prediction**: Identifies potential congestion points in the railway network
- **Optimal Speed Recommendation**: Suggests optimal speeds for trains to avoid collisions and minimize delays
- **Platform Bottleneck Management**: Analyzes and recommends solutions for platform bottlenecks
- **Weather Integration**: Uses real-time weather data to adjust predictions and recommendations
- **Comprehensive Metrics**: Provides accuracy metrics and model performance statistics

## Directory Structure

- `api_server.py`: Flask API server that exposes the ML model functionality
- `train_optimization_model.py`: Core ML model implementation
- `generate_mock_data.py`: Script to generate mock data for testing
- `requirements.txt`: Python dependencies
- `run_server.py`: Helper script to set up and run the ML server

## Setup and Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Navigate to the `ml_model` directory
2. Run the server script:

```bash
python run_server.py
```

This script will:
- Check Python installation
- Install required packages from `requirements.txt`
- Generate mock data for testing (if needed)
- Start the Flask API server

## API Endpoints

The ML model exposes the following API endpoints:

- `GET /health`: Check if the API is running
- `GET /metrics`: Get model metrics (accuracy, last trained date, etc.)
- `GET /weather`: Get current weather data for stations
- `POST /recommendations`: Generate train traffic recommendations
- `POST /predict/delay`: Predict train delays
- `POST /predict/congestion`: Predict section congestion
- `POST /recommend/speed`: Recommend optimal speed
- `POST /train`: Train or retrain the model

## Integration with Frontend

The ML model is integrated with the frontend through the `mlService.ts` service, which provides methods to interact with the ML API endpoints.

## Data Sources

The model uses the following data sources:

- Train timetable data (`train_timetable.json`)
- Station data (`stations.json`)
- Live train status updates from the API
- Weather data from a free weather API

## Model Details

The ML model uses a combination of:

- Random Forest for delay prediction
- Gradient Boosting for congestion prediction
- Neural Networks for optimal speed recommendation
- Decision Trees for routing optimization

These models are trained on historical data and continuously improved with new data.
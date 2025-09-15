import json
import random
import os
from datetime import datetime, timedelta

def generate_mock_train_data(num_trains=30, stations_data=None):
    """Generate mock train data for testing the ML model"""
    if not stations_data:
        # Load stations data
        try:
            stations_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'stations.json')
            with open(stations_file, 'r') as f:
                stations_data = json.load(f)
        except Exception as e:
            print(f"Error loading stations data: {str(e)}")
            stations_data = []
    
    # Load train timetable
    try:
        timetable_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'train_timetable.json')
        with open(timetable_file, 'r') as f:
            train_timetable = json.load(f)
    except Exception as e:
        print(f"Error loading train timetable: {str(e)}")
        train_timetable = {'trains': {}}
    
    train_types = ['Express', 'Superfast', 'Passenger', 'Freight', 'Local']
    statuses = ['running', 'stopped', 'delayed', 'maintenance']
    
    mock_trains = {}
    
    # Use train IDs from timetable if available
    train_ids = list(train_timetable.get('trains', {}).keys())
    
    # If not enough trains in timetable, generate additional IDs
    if len(train_ids) < num_trains:
        additional_ids = [f"train-{i+1:03d}" for i in range(len(train_ids), num_trains)]
        train_ids.extend(additional_ids)
    
    # Limit to requested number of trains
    train_ids = train_ids[:num_trains]
    
    for train_id in train_ids:
        # Get random station
        if stations_data:
            station = random.choice(stations_data)['station'].lower()
        else:
            station = f"station-{random.randint(1, 20)}"
        
        # Generate random delay (weighted towards smaller delays)
        delay_probability = random.random()
        if delay_probability < 0.6:  # 60% chance of small delay
            delay_hours = 0
            delay_minutes = random.randint(0, 15)
        elif delay_probability < 0.85:  # 25% chance of medium delay
            delay_hours = 0
            delay_minutes = random.randint(16, 45)
        elif delay_probability < 0.95:  # 10% chance of large delay
            delay_hours = 0
            delay_minutes = random.randint(46, 90)
        else:  # 5% chance of very large delay
            delay_hours = random.randint(1, 3)
            delay_minutes = random.randint(0, 59)
        
        # Generate train data
        train_data = {
            'id': train_id,
            'type': random.choice(train_types),
            'station': station,
            'status': random.choice(statuses),
            'delayedTime': {
                'hours': str(delay_hours),
                'minutes': str(delay_minutes)
            },
            'lastUpdated': (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat()
        }
        
        mock_trains[train_id] = train_data
    
    return mock_trains

def generate_mock_section_data(stations_data=None):
    """Generate mock section data between stations"""
    if not stations_data:
        # Load stations data
        try:
            stations_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'stations.json')
            with open(stations_file, 'r') as f:
                stations_data = json.load(f)
        except Exception as e:
            print(f"Error loading stations data: {str(e)}")
            return []
    
    sections = []
    
    # Create sections between adjacent stations
    for i in range(len(stations_data) - 1):
        section_id = f"{stations_data[i]['station'].lower()}-{stations_data[i+1]['station'].lower()}"
        
        # Generate random section data
        section_data = {
            'section_id': section_id,
            'start_station': stations_data[i]['station'].lower(),
            'end_station': stations_data[i+1]['station'].lower(),
            'section_length': random.uniform(10, 100),  # km
            'section_type': random.choice(['normal', 'bridge', 'tunnel', 'mountain', 'coastal']),
            'max_speed': random.choice([70, 90, 110, 130]),  # km/h
            'num_tracks': random.randint(1, 4),
            'electrified': random.choice([True, False]),
            'congestion_level': random.randint(10, 90)  # %
        }
        
        sections.append(section_data)
    
    return sections

def save_mock_data():
    """Generate and save mock data for ML model testing"""
    # Load stations data
    try:
        stations_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'stations.json')
        with open(stations_file, 'r') as f:
            stations_data = json.load(f)
    except Exception as e:
        print(f"Error loading stations data: {str(e)}")
        stations_data = []
    
    # Generate mock train data
    mock_trains = generate_mock_train_data(30, stations_data)
    
    # Generate mock section data
    mock_sections = generate_mock_section_data(stations_data)
    
    # Save mock train data
    mock_train_path = os.path.join(os.path.dirname(__file__), 'mock_train_data.json')
    with open(mock_train_path, 'w') as f:
        json.dump(mock_trains, f, indent=2)
    print(f"Saved mock train data to {mock_train_path}")
    
    # Save mock section data
    mock_section_path = os.path.join(os.path.dirname(__file__), 'mock_section_data.json')
    with open(mock_section_path, 'w') as f:
        json.dump(mock_sections, f, indent=2)
    print(f"Saved mock section data to {mock_section_path}")

if __name__ == "__main__":
    save_mock_data()
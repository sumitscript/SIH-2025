import { apiService } from '../services/apiService';
import { mlService } from '../services/mlService';

/**
 * Integration Test Script
 * 
 * This script tests the integration between our application,
 * the Konkan Railway API, and the ML service.
 */

async function testKonkanApiIntegration() {
  console.log('Testing Konkan API Integration...');
  
  try {
    // Test API availability
    const isAvailable = await apiService.checkKonkanApiAvailability();
    console.log(`Konkan API Available: ${isAvailable}`);
    
    if (!isAvailable) {
      console.error('Konkan API is not available. Tests cannot proceed.');
      return false;
    }
    
    // Test fetching trains
    const trainsResponse = await apiService.fetchKonkanTrains();
    console.log(`Successfully fetched ${trainsResponse.trains.length} trains from Konkan API`);
    
    // Test fetching stations
    const stationsResponse = await apiService.fetchKonkanStations();
    console.log(`Successfully fetched ${stationsResponse.stations.length} stations from Konkan API`);
    
    // Test fetching a specific train (using the first train from the list)
    if (trainsResponse.trains.length > 0) {
      const firstTrain = trainsResponse.trains[0];
      const trainDetail = await apiService.fetchKonkanTrainDetails(firstTrain.number);
      console.log(`Successfully fetched details for train ${trainDetail.name}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error testing Konkan API integration:', error);
    return false;
  }
}

async function testMLServiceIntegration() {
  console.log('Testing ML Service Integration...');
  
  try {
    // Test ML service availability
    const isAvailable = await mlService.checkHealth();
    console.log(`ML Service Available: ${isAvailable}`);
    
    if (!isAvailable) {
      console.error('ML Service is not available. Tests cannot proceed.');
      return false;
    }
    
    // Test fetching model metrics
    const metrics = await mlService.getModelMetrics();
    console.log('Successfully fetched model metrics:', metrics);
    
    // Test fetching weather data
    const weatherData = await mlService.getWeatherData();
    console.log('Successfully fetched weather data:', weatherData);
    
    // Test fetching recommendations
    const recommendations = await mlService.getRecommendations();
    console.log(`Successfully fetched ${recommendations.length} recommendations`);
    
    return true;
  } catch (error) {
    console.error('Error testing ML Service integration:', error);
    return false;
  }
}

async function testFullIntegration() {
  console.log('Testing Full Integration Flow...');
  
  try {
    // Check both services
    const konkanAvailable = await apiService.checkKonkanApiAvailability();
    const mlAvailable = await mlService.checkHealth();
    
    if (!konkanAvailable || !mlAvailable) {
      console.error('One or both services unavailable. Full integration test cannot proceed.');
      return false;
    }
    
    // Fetch trains from Konkan API
    const trainsResponse = await apiService.fetchKonkanTrains();
    
    // Fetch recommendations from ML service
    const recommendations = await mlService.getRecommendations();
    
    // Test mapping recommendations to trains
    const trainsWithRecommendations = trainsResponse.trains.map(train => {
      const recommendation = recommendations.find(rec => rec.id === train.number);
      if (recommendation) {
        return {
          ...train,
          recommendation: recommendation.recommendation,
          confidence: recommendation.confidence
        };
      }
      return train;
    });
    
    const trainsWithRecs = trainsWithRecommendations.filter(train => train.recommendation);
    console.log(`Successfully mapped recommendations to ${trainsWithRecs.length} trains`);
    
    return true;
  } catch (error) {
    console.error('Error testing full integration:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting Integration Tests...');
  
  const konkanResult = await testKonkanApiIntegration();
  console.log(`Konkan API Integration Test: ${konkanResult ? 'PASSED' : 'FAILED'}`);
  
  const mlResult = await testMLServiceIntegration();
  console.log(`ML Service Integration Test: ${mlResult ? 'PASSED' : 'FAILED'}`);
  
  const fullResult = await testFullIntegration();
  console.log(`Full Integration Test: ${fullResult ? 'PASSED' : 'FAILED'}`);
  
  console.log('Integration Tests Completed.');
}

// Execute tests
runAllTests();
// Debug script to test Netlify function locally
import { handler } from './netlify/functions/franchises.js';

async function testNetlifyFunction() {
  console.log('Testing Netlify function locally...');
  
  // Simulate Netlify event
  const event = {
    httpMethod: 'GET',
    path: '/api/franchises',
    queryStringParameters: {},
    headers: {},
    body: null
  };
  
  try {
    const response = await handler(event);
    console.log('Response status:', response.statusCode);
    console.log('Response headers:', response.headers);
    
    if (response.body) {
      const data = JSON.parse(response.body);
      console.log('Number of franchises:', data.length);
      console.log('First franchise:', data[0]?.name);
    }
    
    return response;
  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}

testNetlifyFunction();
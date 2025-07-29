#!/usr/bin/env node

/**
 * BazaarBuddy Deployment Test Script
 * Run this script to test your deployment configuration
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  testEmail: 'test@example.com',
  testPassword: 'TestPassword123!'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBackendHealth() {
  log('\n🔍 Testing Backend Health...', 'blue');
  
  try {
    const response = await makeRequest(`${config.backendUrl}/api/health`);
    
    if (response.status === 200) {
      log('✅ Backend is healthy!', 'green');
      log(`   Status: ${response.data.status}`, 'green');
      log(`   Message: ${response.data.message}`, 'green');
      log(`   Timestamp: ${response.data.timestamp}`, 'green');
      return true;
    } else {
      log(`❌ Backend health check failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function testAuthEndpoints() {
  log('\n🔐 Testing Authentication Endpoints...', 'blue');
  
  // Test registration
  try {
    const registerData = {
      name: 'Test User',
      email: config.testEmail,
      password: config.testPassword,
      role: 'vendor',
      phone: '1234567890'
    };

    const registerResponse = await makeRequest(`${config.backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.status === 201) {
      log('✅ Registration endpoint working', 'green');
    } else if (registerResponse.status === 400 && registerResponse.data.message?.includes('already exists')) {
      log('✅ Registration endpoint working (user already exists)', 'yellow');
    } else {
      log(`❌ Registration failed: ${registerResponse.status}`, 'red');
      log(`   Response: ${JSON.stringify(registerResponse.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ Registration request failed: ${error.message}`, 'red');
  }

  // Test login
  try {
    const loginData = {
      email: config.testEmail,
      password: config.testPassword
    };

    const loginResponse = await makeRequest(`${config.backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (loginResponse.status === 200) {
      log('✅ Login endpoint working', 'green');
      return loginResponse.data.token;
    } else {
      log(`❌ Login failed: ${loginResponse.status}`, 'red');
      log(`   Response: ${JSON.stringify(loginResponse.data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Login request failed: ${error.message}`, 'red');
    return null;
  }
}

async function testProtectedEndpoints(token) {
  if (!token) {
    log('\n⚠️  Skipping protected endpoints test (no token)', 'yellow');
    return;
  }

  log('\n🔒 Testing Protected Endpoints...', 'blue');

  // Test vendor products endpoint
  try {
    const productsResponse = await makeRequest(`${config.backendUrl}/api/vendors/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (productsResponse.status === 200) {
      log('✅ Vendor products endpoint working', 'green');
    } else {
      log(`❌ Vendor products failed: ${productsResponse.status}`, 'red');
    }
  } catch (error) {
    log(`❌ Vendor products request failed: ${error.message}`, 'red');
  }
}

async function testCORS() {
  log('\n🌐 Testing CORS Configuration...', 'blue');
  
  try {
    const response = await makeRequest(`${config.backendUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': config.frontendUrl,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    if (response.status === 200 || response.status === 204) {
      log('✅ CORS preflight working', 'green');
    } else {
      log(`❌ CORS preflight failed: ${response.status}`, 'red');
    }
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, 'red');
  }
}

async function runTests() {
  log('🚀 BazaarBuddy Deployment Test', 'blue');
  log('================================', 'blue');
  
  log(`\n📋 Configuration:`, 'blue');
  log(`   Backend URL: ${config.backendUrl}`, 'blue');
  log(`   Frontend URL: ${config.frontendUrl}`, 'blue');
  
  const backendHealthy = await testBackendHealth();
  
  if (!backendHealthy) {
    log('\n❌ Backend is not accessible. Please check:', 'red');
    log('   1. Backend server is running', 'red');
    log('   2. Backend URL is correct', 'red');
    log('   3. Network connectivity', 'red');
    return;
  }

  await testCORS();
  const token = await testAuthEndpoints();
  await testProtectedEndpoints(token);

  log('\n🎉 Deployment test completed!', 'green');
  log('\n📝 Next Steps:', 'blue');
  log('   1. Check browser console for frontend errors', 'blue');
  log('   2. Verify environment variables are set correctly', 'blue');
  log('   3. Test the application manually', 'blue');
}

// Run the tests
runTests().catch(error => {
  log(`\n💥 Test script failed: ${error.message}`, 'red');
  process.exit(1);
}); 
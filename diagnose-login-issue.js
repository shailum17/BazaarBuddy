#!/usr/bin/env node

/**
 * Login Issue Diagnostic Script
 * This script helps identify why login is failing in deployment
 */

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test URLs to check
const testUrls = [
  'https://your-backend-domain.com',
  'https://your-backend-domain.com/api',
  'https://your-backend-domain.com/api/auth/login',
  'https://your-backend-domain.com/api/test',
  'https://your-backend-domain.com/health'
];

// Common deployment URLs to test
const commonBackendUrls = [
  'https://bazaarbuddy-backend.railway.app',
  'https://bazaarbuddy-backend.onrender.com',
  'https://bazaarbuddy-backend.herokuapp.com',
  'https://bazaarbuddy-api.railway.app',
  'https://bazaarbuddy-api.onrender.com',
  'https://bazaarbuddy-api.herokuapp.com'
];

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BazaarBuddy-Diagnostic/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        url: url,
        code: error.code
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        url: url,
        code: 'TIMEOUT'
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testBackendHealth(url) {
  try {
    logInfo(`Testing: ${url}`);
    const response = await makeRequest(url);
    
    if (response.statusCode === 200) {
      logSuccess(`✅ ${url} - Status: ${response.statusCode}`);
      return { url, status: 'success', response };
    } else {
      logWarning(`⚠️  ${url} - Status: ${response.statusCode}`);
      return { url, status: 'warning', response };
    }
  } catch (error) {
    logError(`❌ ${url} - Error: ${error.error || error.message}`);
    return { url, status: 'error', error };
  }
}

async function testLoginEndpoint(baseUrl) {
  const loginUrl = `${baseUrl}/api/auth/login`;
  const testData = {
    email: 'test@example.com',
    password: 'testpassword'
  };

  try {
    logInfo(`Testing login endpoint: ${loginUrl}`);
    const response = await makeRequest(loginUrl, 'POST', testData);
    
    if (response.statusCode === 400 || response.statusCode === 401) {
      logSuccess(`✅ Login endpoint working (expected error for test credentials): ${response.statusCode}`);
      return { url: loginUrl, status: 'success', response };
    } else if (response.statusCode === 200) {
      logWarning(`⚠️  Login endpoint working but should require valid credentials: ${response.statusCode}`);
      return { url: loginUrl, status: 'warning', response };
    } else {
      logWarning(`⚠️  Login endpoint returned unexpected status: ${response.statusCode}`);
      return { url: loginUrl, status: 'warning', response };
    }
  } catch (error) {
    logError(`❌ Login endpoint failed: ${error.error || error.message}`);
    return { url: loginUrl, status: 'error', error };
  }
}

async function checkCorsHeaders(url) {
  try {
    logInfo(`Checking CORS headers: ${url}`);
    const response = await makeRequest(url, 'OPTIONS');
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials']
    };

    logInfo(`CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`);
    
    if (corsHeaders['access-control-allow-origin']) {
      logSuccess(`✅ CORS configured`);
      return { status: 'success', headers: corsHeaders };
    } else {
      logWarning(`⚠️  CORS headers missing or incomplete`);
      return { status: 'warning', headers: corsHeaders };
    }
  } catch (error) {
    logError(`❌ CORS check failed: ${error.error || error.message}`);
    return { status: 'error', error };
  }
}

async function main() {
  log('🔍 BazaarBuddy Login Issue Diagnostic', 'bold');
  log('=====================================', 'bold');
  log('');

  log('📋 Common Issues:', 'bold');
  log('1. Environment variables not set correctly');
  log('2. Backend URL not accessible');
  log('3. CORS configuration issues');
  log('4. Network connectivity problems');
  log('5. Backend service not running');
  log('');

  // Test placeholder URL first
  log('🔍 Testing placeholder URL (this should fail):', 'bold');
  const placeholderResult = await testBackendHealth('https://your-backend-domain.com');
  log('');

  // Test common deployment URLs
  log('🔍 Testing common deployment URLs:', 'bold');
  const results = [];
  
  for (const url of commonBackendUrls) {
    const result = await testBackendHealth(url);
    results.push(result);
    
    if (result.status === 'success') {
      // Test login endpoint if backend is accessible
      await testLoginEndpoint(url);
      await checkCorsHeaders(url);
    }
    
    log(''); // Add spacing
  }

  // Summary
  log('📊 SUMMARY:', 'bold');
  log('==========', 'bold');
  
  const successfulUrls = results.filter(r => r.status === 'success');
  const failedUrls = results.filter(r => r.status === 'error');
  
  if (successfulUrls.length > 0) {
    logSuccess(`Found ${successfulUrls.length} working backend URL(s):`);
    successfulUrls.forEach(r => log(`  - ${r.url}`, 'green'));
  }
  
  if (failedUrls.length > 0) {
    logWarning(`Found ${failedUrls.length} failed URL(s):`);
    failedUrls.forEach(r => log(`  - ${r.url}`, 'yellow'));
  }

  log('');
  log('🔧 NEXT STEPS:', 'bold');
  log('==============', 'bold');
  
  if (successfulUrls.length > 0) {
    logSuccess('1. Use one of the working backend URLs as your VITE_API_URL');
    logSuccess('2. Set the environment variable in your frontend deployment');
    logSuccess('3. Redeploy your frontend application');
  } else {
    logError('1. No working backend URLs found');
    logError('2. Check if your backend is deployed and running');
    logError('3. Verify your backend deployment platform');
    logError('4. Check backend logs for errors');
  }
  
  log('');
  log('📝 ENVIRONMENT VARIABLE SETUP:', 'bold');
  log('==============================', 'bold');
  log('Frontend (Vercel/Netlify): VITE_API_URL=https://your-working-backend-url.com');
  log('Backend: CLIENT_URL=https://your-frontend-url.com');
  log('');
  log('💡 TIP: Check your browser console for the exact error message!', 'cyan');
}

// Run the diagnostic
main().catch(console.error); 
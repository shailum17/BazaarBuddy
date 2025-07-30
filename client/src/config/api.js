// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // In development, use the proxy
    return '/api';
  }
  
  // In production, use the environment variable
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Debug information (always log in production to help with troubleshooting)
  console.log('🔍 API Configuration Debug:');
  console.log('  Environment:', import.meta.env.MODE);
  console.log('  VITE_API_URL:', apiUrl);
  console.log('  DEV mode:', import.meta.env.DEV);
  
  if (apiUrl && apiUrl !== 'https://your-backend-domain.com') {
    // Remove trailing slash if present
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const finalUrl = `${cleanUrl}/api`;
    console.log('  ✅ Using configured API URL:', finalUrl);
    return finalUrl;
  }
  
  // If no valid API URL is set, show detailed error
  console.error('❌ VITE_API_URL not set correctly in production!');
  console.error('Current value:', apiUrl);
  console.error('');
  console.error('🔧 TO FIX THIS:');
  console.error('1. Go to your frontend deployment platform (Vercel/Netlify/etc.)');
  console.error('2. Add environment variable: VITE_API_URL=https://your-backend-url.com');
  console.error('3. Replace "your-backend-url.com" with your actual backend domain');
  console.error('4. Redeploy your application');
  console.error('');
  console.error('📋 Common backend URLs:');
  console.error('  - Railway: https://your-app.railway.app');
  console.error('  - Render: https://your-app.onrender.com');
  console.error('  - Heroku: https://your-app.herokuapp.com');
  console.error('');
  console.error('⚠️  Using fallback URL (this will likely fail): /api');
  
  // Fallback to development proxy (this will fail in production but prevents the placeholder URL)
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Always log the final API URL for debugging
console.log('🚀 Final API Base URL:', API_BASE_URL); 
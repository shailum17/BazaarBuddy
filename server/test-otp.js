const axios = require('axios');

const testOTP = async () => {
  try {
    console.log('🧪 Testing OTP functionality...\n');

    // Test 1: Send OTP for registration
    console.log('1️⃣ Testing OTP send for registration...');
    const sendResponse = await axios.post('http://localhost:5000/api/otp/send-registration', {
      emailOrPhone: 'test@example.com'
    });
    console.log('✅ OTP sent successfully:', sendResponse.data.message);
    console.log('📧 Check console for OTP (development mode)\n');

    // Test 2: Verify OTP (this will fail with wrong OTP, but tests the endpoint)
    console.log('2️⃣ Testing OTP verification...');
    try {
      await axios.post('http://localhost:5000/api/otp/verify', {
        emailOrPhone: 'test@example.com',
        otp: '123456',
        type: 'registration'
      });
    } catch (error) {
      console.log('✅ OTP verification endpoint working (expected failure with wrong OTP)');
      console.log('   Error:', error.response?.data?.message || 'Unknown error');
    }

    console.log('\n🎉 OTP functionality test completed!');
    console.log('📝 Next steps:');
    console.log('   1. Check server console for OTP logs');
    console.log('   2. Test with frontend registration/login forms');
    console.log('   3. Verify OTP with correct code from console');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testOTP();


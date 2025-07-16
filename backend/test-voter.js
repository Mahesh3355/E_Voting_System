const axios = require("axios");

const API_BASE_URL = "http://localhost:5000";

// Test voter data
const testVoter = {
  fullName: "John Doe",
  registrationNumber: "2024001",
  email: "john.doe@example.com",
  degree: "B.Tech",
};

async function testVoterRegistration() {
  try {
    console.log("🔧 Testing Voter Registration...\n");

    // Step 1: Send OTP
    console.log("📧 Sending OTP...");
    const otpResponse = await axios.post(
      `${API_BASE_URL}/api/voter/send-otp`,
      testVoter
    );
    console.log("✅ OTP sent successfully:", otpResponse.data.message);

    // For testing purposes, we'll use a mock OTP
    // In real scenario, you'd check your email for the OTP
    const mockOTP = "123456"; // This is just for testing

    console.log("\n🔐 Verifying OTP...");
    const verifyResponse = await axios.post(
      `${API_BASE_URL}/api/voter/verify-otp`,
      {
        email: testVoter.email,
        otp: mockOTP,
      }
    );

    console.log(
      "✅ Voter registered successfully:",
      verifyResponse.data.message
    );
    console.log("\n📋 Voter Details:");
    console.log("- Name:", testVoter.fullName);
    console.log("- Email:", testVoter.email);
    console.log("- Registration Number:", testVoter.registrationNumber);
    console.log("- Degree:", testVoter.degree);
  } catch (error) {
    console.error("❌ Error:", error.response?.data?.message || error.message);

    if (error.response?.status === 400) {
      console.log("\n💡 This might be because:");
      console.log("- Email already registered");
      console.log("- Invalid OTP (use the actual OTP from your email)");
      console.log("- Missing required fields");
    }
  }
}

// Run the test
testVoterRegistration();

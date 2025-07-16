const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("📧 Testing Email Configuration...\n");

// Check environment variables
console.log("Email User:", process.env.EMAIL_USER || "NOT SET");
console.log("Email Pass:", process.env.EMAIL_PASS ? "SET" : "NOT SET");
console.log("");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log("❌ Email configuration incomplete!");
  console.log("Please set EMAIL_USER and EMAIL_PASS in your .env file");
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email
const testEmail = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself for testing
  subject: "Test Email - Voting System",
  text: "This is a test email to verify your email configuration is working correctly.",
};

console.log("📤 Sending test email...");

transporter.sendMail(testEmail, (error, info) => {
  if (error) {
    console.log("❌ Email test failed:", error.message);
    console.log("\n💡 Common issues:");
    console.log("- Use Gmail app password, not regular password");
    console.log("- Enable 2-factor authentication on Gmail");
    console.log("- Check if EMAIL_USER is correct");
  } else {
    console.log("✅ Test email sent successfully!");
    console.log("📧 Check your inbox for the test email");
    console.log("Message ID:", info.messageId);
  }
});

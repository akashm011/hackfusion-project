import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your Gmail ID
    pass: process.env.EMAIL_PASSWORD, // Your Gmail password
  },
});

// Store OTPs temporarily (For production, use Redis or DB)
const otpStore = new Map();

// Function to generate and store OTP
export const generateOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Expires in 5 mins
  return otp;
};

// Function to send OTP via email
export const sendOTPEmail = async (to) => {
  const otp = generateOTP(to);
  const mailOptions = {
    from: "SGGS Election Commitee",
    to,
    subject: "Your Voting OTP",
    text: `Your OTP for voting is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error(`Error sending OTP to ${to}:`, error);
  }
};

// Function to verify OTP
export const verifyOTP = (email, otp) => {
  const storedOTP = otpStore.get(email);
  if (!storedOTP) return false;
  if (storedOTP.expiresAt < Date.now()) {
    otpStore.delete(email);
    return false;
  }
  if (storedOTP.otp !== otp) return false;

  otpStore.delete(email); // OTP used, remove it
  return true;
};

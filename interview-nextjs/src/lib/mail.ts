import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordSetEmail(email: string, name: string, token: string) {
  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Set your password for Fluent Hire",
    html: `
      <h1>Welcome to Fluent Hire, ${name}!</h1>
      <p>You have been invited as a candidate. Please click the link below to set your password and access your interview:</p>
      <a href="${setPasswordUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Set Password</a>
      <p>If you did not expect this invitation, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Detailed Email Error:", error);
    // Log the actual error instead of just throwing a generic one
    throw error;
  }
}

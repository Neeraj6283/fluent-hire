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
    throw error;
  }
}

export async function sendRescheduleEmail(email: string, name: string, interviewTitle: string, date: string, time: string, interviewId: string) {
  const interviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interviewId}`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `Interview Rescheduled: ${interviewTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0070f3;">Hello ${name},</h2>
        <p>Your interview for <strong>${interviewTitle}</strong> has been rescheduled because you were unable to attend the previous session on time.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>New Date:</strong> ${date}</p>
          <p style="margin: 5px 0 0 0;"><strong>New Time:</strong> ${time} (IST)</p>
        </div>
        <p style="color: #e11d48; font-weight: bold;">Important: Please ensure you are on time for this session.</p>
        <p>You can join the interview directly by clicking the button below:</p>
        <a href="${interviewUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Start Interview</a>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">If you have any questions, please reply to this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reschedule email sent to ${email}`);
  } catch (error) {
    console.error("Reschedule Email Error:", error);
    throw error;
  }
}

export async function sendNewInterviewEmail(email: string, name: string, interviewTitle: string, date: string, time: string, interviewId: string) {
  const interviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/candidate`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `New Interview Scheduled: ${interviewTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0070f3;">Hello ${name},</h2>
        <p>A new interview for <strong>${interviewTitle}</strong> has been scheduled for you.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0 0 0;"><strong>Time:</strong> ${time} (IST)</p>
        </div>
        <p>You can access your dashboard and start the interview at the scheduled time by clicking the button below:</p>
        <a href="${interviewUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">If you have any questions, please reply to this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`New interview email sent to ${email}`);
  } catch (error) {
    console.error("New Interview Email Error:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Reset your password for Fluent Hire",
    html: `
      <h1>Hello ${name},</h1>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email. The link will expire in 1 hour.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error("Detailed Email Error:", error);
    throw error;
  }
}

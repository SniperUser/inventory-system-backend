import nodemailer from "nodemailer";
import db from "../config/db.js";

export const sendEmail = async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"System Notification" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`📧 Email successfully sent to ${to}`);
    res.json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("❌ Email error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// src/backend/controller/nodemailerTransporter.js
// Purpose: sends outgoing emails (notifications, alerts, etc.)
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const avastCert = fs.readFileSync(
  path.join(__dirname, "../certs/avast-root.cer")
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ca: [avastCert],
    rejectUnauthorized: true,
  },
});

module.exports = transporter;

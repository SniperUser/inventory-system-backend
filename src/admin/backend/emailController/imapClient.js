// src/backend/controller/imapClient.js
// Purpose: connects to Gmail’s inbox to read or monitor incoming emails.
const imaps = require("imap-simple");
const fs = require("fs");
const path = require("path");

const avastCert = fs.readFileSync(
  path.join(__dirname, "../certs/avast-root.cer")
);

const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: true, // Let Node verify normally
    },
    authTimeout: 10000,
  },
};

const connectToInbox = async () => {
  try {
    const connection = await imaps.connect({ imap: config.imap });
    await connection.openBox("INBOX");
    return connection;
  } catch (err) {
    console.error("IMAP connection failed:", err);
    throw err;
  }
};

module.exports = connectToInbox;

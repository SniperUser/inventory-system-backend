// src/backend/controller/sentEmailController.js
import imaps from "imap-simple";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { simpleParser } from "mailparser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Avast root certificate (optional, if you're using it for TLS)
const certPath = path.join(__dirname, "../certs/avast-root.pem");
let avastRootCert;
try {
  avastRootCert = fs.readFileSync(certPath);
} catch (error) {
  console.warn("⚠️ Could not read Avast cert (continuing without it):", error.message);
}

const commonImapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: {
    ca: avastRootCert ? [avastRootCert] : [],
    rejectUnauthorized: false,
  },
  authTimeout: 10000,
};

export const getSentEmails = async (req, res) => {
  const config = { imap: { ...commonImapConfig } };
  let connection;

  try {
    connection = await imaps.connect(config);

    // Open Gmail's sent mail folder
    await connection.openBox("[Gmail]/Sent Mail");

    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: [""], // raw full message
      struct: true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const formattedEmails = await Promise.all(
      messages.map(async (msg) => {
        const rawPart = msg.parts.find((part) => part.which === "");
        if (!rawPart?.body) return null;

        try {
          const parsed = await simpleParser(rawPart.body);
          return {
            uid: msg.attributes.uid,
            from: parsed.from?.text || "Unknown sender",
            to: parsed.to?.text || "",
            subject: parsed.subject || "(No subject)",
            date: parsed.date ? new Date(parsed.date).toISOString() : "(No date)",
            text: parsed.text || "(No plain text content)",
            html: parsed.html || "",
            seen: msg.attributes.flags?.includes("\\Seen") || false,
          };
        } catch (err) {
          console.warn("⚠️ Failed to parse sent email:", err.message);
          return null;
        }
      })
    );

    const filtered = formattedEmails.filter((e) => e !== null);
    res.status(200).json(filtered);
  } catch (error) {
    console.error("❌ Error fetching sent emails:", error);
    res.status(500).json({ error: "Failed to fetch sent emails" });
  } finally {
    if (connection) await connection.end();
  }
};

import imaps from 'imap-simple';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { simpleParser } from 'mailparser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Avast root certificate
const certPath = path.join(__dirname, '../certs/avast-root.pem');
let avastRootCert;

try {
  avastRootCert = fs.readFileSync(certPath);
} catch (error) {
  console.error('❌ Failed to read certificate:', error.message);
}

export const getInboxEmails = async (req, res) => {
  const config = {
    imap: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: {
        ca: avastRootCert ? [avastRootCert] : [],
        rejectUnauthorized: false,
      },
      authTimeout: 10000,
    },
  };

  let connection;

  try {
    connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: [''], // Full raw RFC822 message
      struct: true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const formattedEmails = await Promise.all(
      messages.map(async (msg) => {
        const rawPart = msg.parts.find(part => part.which === '');
        if (!rawPart?.body) return null;

        try {
          const parsed = await simpleParser(rawPart.body);

          return {
            uid: msg.attributes.uid,
            from: parsed.from?.text || 'Unknown sender',
            subject: parsed.subject || '(No subject)',
            date: parsed.date ? new Date(parsed.date).toISOString() : '(No date)',
            text: parsed.text || '(No plain text content)',
            html: parsed.html || '',
            seen: msg.attributes.flags?.includes('\\Seen') || false,
          };
        } catch (err) {
          console.warn('⚠️ Failed to parse email:', err.message);
          return null;
        }
      })
    );

    const filteredEmails = formattedEmails.filter(email => email !== null);
    res.status(200).json(filteredEmails);
  } catch (error) {
    console.error('❌ Error fetching inbox:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  } finally {
    if (connection) await connection.end();
  }
};

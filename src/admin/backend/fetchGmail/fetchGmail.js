// backend/utils/fetchGmail.js
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const db = require('../db'); // your MySQL connection

const fetchGmail = () => {
  const imap = new Imap({
    user: process.env.GMAIL_USER,    
    password: process.env.GMAIL_PASS, 
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  });

  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }

  imap.once('ready', () => {
    openInbox((err, box) => {
      if (err) throw err;

      // fetch latest 10 emails
      const f = imap.seq.fetch(`${box.messages.total - 9}:*`, {
        bodies: '',
        struct: true,
      });

      f.on('message', (msg, seqno) => {
        msg.on('body', async (stream) => {
          try {
            const parsed = await simpleParser(stream);
            const from = parsed.from?.text || '';
            const to = parsed.to?.text || '';
            const subject = parsed.subject || '';
            const body = parsed.text || '';

            // Check if email already exists (avoid duplicates)
            const checkQuery = `SELECT * FROM emails WHERE \`from\` = ? AND \`to\` = ? AND subject = ? AND body = ?`;
            db.query(checkQuery, [from, to, subject, body], (err, results) => {
              if (err) return console.error('DB check error:', err);
              if (results.length === 0) {
                const insertQuery = `
                  INSERT INTO emails (\`from\`, \`to\`, subject, body, folder, created_at)
                  VALUES (?, ?, ?, ?, 'inbox', NOW())
                `;
                db.query(insertQuery, [from, to, subject, body], (err) => {
                  if (err) console.error('Insert error:', err);
                  else console.log(`📥 Email saved: ${subject}`);
                });
              }
            });
          } catch (err) {
            console.error('Parsing error:', err);
          }
        });
      });

      f.once('error', (err) => {
        console.error('Fetch error:', err);
      });

      f.once('end', () => {
        console.log('✅ Done fetching emails');
        imap.end();
      });
    });
  });

  imap.once('error', (err) => {
    console.error('IMAP error:', err);
  });

  imap.once('end', () => {
    console.log('Connection closed');
  });

  imap.connect();
};

module.exports = fetchGmail;

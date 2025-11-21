import imaps from "imap-simple";

export const markEmailAsRead = async (req, res) => {
  const uid = req.params.uid;
  if (!uid) {
    return res.status(400).json({ error: 'Missing UID' });
  }

  const config = {
    imap: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false,
      },
      authTimeout: 10000,
    },
  };

  let connection;

  try {
    connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    // Mark the email as read using UID
    await connection.addFlags(uid, ['\\Seen']);

    res.status(200).json({ message: `Email with UID ${uid} marked as read.` });
  } catch (error) {
    console.error('❌ Error marking email as read:', error);
    res.status(500).json({ error: 'Failed to mark email as read' });
  } finally {
    if (connection) await connection.end();
  }
};

// src/backend/controller/deleteEmailController.js
import imaps from "imap-simple";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// optional cert loading
const certPath = path.join(__dirname, "../certs/avast-root.pem");
let avastRootCert;
try {
  avastRootCert = fs.readFileSync(certPath);
} catch (err) {
  console.warn("⚠️ Could not load certificate, continuing without it:", err.message);
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

/**
 * Move from inbox/sent/drafts to Trash (COPY + flag + expunge fallback).
 * DELETE /api/email/delete/:uid?folder=inbox
 */
export const moveToTrash = async (req, res) => {
  const { uid } = req.params;
  const { folder } = req.query;
  if (!uid) return res.status(400).json({ error: "Missing uid parameter" });

  const folderMap = {
    inbox: "INBOX",
    sent: "[Gmail]/Sent Mail",
    drafts: "[Gmail]/Drafts",
  };
  const sourceBox = folderMap[(folder || "").toLowerCase()] || "INBOX";

  let connection;
  try {
    connection = await imaps.connect({ imap: { ...commonImapConfig } });
    await connection.openBox(sourceBox);

    const imap = connection.imap;
    const supportsMove = typeof imap.move === "function" && (imap.serverSupports && imap.serverSupports("MOVE"));

    if (supportsMove) {
      await new Promise((resolve, reject) => {
        imap.move(uid, "[Gmail]/Trash", (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } else {
      await new Promise((resolve, reject) => {
        imap.uid("COPY", uid, "[Gmail]/Trash", (copyErr) => {
          if (copyErr) return reject(copyErr);
          imap.uid("STORE", uid, "+FLAGS", "\\Deleted", (flagErr) => {
            if (flagErr) return reject(flagErr);
            imap.expunge((expErr) => {
              if (expErr) return reject(expErr);
              resolve();
            });
          });
        });
      });
    }

    res.status(200).json({ success: true, movedFrom: sourceBox });
  } catch (error) {
    console.error("❌ Error moving email to trash:", error);
    res.status(500).json({ error: "Failed to move email to trash" });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Restore from Trash back to Inbox.
 * POST /api/email/trash/restore/:uid
 */
export const restoreFromTrash = async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: "Missing uid parameter" });

  let connection;
  try {
    connection = await imaps.connect({ imap: { ...commonImapConfig } });
    await connection.openBox("[Gmail]/Trash");
    const imap = connection.imap;

    await new Promise((resolve, reject) => {
      imap.uid("COPY", uid, "INBOX", (copyErr) => {
        if (copyErr) return reject(copyErr);
        imap.uid("STORE", uid, "+FLAGS", "\\Deleted", (flagErr) => {
          if (flagErr) return reject(flagErr);
          imap.expunge((expErr) => {
            if (expErr) return reject(expErr);
            resolve();
          });
        });
      });
    });

    res.status(200).json({ success: true, restoredUid: uid });
  } catch (error) {
    console.error("❌ Error restoring email from trash:", error);
    res.status(500).json({ error: "Failed to restore email" });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Permanently delete from Trash.
 * DELETE /api/email/trash/permanent/:uid
 */
export const permanentlyDelete = async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: "Missing uid parameter" });

  let connection;
  try {
    connection = await imaps.connect({ imap: { ...commonImapConfig } });
    await connection.openBox("[Gmail]/Trash");
    const imap = connection.imap;

    await new Promise((resolve, reject) => {
      imap.uid("STORE", uid, "+FLAGS", "\\Deleted", (flagErr) => {
        if (flagErr) return reject(flagErr);
        imap.expunge((expErr) => {
          if (expErr) return reject(expErr);
          resolve();
        });
      });
    });

    res.status(200).json({ success: true, deletedUid: uid });
  } catch (error) {
    console.error("❌ Error permanently deleting email:", error);
    res.status(500).json({ error: "Failed to permanently delete email" });
  } finally {
    if (connection) await connection.end();
  }
};

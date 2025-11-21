// src/context/EmailContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
  const [emails, setEmails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/email/inbox");
      const inbox = Array.isArray(res.data) ? res.data : [];
      setEmails(inbox);
      setUnreadCount(inbox.filter((e) => !e.seen).length);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 30000); // keep in sync
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (email) => {
    if (!email?.uid || email.seen) return;
    try {
      await axios.put(
        `http://localhost:5000/api/email/mark-as-read/${email.uid}`
      );
      setEmails((prev) =>
        prev.map((e) => (e.uid === email.uid ? { ...e, seen: true } : e))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark email as read:", error);
    }
  };

  const deleteEmail = async (email) => {
    if (!email?.uid) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/email/delete/${email.uid}?folder=inbox`
      );
      setEmails((prev) => prev.filter((e) => e.uid !== email.uid));
      if (!email.seen) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete email:", err);
    }
  };

  const restoreFromTrash = async (uid) => {
    if (!uid) return;
    try {
      await axios.post(
        `http://localhost:5000/api/email/trash/restore/${uid}`
      );
      await fetchInbox(); // bring restored email back into inbox state
    } catch (err) {
      console.error("Failed to restore email from trash:", err);
    }
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        unreadCount,
        loading,
        fetchInbox,
        markAsRead,
        deleteEmail,
        restoreFromTrash,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

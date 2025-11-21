import React, { useContext, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner, Badge } from "react-bootstrap";
import { ThemeContext } from "../../context/themeContext.js";
import { EmailContext } from "../../context/EmailContext.js";

const Inbox = () => {
  const { theme } = useContext(ThemeContext);
  const {
    emails,
    unreadCount,
    loading,
    markAsRead,
    deleteEmail: contextDeleteEmail,
    fetchInbox,
  } = useContext(EmailContext) || {};

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [filter, setFilter] = useState("");

  const handleRowClick = (email) => {
    setSelectedEmail(email);
    markAsRead?.(email);
  };

  const handleReply = () => {
    setReplyMessage("");
    setShowReplyModal(true);
  };

  const handleSendReply = () => {
    console.log("Replying with:", replyMessage);
    setShowReplyModal(false);
  };

  const confirmDelete = async () => {
    if (!selectedEmail?.uid) return;
    try {
      if (typeof contextDeleteEmail === "function") {
        await contextDeleteEmail(selectedEmail);
      } else {
        await axios.delete(
          `http://localhost:5000/api/email/delete/${selectedEmail.uid}?folder=inbox`
        );
        if (typeof fetchInbox === "function") {
          await fetchInbox();
        }
      }
      setSelectedEmail(null);
      setShowConfirmDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete email:", err);
    }
  };

  const filteredEmails = (emails || []).filter((email) =>
    (email.subject || "").toLowerCase().includes(filter.toLowerCase()) ||
    (email.from || "").toLowerCase().includes(filter.toLowerCase())
  );

  const modalStyle = {
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)",
    border: "1px solid var(--border-color)",
  };

  const messageContentStyle = {
    whiteSpace: "pre-wrap",
    color: "var(--text-color)",
  };

  return (
    <div
      className={`theme-${theme} p-4 rounded`}
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <span
            className="px-2 py-1 rounded"
            style={{ backgroundColor: "var(--bgIconPOS)", color: "#fff" }}
          >
            📥 Inbox
          </span>
          {unreadCount > 0 && (
            <Badge
              pill
              className="ms-2"
              style={{ backgroundColor: "var(--bgIconPOS)", color: "#fff" }}
            >
              {unreadCount}
            </Badge>
          )}
        </h2>

        <Form.Control
          type="text"
          placeholder="🔍 Search emails..."
          className="w-50"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            backgroundColor: "var(--bg-color)",
            color: "var(--text-color)",
            border: "1px solid var(--border-color)",
          }}
        />
      </div>

      {/* Email List */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" style={{ color: "var(--text-color)" }} />
          <p className="mt-2">Loading emails...</p>
        </div>
      ) : filteredEmails.length === 0 ? (
        <div className="text-center" style={{ color: "var(--text-color)" }}>
          No emails found.
        </div>
      ) : (
        <div className="list-group">
          {filteredEmails.map((email, idx) => {
            const { from, subject, date, text, seen } = email;
            return (
              <div
                key={idx}
                className="list-group-item list-group-item-action mb-3 rounded shadow-sm"
                style={{
                  cursor: "pointer",
                  fontWeight: !seen ? "bold" : "normal",
                  borderLeft: !seen
                    ? "4px solid var(--bgIconPOS)"
                    : "4px solid transparent",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
                onClick={() => handleRowClick(email)}
              >
                <div className="d-flex justify-content-between">
                  <span>{from || "Unknown sender"}</span>
                  <small style={{ color: "var(--text-color)" }}>
                    {date ? new Date(date).toLocaleString() : "(No date)"}
                  </small>
                </div>
                <div className="fw-semibold text-primary">
                  {subject || "(No subject)"}
                </div>
                <div style={{ color: "var(--text-color)", opacity: 0.75 }}>
                  {text
                    ? text.slice(0, 100) + (text.length > 100 ? "..." : "")
                    : "(No content)"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Email Detail Modal */}
      <Modal show={!!selectedEmail} onHide={() => setSelectedEmail(null)} size="lg" centered>
        <Modal.Header closeButton style={modalStyle}>
          <Modal.Title>Email Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={modalStyle}>
          <p><strong>From:</strong> {selectedEmail?.from || "Unknown sender"}</p>
          <p><strong>Subject:</strong> {selectedEmail?.subject || "(No subject)"}</p>
          <p><strong>Date:</strong> {selectedEmail?.date ? new Date(selectedEmail.date).toLocaleString() : "(No date)"}</p>
          <hr />
          <div
            style={messageContentStyle}
            dangerouslySetInnerHTML={{
              __html: selectedEmail?.html || selectedEmail?.text || "(No content)",
            }}
          />
        </Modal.Body>
        <Modal.Footer style={modalStyle}>
          <Button variant="secondary" onClick={() => setSelectedEmail(null)}>Close</Button>
          <Button variant="danger" onClick={() => setShowConfirmDeleteModal(true)}>Delete</Button>
          <Button variant="primary" onClick={handleReply}>Reply</Button>
        </Modal.Footer>
      </Modal>

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
        <Modal.Header closeButton style={modalStyle}>
          <Modal.Title>Reply to {selectedEmail?.from || "Unknown sender"}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={modalStyle}>
          <Form.Group controlId="replyMessage">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Type your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={modalStyle}>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSendReply}>Send Reply</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal show={showConfirmDeleteModal} onHide={() => setShowConfirmDeleteModal(false)} centered>
        <Modal.Header closeButton style={modalStyle}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body style={modalStyle}>
          Are you sure you want to move this email to Trash?
        </Modal.Body>
        <Modal.Footer style={modalStyle}>
          <Button variant="secondary" onClick={() => setShowConfirmDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Inbox;

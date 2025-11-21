import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../../context/themeContext.js";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const Trash = () => {
  const { theme } = useContext(ThemeContext);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/email/trash");
        setEmails(res.data);
      } catch (error) {
        console.error("❌ Error fetching trash emails:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrash();
  }, []);

  const filtered = emails.filter((email) =>
    (email.subject || "").toLowerCase().includes(filter.toLowerCase()) ||
    (email.from || "").toLowerCase().includes(filter.toLowerCase())
  );

  const containerStyle = {
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)",
    border: "1px solid var(--border-color)",
  };

  const cardStyle = {
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)",
    border: "1px solid var(--border-color)",
  };

  return (
    <div className={`theme-${theme} p-4 rounded`} style={containerStyle}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🗑️ Trash</h2>
        <Form.Control
          type="text"
          placeholder="🔍 Search trash..."
          className="w-50"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={cardStyle}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" style={{ color: "var(--text-color)" }} />
          <p className="mt-2">Loading trash emails...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center" style={{ opacity: 0.6 }}>
          No trashed emails.
        </div>
      ) : (
        <div className="list-group">
          {filtered.map((email, idx) => {
            const from = email.from || "Unknown sender";
            const subject = email.subject || "(No subject)";
            const date = email.date ? new Date(email.date).toLocaleString() : "(No date)";
            const snippet = email.text
              ? email.text.slice(0, 80) + (email.text.length > 80 ? "..." : "")
              : "(No content)";

            return (
              <div
                key={idx}
                className="list-group-item list-group-item-action mb-2 rounded shadow-sm"
                style={{ ...cardStyle, cursor: "pointer" }}
                onClick={() => setSelectedEmail(email)}
              >
                <div className="d-flex justify-content-between">
                  <strong>{from}</strong>
                  <small style={{ color: "var(--text-color)", opacity: 0.75 }}>{date}</small>
                </div>
                <div className="fw-semibold text-primary">{subject}</div>
                <div style={{ opacity: 0.8 }}>{snippet}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        show={!!selectedEmail}
        onHide={() => setSelectedEmail(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={cardStyle}>
          <Modal.Title>Trashed Email</Modal.Title>
        </Modal.Header>
        <Modal.Body style={cardStyle}>
          <p><strong>From:</strong> {selectedEmail?.from || "Unknown sender"}</p>
          <p><strong>Subject:</strong> {selectedEmail?.subject || "(No subject)"}</p>
          <p><strong>Date:</strong> {selectedEmail?.date ? new Date(selectedEmail.date).toLocaleString() : "(No date)"}</p>
          <hr />
          <div
            style={{ whiteSpace: "pre-wrap", color: "var(--text-color)" }}
            dangerouslySetInnerHTML={{
              __html: selectedEmail?.html || selectedEmail?.text || "(No content)",
            }}
          />
        </Modal.Body>
        <Modal.Footer style={cardStyle}>
          <Button variant="secondary" onClick={() => setSelectedEmail(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Trash;

import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../context/themeContext.js';

function EmailPage() {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState({ to: '', subject: '', message: '' });
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => {
    setEmail({ ...email, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.to || !email.subject || !email.message) {
      setFeedback('⚠️ All fields are required.');
      return;
    }

    setLoading(true);
    setFeedback('');

    try {
      const response = await fetch('http://localhost:5000/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSentEmails([{ ...email, id: Date.now() }, ...sentEmails]);
        setEmail({ to: '', subject: '', message: '' });
        setFeedback('✅ Email sent successfully!');
      } else {
        setFeedback(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Email send error:', error);
      setFeedback('❌ Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const themedStyle = {
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    border: '1px solid var(--border-color)',
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    border: '1px solid var(--border-color)',
  };

  return (
    <div className={`theme-${theme} container mt-4 p-4 rounded shadow`} style={themedStyle}>
      <h2 className="mb-1">
        <i className="bi bi-envelope-fill me-2"></i>Email Center
      </h2>

      <hr />

      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">To:</label>
          <input
            type="email"
            name="to"
            className="form-control"
            style={inputStyle}
            placeholder="recipient@example.com"
            value={email.to}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Subject:</label>
          <input
            type="text"
            name="subject"
            className="form-control"
            style={inputStyle}
            placeholder="Subject"
            value={email.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Message:</label>
          <textarea
            name="message"
            rows="5"
            className="form-control"
            style={inputStyle}
            placeholder="Write your message..."
            value={email.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary d-flex align-items-center gap-2"
          disabled={loading || !email.to || !email.subject || !email.message}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Sending...
            </>
          ) : (
            <>
              <i className="bi bi-send-fill"></i> Send Email
            </>
          )}
        </button>
      </form>

      {feedback && (
        <div
          className={`mt-4 alert fade-in ${
            feedback.startsWith('✅') ? 'alert-success' : 'alert-danger'
          }`}
          role="alert"
        >
          {feedback}
        </div>
      )}

      {sentEmails.length > 0 && (
        <>
          <hr className="my-4" />
          <h5 className="mb-3">Recently Sent</h5>
          <ul className="list-group">
            {sentEmails.slice(0, 3).map((email) => (
              <li
                key={email.id}
                className="list-group-item"
                style={inputStyle}
              >
                <div className="fw-bold">{email.subject}</div>
                <div className="small" style={{ opacity: 0.75 }}>To: {email.to}</div>
                <div className="mt-1">{email.message.slice(0, 100)}...</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default EmailPage;

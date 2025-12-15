import React, { useState } from 'react';

function FeedbackSupport() {
  const [feedbackType, setFeedbackType] = useState('doctors');

  const feedback = [
    { id: 1, user: 'Dr. John Doe', feedback: 'Great app!', score: 5 },
    { id: 2, user: 'Student Name', feedback: 'Needs improvement', score: 3 }
  ];

  const tickets = [
    { id: 1, user: 'Dr. John Doe', issue: 'Billing issue', status: 'Pending', resolution: 'In progress' },
    { id: 2, user: 'Student Name', issue: 'Login problem', status: 'Resolved', resolution: 'Fixed' }
  ];

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      padding: "1rem",
      backgroundColor: "#E0F2FE",
      color: "#1E293B",
      minHeight: "100vh",
      width: "100%",
      maxWidth: "90vw",
      margin: "0 auto",
      boxSizing: "border-box",
    },
    header: {
      backgroundColor: "#FFFFFF",
      padding: "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    tableContainer: {
      backgroundColor: "#FFFFFF",
      padding: "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      overflowX: "auto",
    },
    subTitle: {
      fontSize: "1.1rem",
      fontWeight: "600",
      marginBottom: "1rem",
    },
    buttonContainer: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "1rem",
      flexWrap: "wrap",
    },
    button: {
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      color: "#FFFFFF",
      fontSize: "0.9rem",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "600px", // Ensures table is scrollable on small screens
    },
    thead: {
      backgroundColor: "#F1F5F9",
    },
    th: {
      padding: "0.75rem",
      textAlign: "left",
      borderBottom: "1px solid #E2E8F0",
      fontSize: "0.9rem",
    },
    td: {
      padding: "0.75rem",
      borderBottom: "1px solid #E2E8F0",
      fontSize: "0.9rem",
    },
    statusBadge: {
      padding: "0.25rem 0.75rem",
      borderRadius: "20px",
      fontSize: "0.8rem",
    },
  };

  // Media query styles for mobile devices
  const mobileStyles = `
    @media (max-width: 768px) {
      .container {
        padding: 0.75rem;
        max-width: 95vw;
      }
      .header {
        padding: 0.75rem;
      }
      .title {
        font-size: 1.1rem;
      }
      .tableContainer {
        padding: 0.75rem;
      }
      .subTitle {
        font-size: 1rem;
      }
      .button {
        font-size: 0.85rem;
        padding: 0.4rem 0.8rem;
        width: 100%;
        max-width: 150px;
      }
      .th, .td {
        font-size: 0.85rem;
        padding: 0.5rem;
      }
      .statusBadge {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
      }
    }
    @media (max-width: 480px) {
      .container {
        padding: 0.5rem;
      }
      .header {
        padding: 0.5rem;
      }
      .title {
        font-size: 1rem;
      }
      .tableContainer {
        padding: 0.5rem;
      }
      .subTitle {
        font-size: 0.9rem;
      }
      .button {
        font-size: 0.8rem;
        padding: 0.3rem 0.7rem;
      }
      .th, .td {
        font-size: 0.8rem;
        padding: 0.4rem;
      }
      .statusBadge {
        font-size: 0.7rem;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={styles.container} className="container">
        <div style={styles.header} className="header">
          <h1 style={styles.title} className="title">Feedback & Support</h1>
        </div>
        <div style={styles.tableContainer} className="tableContainer">
          <h2 style={styles.subTitle} className="subTitle">Collect Feedback</h2>
          <div style={styles.buttonContainer} className="buttonContainer">
            <button
              style={{
                ...styles.button,
                backgroundColor: feedbackType === 'doctors' ? '#0D9488' : '#06B6D4',
              }}
              className="button"
              onClick={() => setFeedbackType('doctors')}
            >
              From Doctors
            </button>
            <button
              style={{
                ...styles.button,
                backgroundColor: feedbackType === 'students' ? '#0D9488' : '#06B6D4',
              }}
              className="button"
              onClick={() => setFeedbackType('students')}
            >
              From Students
            </button>
          </div>
          <table style={styles.table} className="table">
            <thead style={styles.thead} className="thead">
              <tr>
                <th style={styles.th} className="th">ID</th>
                <th style={styles.th} className="th">User</th>
                <th style={styles.th} className="th">Feedback</th>
                <th style={styles.th} className="th">Score</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((fb) => (
                <tr key={fb.id} style={styles.td} className="td">
                  <td style={styles.td} className="td">{fb.id}</td>
                  <td style={styles.td} className="td">{fb.user}</td>
                  <td style={styles.td} className="td">{fb.feedback}</td>
                  <td style={styles.td} className="td">{fb.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={styles.tableContainer} className="tableContainer">
          <h2 style={styles.subTitle} className="subTitle">Ticket System</h2>
          <table style={styles.table} className="table">
            <thead style={styles.thead} className="thead">
              <tr>
                <th style={styles.th} className="th">ID</th>
                <th style={styles.th} className="th">User</th>
                <th style={styles.th} className="th">Issue</th>
                <th style={styles.th} className="th">Status</th>
                <th style={styles.th} className="th">Resolution</th>
                <th style={styles.th} className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} style={styles.td} className="td">
                  <td style={styles.td} className="td">{ticket.id}</td>
                  <td style={styles.td} className="td">{ticket.user}</td>
                  <td style={styles.td} className="td">{ticket.issue}</td>
                  <td style={styles.td} className="td">
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: ticket.status === 'Pending' ? '#FEF3C7' : '#DCFCE7',
                        color: ticket.status === 'Pending' ? '#F59E0B' : '#10B981',
                      }}
                      className="statusBadge"
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td style={styles.td} className="td">{ticket.resolution}</td>
                  <td style={styles.td} className="td">
                    <button
                      style={{ ...styles.button, backgroundColor: '#0D9488' }}
                      className="button"
                    >
                      Assign / Monitor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default FeedbackSupport;
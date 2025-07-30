// client/src/App.tsx
import React, { FC } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TeacherApp from "./component/Teacher";
import StudentApp from "./component/Student";

const App: FC = () => {
  return (
    <Router>
      <nav
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <li style={{ marginRight: "25px" }}>
            <Link
              to="/teacher"
              style={{
                textDecoration: "none",
                color: "#333",
                fontWeight: "bold",
                fontSize: "1.1em",
              }}
            >
              Teacher Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/student"
              style={{
                textDecoration: "none",
                color: "#333",
                fontWeight: "bold",
                fontSize: "1.1em",
              }}
            >
              Student View
            </Link>
          </li>
        </ul>
      </nav>

      <div
        style={{
          padding: "20px",
          maxWidth: "800px",
          margin: "0 auto",
          border: "1px solid #eee",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Routes>
          <Route path="/teacher" element={<TeacherApp />} />
          <Route path="/student" element={<StudentApp />} />
          <Route
            path="/"
            element={
              <div style={{ textAlign: "center", padding: "50px" }}>
                <h2>Welcome to the Live Polling App!</h2>
                <p>Please select your role to begin:</p>
                <div style={{ marginTop: "30px" }}>
                  <Link
                    to="/teacher"
                    style={{
                      display: "inline-block",
                      padding: "10px 20px",
                      marginRight: "20px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Go to Teacher Dashboard
                  </Link>
                  <Link
                    to="/student"
                    style={{
                      display: "inline-block",
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Go to Student View
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// client/src/App.tsx
import { type FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TeacherApp from "./component/Teacher";
import StudentApp from "./component/Student";
import Landing from "./component/Landing";


// import QuestionDisplay from "./component/QuestionDisplay";

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/teacher" element={<TeacherApp />} />
        <Route path="/student" element={<StudentApp />} />
        {/* <Route path="/demo" element={<QuestionDisplay />} /> */}
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
};

export default App;

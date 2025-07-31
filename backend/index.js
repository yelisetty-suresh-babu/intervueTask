// server/index.js - Fixed version with proper CORS configuration
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { instrument } = require("@socket.io/admin-ui");

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration for Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "https://admin.socket.io",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://intervue-task-one.vercel.app",
      // Add any other domains you need
      "https://intervue-task-jfmroqhs6-yelisetty-suresh-babus-projects.vercel.app/",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  // Additional transport options for better compatibility
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

require("dotenv").config();

// Enhanced CORS for Express
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://intervue-task-one.vercel.app",
      "https://intervue-task-jfmroqhs6-yelisetty-suresh-babus-projects.vercel.app/",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json());

const questions = [];
let activeQuestionId = null;
let activeQuestionStartTime = null;
let activeQuestionDurationMs = null;
let questionTimer = null;

// Map to store connected user IDs (socket.id -> {userId, userName, isTeacher})
const connectedUsers = new Map();

// Helper function to check if the current active question is complete
function isCurrentQuestionComplete() {
  if (!activeQuestionId) {
    return true;
  }

  // Check if timer has expired
  if (activeQuestionStartTime !== null && activeQuestionDurationMs !== null) {
    const timeRemaining =
      activeQuestionStartTime + activeQuestionDurationMs - Date.now();
    if (timeRemaining <= 0) {
      console.log(`Timer check: Expired. Remaining time: ${timeRemaining}ms`);
      return true;
    }
  }

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);
  if (activeQuestion) {
    // Get all currently connected students (exclude teachers)
    const connectedStudents = Array.from(connectedUsers.entries())
      .filter(([, userInfo]) => !userInfo.isTeacher)
      .map(([, userInfo]) => userInfo.userId);

    const studentCount = connectedStudents.length;

    console.log(`Connected students: ${JSON.stringify(connectedStudents)}`);
    console.log(`Total student count: ${studentCount}`);

    // If there are no connected students, the question is considered complete
    if (studentCount <= 0) {
      console.log("Vote check: No connected students.");
      return true;
    }

    // Get all unique voter IDs from the question's options
    const allVoterIds = new Set();
    activeQuestion.options.forEach((option) => {
      option.voterIds.forEach((voterId) => allVoterIds.add(voterId));
    });

    // Filter voters to only include currently connected students
    const connectedStudentVoters = new Set(
      [...allVoterIds].filter((voterId) => connectedStudents.includes(voterId))
    );

    console.log(
      `Vote check: Connected student voters: ${connectedStudentVoters.size}, Total connected students: ${studentCount}`
    );

    // Check if all currently connected students have voted
    if (connectedStudentVoters.size === studentCount) {
      console.log("All connected students have voted!");
      return true;
    }
  }

  return false;
}

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("registerUser", ({ userId, userName }) => {
    const isTeacher = userName === "Teacher";
    connectedUsers.set(socket.id, { userId, userName, isTeacher });
    console.log(
      `User ${userName} (${userId}) registered with socket ${socket.id}. IsTeacher: ${isTeacher}`
    );

    // Send initial data to the newly connected client after registration
    socket.emit("initialQuestions", {
      questions,
      activeQuestionId,
      activeQuestionStartTime,
      activeQuestionDurationMs,
    });
  });

  socket.on("postQuestion", (data) => {
    if (!isCurrentQuestionComplete()) {
      socket.emit(
        "postQuestionFailure",
        "Cannot post a new question until the current one is complete (all students answered or timer expired)."
      );
      return;
    }

    // Clear active question state if it was complete
    if (activeQuestionId) {
      activeQuestionId = null;
      activeQuestionStartTime = null;
      activeQuestionDurationMs = null;
      io.emit("questionComplete");
    }

    const { questionText, options, durationSeconds } = data;
    const newQuestion = {
      id: uuidv4(),
      text: questionText,
      options: options.map((opt) => ({ text: opt, votes: 0, voterIds: [] })),
      creatorId: socket.id,
      timestamp: new Date().toISOString(),
    };
    questions.push(newQuestion);
    console.log("New question posted:", newQuestion);

    // Set new active question with its duration
    activeQuestionId = newQuestion.id;
    activeQuestionStartTime = Date.now();
    activeQuestionDurationMs = durationSeconds * 1000;

    // Clear any existing timer
    if (questionTimer) {
      clearTimeout(questionTimer);
    }

    // Set a timer to automatically complete the question
    questionTimer = setTimeout(() => {
      console.log(`Question ${activeQuestionId} timer expired.`);
      activeQuestionId = null;
      activeQuestionStartTime = null;
      activeQuestionDurationMs = null;
      console.log("Emitting 'deactivateQuestion' event to clients.");
      io.emit("deactivateQuestion");
    }, activeQuestionDurationMs);

    io.emit("newQuestion", newQuestion);
    io.emit("activateQuestion", {
      questionId: activeQuestionId,
      startTime: activeQuestionStartTime,
      durationMs: activeQuestionDurationMs,
    });
  });

  socket.on("submitAnswer", (data) => {
    const { questionId, selectedOptionText, userId } = data;
    const question = questions.find((q) => q.id === questionId);

    // Server-side time limit validation
    if (
      activeQuestionId !== questionId ||
      activeQuestionStartTime === null ||
      activeQuestionDurationMs === null
    ) {
      console.warn(
        `Vote rejected: Question ${questionId} is not the current active question or timing info is missing.`
      );
      return;
    }

    if (Date.now() > activeQuestionStartTime + activeQuestionDurationMs) {
      console.warn(
        `Vote rejected: Time limit expired for question ${questionId}.`
      );
      return;
    }

    // Check if user already voted
    const hasVoted = question.options.some((option) =>
      option.voterIds.includes(userId)
    );
    if (hasVoted) {
      console.log(
        `User ${userId} already voted for question ${questionId}. Ignoring duplicate vote.`
      );
      return;
    }

    const option = question.options.find(
      (opt) => opt.text === selectedOptionText
    );
    if (option) {
      option.votes++;
      option.voterIds.push(userId);
      console.log(
        `Answer submitted for question '${question.text}': '${selectedOptionText}' by user ${userId}. New count: ${option.votes}`
      );
      io.emit("updatePollResults", {
        questionId: question.id,
        updatedOptions: question.options,
      });

      // Check if the question is now complete
      if (isCurrentQuestionComplete()) {
        console.log(
          `Question ${activeQuestionId} completed early - all students voted.`
        );
        if (questionTimer) {
          clearTimeout(questionTimer);
        }
        activeQuestionId = null;
        activeQuestionStartTime = null;
        activeQuestionDurationMs = null;
        io.emit("deactivateQuestion");
      }
    } else {
      console.warn(
        `Option '${selectedOptionText}' not found for question ID '${questionId}'`
      );
    }
  });

  socket.on("activateQuestion", (data) => {
    if (!isCurrentQuestionComplete()) {
      socket.emit(
        "activateQuestionFailure",
        "Cannot activate a new question until the current one is complete (all students answered or timer expired)."
      );
      return;
    }

    // Clear active question state if it was complete
    if (activeQuestionId) {
      activeQuestionId = null;
      activeQuestionStartTime = null;
      activeQuestionDurationMs = null;
      io.emit("questionComplete");
    }

    // Clear any existing timer
    if (questionTimer) {
      clearTimeout(questionTimer);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove the disconnected user from the map
    if (connectedUsers.has(socket.id)) {
      const userInfo = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      console.log(
        `User ${userInfo.userName} (${userInfo.userId}) (socket ${socket.id}) disconnected and removed from connectedUsers.`
      );

      // After a student disconnects, re-evaluate if the current question is complete
      if (
        activeQuestionId &&
        !userInfo.isTeacher &&
        isCurrentQuestionComplete()
      ) {
        console.log(
          `Question ${activeQuestionId} completed early due to student disconnect.`
        );
        if (questionTimer) {
          clearTimeout(questionTimer);
        }
        activeQuestionId = null;
        activeQuestionStartTime = null;
        activeQuestionDurationMs = null;
        io.emit("deactivateQuestion");
      }
    }
  });

  // messages
  socket.on("studentMessage", (messageData) => {
    // Broadcast message to all connected students
    io.emit("studentMessage", messageData);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

instrument(io, {
  auth: false,
});

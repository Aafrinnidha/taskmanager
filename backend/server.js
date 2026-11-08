const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./task");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log frontend requests in terminal
app.use((req, res, next) => {
  console.log("\n========== FRONTEND REQUEST ==========");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  if (Object.keys(req.body || {}).length > 0) {
    console.log("Data received:", req.body);
  }

  console.log("======================================");
  next();
});

// GET: Fetch all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    console.log("Tasks fetched from MongoDB:", tasks.length);

    res.json(tasks);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// POST: Create a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title: title.trim(),
    });

    console.log("\n✅ TASK SAVED TO MONGODB");
    console.log("Task ID:", task._id);
    console.log("Task Title:", task.title);
    console.log("Task Status:", task.status);
    console.log("Created At:", task.createdAt);

    res.status(201).json(task);
  } catch (error) {
    console.error("Create error:", error.message);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// PATCH: Update task status
app.patch("/tasks/:id", async (req, res) => {
  try {
    const validStatuses = ["Pending", "Ongoing", "Completed"];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    console.log("\n✏️ TASK UPDATED");
    console.log("Task ID:", task._id);
    console.log("Task Title:", task.title);
    console.log("New Status:", task.status);

    res.json(task);
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(400).json({
      message: "Could not update task",
    });
  }
});

// DELETE: Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    console.log("\n🗑️ TASK DELETED");
    console.log("Task ID:", task._id);
    console.log("Task Title:", task.title);

    res.json({
      message: "Task deleted successfully",
      deletedTask: task,
    });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(400).json({
      message: "Could not delete task",
    });
  }
});

// Connect MongoDB and start backend
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\n====================================");
    console.log("✅ MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
    console.log("====================================");

    app.listen(PORT, () => {
      console.log(`✅ Backend running at http://localhost:${PORT}`);
      console.log("Waiting for frontend requests...");
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

startServer();
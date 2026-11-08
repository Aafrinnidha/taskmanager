import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_URL = "https://task-manager-backend-wj70.onrender.com/tasks";
const statuses = ["Pending", "Ongoing", "Completed"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setError("");
    } catch {
      setError("Cannot connect to backend. Check MongoDB and server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function createTask(e) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      await axios.post(API_URL, { title });
      setTitle("");
      await fetchTasks();
    } catch {
      setError("Could not create task.");
    }
  }

  async function updateStatus(id, status) {
    try {
      await axios.patch(`${API_URL}/${id}`, { status });
      await fetchTasks();
    } catch {
      setError("Could not update task.");
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchTasks();
    } catch {
      setError("Could not delete task.");
    }
  }

  return (
    <main className="container py-5">
      <h1 className="text-center mb-4">Task Manager</h1>
      <p className="text-center text-muted">
        Organize your work and track your progress.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={createTask} className="input-group mb-4">
        <input
          className="form-control"
          placeholder="Enter a new task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Add Task
        </button>
      </form>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="row g-4">
          {statuses.map((status) => (
            <div className="col-md-4" key={status}>
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-primary text-white">
                  {status} Tasks
                </div>

                <div className="card-body">
                  {tasks.filter((task) => task.status === status).length ===
                  0 ? (
                    <p className="text-muted">No tasks yet.</p>
                  ) : (
                    tasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <div className="border rounded p-3 mb-3" key={task._id}>
                          <h6>{task.title}</h6>

                          {statuses
                            .filter((s) => s !== task.status)
                            .map((s) => (
                              <button
                                key={s}
                                className="btn btn-sm btn-outline-primary me-2 mb-2"
                                onClick={() => updateStatus(task._id, s)}
                              >
                                {s}
                              </button>
                            ))}

                          <button
                            className="btn btn-sm btn-danger mb-2"
                            onClick={() => deleteTask(task._id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
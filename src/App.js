import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

const API = "http://localhost:8081";
const USER_ID = 1;

function App() {
  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState("");
  const [logs, setLogs] = useState({});
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Fetch habits
  const getHabits = async () => {
    try {
      const res = await axios.get(`${API}/habits/${USER_ID}`);
      setHabits(res.data);
      res.data.forEach(habit => getLogs(habit.id));
    } catch (err) {
      toast.error("Failed to load habits.");
    }
  };

  // Fetch habit logs
  const getLogs = async (habit_id) => {
    try {
      const res = await axios.get(`${API}/habits/${habit_id}/logs`);
      setLogs(prev => ({ ...prev, [habit_id]: res.data }));
    } catch (err) {
      console.log(err);
    }
  };

  // Add new habit
  const addHabit = async () => {
    if (!habitName) return;
    try {
      await axios.post(`${API}/habits`, { user_id: USER_ID, habit_name: habitName });
      toast.success("Habit added!");
      setHabitName("");
      getHabits();
    } catch (err) {
      toast.error("Failed to add habit.");
    }
  };

  // Mark habit as done for today
  const markDone = async (id) => {
    try {
      await axios.post(`${API}/habits/${id}/log`);
      toast.success("Marked as done!");
      getLogs(id); // Refresh logs to update calendar
    } catch (err) {
      toast.error("Failed to mark as done.");
    }
  };

  // Delete habit
  const deleteHabit = async (id) => {
    try {
      await axios.delete(`${API}/habits/${id}`);
      toast.success("Habit deleted!");
      getHabits();
    } catch (err) {
      toast.error("Failed to delete habit.");
    }
  };

  // Generate random logs for the previous 7 days
  const generateRandomLogs = () => {
    let logsArray = [];
    for (let i = 1; i <= 7; i++) {
      const randomCompletion = Math.random() > 0.5; // Randomly mark as completed or not
      const logDate = moment().subtract(i, "days").format("YYYY-MM-DD");
      logsArray.push({ log_date: logDate, completed: randomCompletion });
    }
    return logsArray;
  };

  // Simulate random logs for habit
  const simulateRandomLogs = (habit_id) => {
    const randomLogs = generateRandomLogs();
    setLogs((prevLogs) => ({
      ...prevLogs,
      [habit_id]: randomLogs,
    }));
  };

  // Check if habit is completed for a given date
  const isCompleted = (habit_id, date) => {
    const formatted = moment(date).format("YYYY-MM-DD");
    return logs[habit_id]?.some(log => moment(log.log_date).format("YYYY-MM-DD") === formatted && log.completed);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 text-primary">🌱 Simple Habit Tracker</h2>

      {/* Habit Input Form */}
      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Enter habit..."
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
        />
        <button className="btn btn-success" onClick={addHabit}>Add Habit</button>
      </div>

      {/* Habit List */}
      <div className="row">
        {habits.map((habit) => (
          <div key={habit.id} className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{habit.habit_name}</h5>
                <button className="btn btn-outline-success btn-sm me-2" onClick={() => markDone(habit.id)}>✔️ Mark Done</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteHabit(habit.id)}>🗑️ Delete</button>
                <button className="btn btn-link btn-sm mt-2" onClick={() => setSelectedHabit(habit.id)}>
                  📅 View Calendar
                </button>
                {/* Simulate Random Logs */}
                <button className="btn btn-link btn-sm mt-2" onClick={() => simulateRandomLogs(habit.id)}>
                  🔄 Simulate Random 7 Days History
                </button>
              </div>

              {/* Show Calendar when selected habit */}
              {selectedHabit === habit.id && (
                <div className="card-footer">
                  <Calendar
                    tileContent={({ date, view }) => {
                      if (view === "month") {
                        return (
                          <div style={{ fontSize: "0.8em", textAlign: "center" }}>
                            {isCompleted(habit.id, date) ? "✔️" : ""}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;

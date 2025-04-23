import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const API = "http://localhost:8081";
const USER_ID = 1;

function App() {
    const [habits, setHabits] = useState([]);
    const [habitName, setHabitName] = useState("");

    const getHabits = async () => {
        try {
            const res = await axios.get(`${API}/habits/${USER_ID}`);
            setHabits(res.data);
        } catch (err) {
            toast.error("Failed to load habits.");
        }
    };

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

    const markDone = async (id) => {
        try {
            await axios.post(`${API}/habits/${id}/log`);
            toast.success("Marked as done!");
            getHabits();
        } catch (err) {
            toast.error("Failed to mark as done.");
        }
    };

    const deleteHabit = async (id) => {
        try {
            await axios.delete(`${API}/habits/${id}`);
            toast.success("Habit deleted!");
            getHabits();
        } catch (err) {
            toast.error("Failed to delete habit.");
        }
    };

    useEffect(() => {
        getHabits();
    }, []);

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4 text-primary">🌱 Simple Habit Tracker</h2>

            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter habit..."
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                />
                <button className="btn btn-success" onClick={addHabit}>Add Habit</button>
            </div>

            <div className="row">
                {habits.map((habit) => (
                    <div key={habit.id} className="col-md-4 mb-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="card-title">{habit.habit_name}</h5>
                                <button className="btn btn-outline-success btn-sm me-2" onClick={() => markDone(habit.id)}>✔️ Mark Done</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteHabit(habit.id)}>🗑️ Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ToastContainer />
        </div>
    );
}

export default App;

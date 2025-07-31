import React, { useState, useEffect } from "react";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const EditHabitForm = ({ habit, onHabitUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || "");
      setFrequency(habit.frequency || "daily");
      setCustomDays(habit.customDays || []);
    }
  }, [habit]);

  const handleDayToggle = (day) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (frequency === "custom" && customDays.length === 0) {
      setError("Please select at least one day for custom frequency.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to update habits.");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/habits/${habit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          frequency,
          customDays: frequency === "custom" ? customDays : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update habit");
      }

      const updatedHabit = await res.json();
      onHabitUpdated(updatedHabit);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold text-blue-700">Edit Habit</h3>

      <div>
        <label className="block mb-1 text-gray-800">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-800">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-800">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {frequency === "custom" && (
        <div className="flex flex-wrap gap-2 mt-2">
          {weekdays.map((day) => (
            <label
              key={day}
              className="inline-flex items-center cursor-pointer text-gray-700 select-none"
            >
              <input
                type="checkbox"
                checked={customDays.includes(day)}
                onChange={() => handleDayToggle(day)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">{day}</span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditHabitForm;

import { useState } from "react";

function TaskList({
  tasks,
  handleDeleteTask,
  handleUpdateStatus,
  handleUpdateTask,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  return (
    <div className="section">
      {tasks.map((task) => (
        <div key={task._id} className="task-card">

          {editingId === task._id ? (
            <>
              <input
                className="input-field"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <input
                className="input-field"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />

              <button
                className="button"
                onClick={() => {
                  handleUpdateTask(task._id, editTitle, editDescription);
                  setEditingId(null);
                }}
              >
                Save
              </button>

              <button
                className="button"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <strong>{task.title}</strong>
              <p>{task.description}</p>

              <select
                className="select-status"
                value={task.status}
                onChange={(e) =>
                  handleUpdateStatus(task._id, e.target.value)
                }
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <br /><br />

              <button
                className="button"
                onClick={() => {
                  setEditingId(task._id);
                  setEditTitle(task.title);
                  setEditDescription(task.description);
                }}
              >
                Edit
              </button>

              <button
                className="button"
                onClick={() => handleDeleteTask(task._id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default TaskList;

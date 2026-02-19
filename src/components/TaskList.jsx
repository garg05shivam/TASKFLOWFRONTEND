import { useState } from "react";

function TaskList({
  tasks,
  loading,
  selectedProject,
  handleDeleteTask,
  handleUpdateStatus,
  handleUpdateTask,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const beginEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  if (!selectedProject) {
    return <p className="empty-state">Select a project to view its tasks.</p>;
  }

  if (loading) {
    return <p className="loading-state">Loading tasks...</p>;
  }

  if (!tasks.length) {
    return <p className="empty-state">No tasks found for this project.</p>;
  }

  return (
    <section className="section">
      {tasks.map((task) => (
        <article key={task._id} className="task-card">
          {editingId === task._id ? (
            <div className="stack-form">
              <input
                className="input-field"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />

              <textarea
                className="input-field textarea-field"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />

              <div className="inline-actions">
                <button
                  className="button"
                  onClick={() => {
                    handleUpdateTask(task._id, editTitle, editDescription);
                    cancelEdit();
                  }}
                >
                  Save
                </button>

                <button className="button button-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4>{task.title}</h4>
              <p>{task.description || "No description added."}</p>

              <div className="task-row">
                <select
                  className="select-status"
                  value={task.status}
                  onChange={(event) => handleUpdateStatus(task._id, event.target.value)}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <div className="inline-actions">
                  <button className="button button-secondary" onClick={() => beginEdit(task)}>
                    Edit
                  </button>
                  <button className="button button-danger" onClick={() => handleDeleteTask(task._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </article>
      ))}
    </section>
  );
}

export default TaskList;

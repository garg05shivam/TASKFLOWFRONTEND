function TaskList({
  tasks,
  handleDeleteTask,
  handleUpdateStatus,
}) {
  return (
    <div className="section">
      {tasks.map((task) => (
        <div key={task._id} className="task-card">
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

          <button
            className="button"
            onClick={() => handleDeleteTask(task._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default TaskList;

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Workspace.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const response = await api.get("/collaboration/notifications");
    setNotifications(response.data.notifications || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchNotifications();
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load notifications.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const markRead = async (id) => {
    try {
      await api.patch(`/collaboration/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not mark notification read.");
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/collaboration/notifications");
      setNotifications([]);
      toast.success("All notifications cleared.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not clear notifications.");
    }
  };

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Notifications</h1>
            <p className="workspace-sub">Unread: {unreadCount}</p>
          </div>
          <div className="workspace-nav">
            {notifications.length > 0 && (
              <button className="btn secondary" onClick={clearAll}>
                Clear All
              </button>
            )}
            <Link className="btn secondary" to="/dashboard">Dashboard</Link>
          </div>
        </header>

        <section className="workspace-panel">
          {loading ? (
            <div className="workspace-empty">Loading notifications...</div>
          ) : !notifications.length ? (
            <div className="workspace-empty">No notifications yet.</div>
          ) : (
            notifications.map((item) => (
              <article className="workspace-card" key={item._id} style={{ opacity: item.isRead ? 0.7 : 1 }}>
                <h4>{item.type.replace("_", " ")}</h4>
                <p>{item.message}</p>
                <div className="workspace-actions" style={{ justifyContent: "space-between" }}>
                  <small className="workspace-muted">{new Date(item.createdAt).toLocaleString()}</small>
                  {!item.isRead && (
                    <button className="btn secondary" onClick={() => markRead(item._id)}>
                      Mark Read
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Notifications;


import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import "../styles/admin.css";

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/auth/users", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Could not load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>
          User <span>Directory</span>
        </h2>
      </div>

      {loading ? (
        <Spinner label="Loading users..." />
      ) : users.length === 0 ? (
        <p className="admin-empty">No users yet.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-avatar">
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`role-pill ${u.role === "admin" ? "role-admin" : "role-user"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.verified ? (
                      <span className="stock-pill stock-ok">Verified</span>
                    ) : (
                      <span className="stock-pill stock-out">Unverified</span>
                    )}
                  </td>
                  <td>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
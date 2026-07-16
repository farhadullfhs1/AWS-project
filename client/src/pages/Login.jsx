import { useState } from "react";
import { api, setAuthSession } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const login = () => {
    api.post("auth/login/", { username: identifier, password })
      .then(res => {
        setAuthSession({ access: res.data.access, refresh: res.data.refresh });
        localStorage.setItem("brewhaven-user", JSON.stringify({
          username: res.data.username || identifier,
          email: res.data.email || "",
          is_staff: !!res.data.is_staff,
          staff_branch: res.data.staff_branch || "",
          employee_id: res.data.employee_id || "",
        }));
        nav("/");
      })
      .catch(() => alert("Invalid login"));
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email or Username" onChange={e=>setIdentifier(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}

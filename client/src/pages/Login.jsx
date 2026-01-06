import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const login = () => {
    api.post("auth/login/", { username, password })
      .then(res => {
        localStorage.setItem("token", res.data.access);
        nav("/");
      })
      .catch(() => alert("Invalid login"));
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Username" onChange={e=>setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}

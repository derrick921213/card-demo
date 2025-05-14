import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { makeRequest } from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await makeRequest("/login", "post", { username, password });
      localStorage.setItem("token", res.access_token);
      toast.success("登入成功");
      navigate("/dashboard");
    } catch {
      toast.error("登入失敗，請檢查帳號密碼");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">登入</h2>
        <input
          className="w-full mb-4 p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="帳號"
          required
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          登入
        </button>
        <div className="mt-4 text-center text-sm">
          沒有帳號？
          <Link to="/register" className="text-blue-500 hover:underline">
            註冊
          </Link>
        </div>
      </form>
    </div>
  );
}

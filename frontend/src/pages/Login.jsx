import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import axiosClient from "../api/axiosClient";

export default function Login() {
  const { login, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  useEffect(() => {
    const tryInit = () => {
      if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            try {
              setError("");
              const { data } = await axiosClient.post("/auth/google", {
                idToken: resp.credential,
              });
              localStorage.setItem("accessToken", data.accessToken);
              localStorage.setItem("refreshToken", data.refreshToken);
              await refreshMe();
              navigate("/");
            } catch (err) {
              setError(err.response?.data?.message || "Google login failed");
            }
          },
        });
        setGoogleReady(true);
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          {
            theme: "outline",
            size: "large",
          }
        );
      }
    };
    tryInit();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-950">
        <h1 className="mb-2 text-xl font-bold">Sign in</h1>
        <p className="mb-4 text-sm text-gray-500">
          Manage tasks in real-time with your team.
        </p>
        <div id="googleBtn" className="mb-3"></div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>
          {error && <div className="text-xs text-rose-500">{error}</div>}
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          No account?{" "}
          <Link to="/register" className="font-medium text-indigo-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

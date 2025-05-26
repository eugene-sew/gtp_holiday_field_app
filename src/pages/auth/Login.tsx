import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { User, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, simulate login for specific users
      if (email === "admin@fieldtask.com" && password === "password") {
        await login({
          id: "admin-1",
          name: "Admin User",
          email: "admin@fieldtask.com",
          role: "admin",
        });
        navigate("/dashboard");
      } else if (email === "field@fieldtask.com" && password === "password") {
        await login({
          id: "field-1",
          name: "Field User",
          email: "field@fieldtask.com",
          role: "field",
          phone: "555-123-4567",
        });
        navigate("/dashboard");
      } else {
        setError(
          "Invalid credentials. Try admin@fieldtask.com or field@fieldtask.com with password: password"
        );
      }
    } catch (error) {
      setError("Authentication failed. Please try again.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
        Sign in to your account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <Input
          id="email"
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          icon={<User className="h-5 w-5 text-gray-400" />}
          fullWidth
          className="bg-white px-2 py-2"
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          fullWidth
          className="bg-white px-2 py-2"
        />

        <div>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Demo Credentials:</p>
        <p className="mt-1">Admin: admin@fieldtask.com</p>
        <p>Field: field@fieldtask.com</p>
        <p className="mt-1">Password: password</p>
      </div>
    </div>
  );
};

export default Login;

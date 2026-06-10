import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  LogIn,
  Building2,
  Layers3,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const result = login(username.trim(), password);

    setLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.error ?? "Login failed.");
    }
  };

  const handleSSOLogin = async () => {
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 500));

    const result = login("bob", "bob");

    setLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError("SSO login failed.");
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="min-h-full flex items-start justify-center px-4 py-5 md:py-8">
        <div className="w-full max-w-md flex flex-col">
          {/* Brand Section */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative mb-3">
              <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl">
                <Layers3 className="h-8 w-8" />
              </div>

              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-center text-foreground leading-tight max-w-md">
              Enterprise Resource Management
            </h1>

            <p className="text-sm text-muted-foreground text-center mt-2">
              Secure workforce planning and allocation platform
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Welcome back</CardTitle>

              <CardDescription>
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>

                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={loading}
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                {/* Sign In */}
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </span>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>

                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* SSO Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-border/70 hover:bg-muted/50 transition-all duration-200"
                  onClick={handleSSOLogin}
                  disabled={loading}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Login with SSO
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="mt-5 bg-muted/40 border-dashed flex-shrink-0">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Demo Credentials
              </p>

              <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
                <span className="font-medium">Super Admin</span>
                <span>bob / bob</span>

                <span className="font-medium">PMO</span>
                <span>tom / tom</span>

                <span className="font-medium">Resource Manager</span>
                <span>sam / sam</span>

                <span className="font-medium">Resource</span>
                <span>zoi / zoi</span>
              </div>
            </CardContent>
          </Card>

          {/* Bottom spacing for scroll visibility */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}

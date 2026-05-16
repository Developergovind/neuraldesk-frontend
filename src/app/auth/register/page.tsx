"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
  });

  // Calculate password strength (simple version)
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.match(/[A-Z]/)) score += 25;
    if (pwd.match(/[0-9]/)) score += 25;
    if (pwd.match(/[^A-Za-z0-9]/)) score += 25;
    return score;
  };
  
  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 50) {
      toast.error("Please use a stronger password");
      return;
    }
    
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/register", formData);
      login(data.tenant, data.accessToken, data.refreshToken);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/10 shadow-2xl bg-white/[0.03] backdrop-blur-xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl mb-2">Create Account</CardTitle>
        <CardDescription>Start building your AI assistant today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="John Doe"
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Acme Corp"
              label="Company Name"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          
          <Input
            type="email"
            placeholder="name@company.com"
            label="Work Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="••••••••"
              label="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            {/* Password strength meter */}
            {formData.password && (
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${
                    strength <= 25 ? 'bg-red-500 w-1/4' : 
                    strength <= 50 ? 'bg-orange-500 w-2/4' : 
                    strength <= 75 ? 'bg-yellow-500 w-3/4' : 
                    'bg-green-500 w-full'
                  }`}
                />
              </div>
            )}
          </div>
          
          <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

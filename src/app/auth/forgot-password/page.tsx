"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Assuming there's a forgot-password endpoint or a placeholder for now
      await api.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      // Even if it fails, we show a success message for security reasons usually, 
      // but here we'll handle the actual error if it's not implemented yet.
      if (error.response?.status === 404) {
          toast.error("Forgot password feature coming soon!");
      } else {
          toast.error(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-white/10 shadow-2xl bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl mb-2">Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <span className="text-white">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/login">
            <Button variant="glass" className="w-full">
              Back to Login
            </Button>
          </Link>
          <p className="mt-6 text-sm text-white/40">
            Didn't receive the email? Check your spam folder or{" "}
            <button onClick={() => setIsSubmitted(false)} className="text-cyan-400 hover:underline">try again</button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 shadow-2xl bg-white/[0.03] backdrop-blur-xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl mb-2">Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a password reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            placeholder="name@company.com"
            label="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          
          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

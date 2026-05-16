"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function AnimatedOrb() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} color="#00d4ff" intensity={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <Sphere args={[1, 100, 100]} scale={2}>
            <MeshDistortMaterial
              color="#00d4ff"
              attach="material"
              distort={0.4}
              speed={2}
              roughness={0}
              metalness={1}
            />
          </Sphere>
        </Float>
      </Canvas>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", formData);
      
      // Store tokens
      Cookies.set("accessToken", data.accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set("refreshToken", data.refreshToken, { secure: true, sameSite: 'strict', expires: 7 });
      
      // Store tenant info
      localStorage.setItem("tenant", JSON.stringify(data.tenant));
      
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-obsidian-950 overflow-hidden">
      {/* Left: 3D Scene */}
      <div className="hidden lg:flex relative items-center justify-center bg-obsidian-900/50 border-r border-white/5">
        <AnimatedOrb />
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-4xl font-heading font-bold mb-4 tracking-tight">Intelligence at Scale</h2>
            <p className="text-white/40 max-w-md mx-auto">
              Access your NeuralDesk dashboard and manage your custom AI ecosystem.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-8 relative">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 opacity-20">
          <AnimatedOrb />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md z-10"
        >
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-heading font-bold tracking-wide text-white">NeuralDesk</span>
            </Link>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Sign In</h1>
            <p className="text-white/50">Enter your credentials to access your account</p>
          </div>

          <Card className="p-8 bg-white/[0.02] border-white/5 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/70">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/20"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/50">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12 text-base shadow-lg shadow-cyan-500/20"
                isLoading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-white/40 text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Create Account
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

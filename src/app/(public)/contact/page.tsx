"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send,
  Loader2,
  CheckCircle
} from "lucide-react";

const Twitter = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const Github = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>;
const Linkedin = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
import toast from "react-hot-toast";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mocking submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Message sent successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl md:text-6xl font-heading font-bold mb-8">Get in Touch</h1>
              <p className="text-white/40 text-lg mb-12">
                Have questions about NeuralDesk? Our team is here to help you build the perfect AI assistant for your needs.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Email Us</p>
                    <p className="text-white font-medium">support@neuraldesk.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <Twitter className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Follow Us</p>
                    <p className="text-white font-medium">@NeuralDeskAI</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Headquarters</p>
                    <p className="text-white font-medium">San Francisco, CA</p>
                  </div>
                </div>
              </div>

              <div className="mt-16 flex gap-4">
                {[Twitter, Github, Linkedin].map((Icon, idx) => (
                  <button key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-8 md:p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
                
                {isSuccess ? (
                  <div className="text-center py-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8"
                    >
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-4">Message Sent!</h2>
                    <p className="text-white/40 mb-10">We'll get back to you within 24 hours.</p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="text-cyan-400 font-bold hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-2">Full Name</label>
                        <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-2">Email Address</label>
                        <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-2">Subject</label>
                      <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="How can we help?" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-2">Message</label>
                      <textarea required rows={5} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none" placeholder="Tell us more about your needs..." />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

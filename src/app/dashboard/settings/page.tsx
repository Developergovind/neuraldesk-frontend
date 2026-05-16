"use client";

import { useState, useEffect } from "react";
import { useMe } from "@/lib/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  ShieldCheckIcon,
  CreditCardIcon,
  KeyIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: tenant, refetch } = useMe();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Profile/Company State
  const [profileData, setProfileData] = useState({
    name: "",
    company: "",
  });

  // Update state when tenant data arrives
  useEffect(() => {
    if (tenant) {
      setProfileData({
        name: tenant.name || "",
        company: tenant.company || "",
      });
    }
  }, [tenant]);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Billing State
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);


  useEffect(() => {
    if (activeTab === "billing") {
      fetchBillingInfo();
    }
  }, [activeTab]);

  const fetchBillingInfo = async () => {
    setIsBillingLoading(true);
    try {
      const data = await api.get("/stripe/plan");
      setBillingInfo(data.data);
    } catch (error) {
      console.error("Failed to fetch billing info", error);
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/stripe/checkout", { plan });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/stripe/portal");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to open billing portal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await api.patch("/auth/profile", {
        name: profileData.name,
        company: profileData.company
      });
      await refetch();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.patch("/auth/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [

    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "company", label: "Company", icon: BuildingOfficeIcon },
    { id: "security", label: "Security", icon: ShieldCheckIcon },
    { id: "billing", label: "Billing & Plan", icon: CreditCardIcon },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Settings</h1>
        <p className="text-white/40">Manage your account, organization, and subscription preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-white/10 text-white border border-white/10 shadow-lg" 
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card className="p-8 bg-white/[0.02] border-white/5">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-xl font-heading font-bold text-white mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    icon={<UserIcon className="w-5 h-5" />}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    disabled
                    value={tenant?.email}
                    className="text-white/40 cursor-not-allowed"
                  />
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Button variant="primary" onClick={handleUpdateProfile} isLoading={isLoading}>Save Changes</Button>
                </div>
              </div>
            )}

            {activeTab === "company" && (
              <div className="space-y-6">
                <h3 className="text-xl font-heading font-bold text-white mb-6">Company Details</h3>
                <Input
                  label="Company Name"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  icon={<BuildingOfficeIcon className="w-5 h-5" />}
                />
                <div className="pt-4 border-t border-white/5">
                  <Button variant="primary" onClick={handleUpdateProfile} isLoading={isLoading}>Save Changes</Button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-heading font-bold text-white mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      icon={<ShieldCheckIcon className="w-5 h-5" />}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        icon={<KeyIcon className="w-5 h-5" />}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        icon={<KeyIcon className="w-5 h-5" />}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Button variant="primary" onClick={handleChangePassword} isLoading={isLoading}>Update Password</Button>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-white">Subscription & Plan</h3>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-cyan-500/30">
                    {billingInfo?.plan || tenant?.plan || 'Free'}
                  </div>
                </div>
                
                <Card className="p-6 bg-white/[0.03] border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-cyan-500/10 transition-all duration-500" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                      <CreditCardIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-lg text-white font-bold capitalize">
                        {billingInfo?.plan || tenant?.plan || 'Free'} Plan
                      </p>
                      <p className="text-xs text-white/40">
                        {billingInfo?.billing?.hasActiveSubscription 
                          ? `Active Subscription` 
                          : 'Limited access to features'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {(billingInfo?.plan === 'free' || !billingInfo) && (
                      <Button 
                        variant="primary" 
                        className="shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        onClick={() => handleUpgrade('pro')}
                        isLoading={isLoading}
                      >
                        Upgrade to Pro
                      </Button>
                    )}
                    {billingInfo?.billing?.hasActiveSubscription && (
                      <Button 
                        variant="glass"
                        onClick={handleManageBilling}
                        isLoading={isLoading}
                      >
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Message Usage */}
                  <div className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Messages Used</h4>
                        <p className="text-2xl font-heading font-bold text-white">
                          {billingInfo?.usage?.messagesThisMonth || 0}
                          <span className="text-sm text-white/20 font-normal"> / {billingInfo?.usage?.messagesLimit || 1000}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-cyan-400">{billingInfo?.usage?.messagesPercent || 0}%</p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(billingInfo?.usage?.messagesPercent || 0, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/30 italic">
                      Resets on {billingInfo?.usage?.resetAt ? new Date(billingInfo.usage.resetAt).toLocaleDateString() : 'next month'}
                    </p>
                  </div>

                  {/* Bots Usage */}
                  <div className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Bots Created</h4>
                        <p className="text-2xl font-heading font-bold text-white">
                          {billingInfo?.usage?.botsCreated || 0}
                          <span className="text-sm text-white/20 font-normal"> / {billingInfo?.limits?.maxBots === -1 ? '∞' : (billingInfo?.limits?.maxBots || 1)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-purple-400">
                          {billingInfo?.limits?.maxBots === -1 ? '0' : Math.round(((billingInfo?.usage?.botsCreated || 0) / (billingInfo?.limits?.maxBots || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out" 
                        style={{ width: `${billingInfo?.limits?.maxBots === -1 ? 0 : Math.min(((billingInfo?.usage?.botsCreated || 0) / (billingInfo?.limits?.maxBots || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                </div>
                
                {/* Plan Comparison Shortcut */}
                {billingInfo?.plan === 'free' && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                    <h4 className="text-sm font-bold text-white mb-2">Upgrade to Pro for:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        '50k messages / month',
                        'Up to 5 AI bots',
                        'Custom branding',
                        'Live Inbox access',
                        'Advanced analytics',
                        'Priority support'
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                          <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


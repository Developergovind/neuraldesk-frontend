import { GlobalLoader } from "@/components/ui/Loader";

export default function AuthSubrouteLoading() {
  return (
    <GlobalLoader 
      text="Loading..." 
      subtext="Redirecting to secure login" 
      fullScreen={true} 
    />
  );
}

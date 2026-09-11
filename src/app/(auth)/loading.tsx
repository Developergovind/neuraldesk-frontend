import { GlobalLoader } from "@/components/ui/Loader";

export default function AuthLoading() {
  return (
    <GlobalLoader 
      text="Authenticating..." 
      subtext="Verifying tenant credentials and secure session" 
      fullScreen={true} 
    />
  );
}

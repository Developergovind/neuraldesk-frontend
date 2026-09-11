import { GlobalLoader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <GlobalLoader 
      text="Loading NeuralDesk..." 
      subtext="Connecting to AI neural engines" 
      fullScreen={true} 
    />
  );
}

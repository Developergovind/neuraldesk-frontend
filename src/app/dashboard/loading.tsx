import { PageLoader } from "@/components/ui/Loader";

export default function DashboardLoading() {
  return (
    <PageLoader 
      text="Loading Workspace..." 
      subtext="Fetching bots, knowledge bases, and real-time metrics" 
      minHeight="min-h-[70vh]" 
    />
  );
}

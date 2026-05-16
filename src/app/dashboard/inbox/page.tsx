import LiveInbox from '@/components/inbox/LiveInbox';

export const metadata = {
  title: 'Live Inbox | NeuralDesk',
  description: 'Monitor and take over AI conversations in real-time.',
};

export default function InboxPage() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Live Inbox</h1>
        <p className="text-white/40 text-sm mt-1.5 max-w-2xl">
          Real-time conversation monitoring. Intervene when the AI needs help or a human touch is required to close the deal.
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <LiveInbox />
      </div>
    </div>
  );
}

import { DashboardOverview } from "@/components/dashboard-overview";
import { LibraryView } from "@/components/library-view";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <DashboardOverview />
      <LibraryView endpoint="/api/tracks?sort=newest&pageSize=5" title="Recently Added" subtitle="The latest tracks added through upload or forwarding to the bot." />
    </div>
  );
}

import { HeroLeftPanel } from "./HeroLeftPanel";
import { HeroRightPanel } from "./HeroRightPanel";

export function Hero() {
  return (
    <section className="grid min-h-screen content-start grid-cols-1 pt-16 md:content-stretch md:grid-cols-[minmax(0,42%)_1fr] md:pt-0">
      <div className="bg-panel">
        <HeroLeftPanel />
      </div>
      <div className="bg-background">
        <HeroRightPanel />
      </div>
    </section>
  );
}

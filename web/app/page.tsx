import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/hero/Hero";
import { TrustLogos } from "@/components/sections/TrustLogos";
import { TrustedMemorySection } from "@/components/sections/TrustedMemorySection";
import { LiveMetricsSection } from "@/components/sections/LiveMetricsSection";
import { BriefingPreviewSection } from "@/components/sections/BriefingPreviewSection";
import { TimelineMemorySection } from "@/components/sections/TimelineMemorySection";
import { WhySaleSightsSection } from "@/components/sections/WhySaleSightsSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <div id="privacy">
          <TrustLogos />
        </div>
        <div id="how-it-works">
          <TrustedMemorySection />
        </div>
        <LiveMetricsSection />
        <BriefingPreviewSection />
        <TimelineMemorySection />
        <WhySaleSightsSection />
        <FinalCTASection />
      </main>
    </>
  );
}

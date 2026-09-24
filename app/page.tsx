import { HeroScrub } from "@/components/hero/HeroScrub";
import { BeforeAfterSection } from "@/components/before-after/BeforeAfterSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { WeddingsSection } from "@/components/weddings/WeddingsSection";
import { CarShowcase } from "@/components/social-proof/CarShowcase";
import { ProcessSection } from "@/components/process/ProcessSection";
import { FinalCta } from "@/components/cta/FinalCta";
import { Footer } from "@/components/footer/Footer";
import { LogoButton } from "@/components/shared/LogoButton";
import { SectionDivider } from "@/components/shared/SectionDivider";
import { PageLedField } from "@/components/shared/PageLedField";

export default function Home() {
  return (
    <main className="relative isolate">
      <PageLedField />
      <HeroScrub />
      <div className="reserve-fixed">
        <LogoButton variant="hero" />
      </div>
      <BeforeAfterSection />
      <ServicesSection />
      <WeddingsSection />
      <CarShowcase />
      <SectionDivider />
      <ProcessSection />
      <FinalCta />
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import { HeroSection } from "@/components/public/landing/hero-section";
import { UpcomingEventsSection } from "@/components/public/landing/upcoming-events-section";
import { CategoriesSection } from "@/components/public/landing/categories-section";
import { HowItWorksSection } from "@/components/public/landing/how-it-works-section";
import { FeaturesSection } from "@/components/public/landing/features-section";
import { TestimonialsSection } from "@/components/public/landing/testimonials-section";
import { CtaSection } from "@/components/public/landing/cta-section";

export const metadata: Metadata = {
  title: "Ariba IT — Live IT & Cybersecurity Training in Bangladesh",
  description:
    "Discover, register, and join live cybersecurity and IT training programs. Expert-led bootcamps, workshops, and webinars via Zoom, Google Meet & Teams. bKash & Nagad accepted.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <UpcomingEventsSection />
      <HowItWorksSection />
      <CategoriesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}

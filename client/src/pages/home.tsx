import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import AiFeatures from '@/components/home/AiFeatures';
import DashboardPreview from '@/components/home/DashboardPreview';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import CtaSection from '@/components/home/CtaSection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AiFeatures />
        <DashboardPreview />
        <Testimonials />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

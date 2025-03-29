import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import AiFeatures from '@/components/home/AiFeatures';
import DashboardPreview from '@/components/home/DashboardPreview';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import CtaSection from '@/components/home/CtaSection';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <>
      <Hero />
      <Features />
      <AiFeatures />
      <DashboardPreview />
      <Testimonials />
      <Pricing />
      <CtaSection />
    </>
  );
}

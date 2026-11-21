import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HeroSection from '@/components/home/HeroSection';
import HomeContent from '@/components/home/HomeContent';
import LightTrails from '@/components/living-network/LightTrails';
import JourneySpine from '@/components/living-network/JourneySpine';

export default function Home() {
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.Doctor.list('-rating', 6),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.TreatmentPackage.list('-rating', 6),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['retailer-products-home'],
    queryFn: () => base44.entities.RetailerProduct.list('-rating', 8),
  });

  return (
    <div className="relative">
      <LightTrails />
      <JourneySpine />
      <div className="relative" style={{ zIndex: 1 }}>
        <HeroSection />
        <HomeContent doctors={doctors} packages={packages} products={products} />
      </div>
    </div>
  );
}
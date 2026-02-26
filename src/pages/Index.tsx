import HeroCarousel from "@/components/storefront/HeroCarousel";
import CategoryShowcase from "@/components/storefront/CategoryShowcase";
import FeaturedSection from "@/components/storefront/FeaturedSection";
import TrendingCarousel from "@/components/storefront/TrendingCarousel";
import CollectionBanner from "@/components/storefront/CollectionBanner";
import BrandMarquee from "@/components/storefront/BrandMarquee";
import NewsletterSection from "@/components/storefront/NewsletterSection";
import StorefrontLayout from "@/components/storefront/StorefrontLayout";

export default function Index() {
  return (
    <StorefrontLayout>
      <HeroCarousel />
      <BrandMarquee />
      <CategoryShowcase />
      <FeaturedSection />
      <TrendingCarousel />
      <CollectionBanner />
      <NewsletterSection />
    </StorefrontLayout>
  );
}

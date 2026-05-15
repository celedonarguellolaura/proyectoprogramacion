import type { Metadata } from 'next';
import { readHomeData } from '@/lib/dataService';
import HolaMundo from '@/components/HolaMundo';

export async function generateMetadata(): Promise<Metadata> {
  const data = readHomeData();
  return {
    title: data.meta.pageTitle,
    description: data.meta.description,
  };
}

export default function HomePage() {
  const homeData = readHomeData();

  return (
    <main>
      <HolaMundo
        title={homeData.hero.title}
        subtitle={homeData.hero.subtitle}
        description={homeData.hero.description}
      />
    </main>
  );
}

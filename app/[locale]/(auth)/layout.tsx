import Image from 'next/image';
import { PageContainer } from '@/components/layout/page-container';

// One frame for every auth screen: form beside a brand image on desktop, image on top on mobile.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <div className="grid w-full md:grid-cols-2 md:gap-10">
        <div className="relative order-first mb-8 h-48 md:order-last md:mb-0 md:h-auto md:min-h-[32rem]">
          <Image src="/images/hero-2.jpg" alt="" fill priority className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div className="flex w-full flex-col justify-center py-4">{children}</div>
      </div>
    </PageContainer>
  );
}

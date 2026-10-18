import { PageContainer } from '@/components/layout/page-container';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16">
        {children}
      </div>
    </PageContainer>
  );
}

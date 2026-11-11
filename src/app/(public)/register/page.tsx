import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import RegistrationForm from '@/components/registration/RegistrationForm';
import { settingsService } from '@/services/settings.service';

// Force real-time dynamic rendering on every request - never serve stale cached static HTML
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RegisterPage() {
  const settings = await settingsService.getPublicSettings();

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        <RegistrationForm initialSettings={settings} />
      </main>
      <MobileBottomNav />
    </div>
  );
}

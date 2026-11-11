import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import RegistrationForm from '@/components/registration/RegistrationForm';
import { settingsService } from '@/services/settings.service';

export default async function RegisterPage() {
  const settings = await settingsService.getPublicSettings();

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        <RegistrationForm settings={settings} />
      </main>
      <MobileBottomNav />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registrationSchema,
  RegistrationFormData
} from '@/lib/validations/registration';
import { PublicTournamentSettings } from '@/types/settings';
import QRCodeDisplay from './QRCodeDisplay';
import { BatIcon, BallIcon, AllRounderIcon, KeeperIcon } from './CricketIcons';
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  Send,
  Loader2,
  Info
} from 'lucide-react';

interface RegistrationFormProps {
  settings: PublicTournamentSettings;
}

export default function RegistrationForm({ settings }: RegistrationFormProps) {
  const router = useRouter();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // File upload state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema) as any,
    defaultValues: {
      full_name: '',
      email: '',
      mobile: '',
      date_of_birth: '',
      city: '',
      address: '',
      profile_photo_path: null,
      playing_role: 'batsman',
      batting_style: 'right_hand',
      bowling_arm: 'right_arm',
      bowling_type: 'medium',
      experience_level: '3_5_years',
      previous_team_name: '',
      previous_captain_name: '',
      previous_tournament: false,
      previous_tournament_name: '',
      additional_information: '',
      emergency_contact_name: '',
      emergency_relationship: '',
      emergency_mobile: '',
      utr_number: '',
      screenshot_path: '',
      amount: settings.registration_fee || 500,
      confirm_accuracy: false,
      accept_rules: false,
      confirm_payment: false
    }
  });

  const selectedRole = watch('playing_role');
  const selectedBatting = watch('batting_style');
  const selectedArm = watch('bowling_arm');
  const selectedBowlingType = watch('bowling_type');

  const copyUpiId = () => {
    navigator.clipboard.writeText(settings.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Upload Profile Photo Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Photo must be less than 3 MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/uploads/player-photo', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (res.ok && result.filePath) {
        setPhotoPreview(result.filePath);
        setPhotoName(result.fileName || file.name);
        setValue('profile_photo_path', result.filePath, { shouldValidate: true });
      } else {
        alert(result.error || 'Failed to upload photo');
      }
    } catch {
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoName(null);
    setValue('profile_photo_path', null);
  };

  // Upload Payment Screenshot Handler
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Screenshot file must be under 5 MB');
      return;
    }

    setUploadingScreenshot(true);
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/uploads/payment-screenshot', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (res.ok && result.filePath) {
        setScreenshotPreview(result.filePath);
        setScreenshotName(result.fileName || file.name);
        setValue('screenshot_path', result.filePath, { shouldValidate: true });
      } else {
        alert(result.error || 'Failed to upload screenshot');
      }
    } catch {
      alert('Screenshot upload failed');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const removeScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotName(null);
    setValue('screenshot_path', '');
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to submit registration');
      }

      const regId = responseData.data?.player?.registration_id;
      if (regId) {
        router.push(`/registration-success?id=${encodeURIComponent(regId)}`);
      } else {
        router.push('/registration-success');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setServerError(err.message || 'An error occurred during submission. Please check your inputs.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings.registration_open) {
    return (
      <div className="bg-white border border-brand-border rounded-2xl p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-brand-dark mb-2">Registrations Closed</h2>
        <p className="text-brand-muted text-sm leading-relaxed mb-6">
          Player registrations for {settings.tournament_name} are currently closed. If you have already registered, you can track your verification status below.
        </p>
        <button
          onClick={() => router.push('/track-status')}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary-green hover:bg-primary-dark text-white font-medium transition-colors"
        >
          Track My Registration Status
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-green text-primary-green text-xs font-semibold border border-primary-green/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Registration Fee: ₹{settings.registration_fee} • Strict League Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          {settings.tournament_name}
        </h1>
        <p className="text-primary-green font-bold text-sm sm:text-base">
          Official Player Registration Portal
        </p>
        <p className="text-brand-muted text-xs sm:text-sm leading-relaxed pt-0.5">
          Complete your profile, submit emergency contacts, and confirm your ₹{settings.registration_fee} UPI payment to enter the tournament docket.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h4 className="font-semibold text-sm">Submission Error</h4>
            <p className="text-xs sm:text-sm mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* SECTION 1: PERSONAL DETAILS */}
      {/* ============================================================================== */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-primary-green text-white flex items-center justify-center font-bold text-xs shadow-xs">
            1
          </div>
          <h2 className="font-bold text-base text-brand-dark uppercase tracking-wide">
            Personal Information
          </h2>
        </div>

        <div className="space-y-4 pt-1">
          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              Full Player Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('full_name')}
              placeholder="e.g. Rohit Sharma"
              className={`w-full h-11 px-3.5 rounded-lg border ${
                errors.full_name ? 'border-red-500' : 'border-brand-border'
              } text-sm text-brand-dark bg-white focus-ring`}
            />
            {errors.full_name && (
              <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
            )}
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="rohit.sharma@example.com"
                className={`w-full h-11 px-3.5 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-brand-border'
                } text-sm text-brand-dark bg-white focus-ring`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('mobile')}
                placeholder="10-digit mobile number"
                className={`w-full h-11 px-3.5 rounded-lg border ${
                  errors.mobile ? 'border-red-500' : 'border-brand-border'
                } text-sm text-brand-dark bg-white focus-ring`}
              />
              {errors.mobile && (
                <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>
              )}
            </div>
          </div>

          {/* DOB & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('date_of_birth')}
                className={`w-full h-11 px-3.5 rounded-lg border ${
                  errors.date_of_birth ? 'border-red-500' : 'border-brand-border'
                } text-sm text-brand-dark bg-white focus-ring`}
              />
              {errors.date_of_birth && (
                <p className="text-xs text-red-500 mt-1">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('city')}
                placeholder="e.g. Mumbai"
                className={`w-full h-11 px-3.5 rounded-lg border ${
                  errors.city ? 'border-red-500' : 'border-brand-border'
                } text-sm text-brand-dark bg-white focus-ring`}
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              Full Residential Address / Area <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('address')}
              rows={2}
              placeholder="Street, area, landmark, pincode"
              className={`w-full p-3 rounded-lg border ${
                errors.address ? 'border-red-500' : 'border-brand-border'
              } text-sm text-brand-dark bg-white focus-ring`}
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              Player Profile Photo <span className="text-brand-muted text-xs font-normal">(Optional, max 3MB)</span>
            </label>
            {photoPreview ? (
              <div className="p-3 bg-gray-50 border border-brand-border rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={photoPreview}
                    alt="Player Profile Preview"
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-brand-dark truncate">{photoName}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary-green font-semibold mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-primary-green rounded-xl cursor-pointer bg-gray-50 hover:bg-light-green/30 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <div className="flex items-center gap-2 text-xs text-brand-muted">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-green" />
                    <span>Uploading photo...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-primary-green mb-1" />
                    <span className="text-xs font-semibold text-brand-dark">Click to upload headshot photo</span>
                    <span className="text-[11px] text-brand-muted">JPG, PNG or WEBP (Max 3MB)</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* SECTION 2: CRICKET PROFILE */}
      {/* ============================================================================== */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-primary-green text-white flex items-center justify-center font-bold text-xs shadow-xs">
            2
          </div>
          <h2 className="font-bold text-base text-brand-dark uppercase tracking-wide">
            Cricket Profile
          </h2>
        </div>

        {/* Playing Role Cards - Designed with Cricket Icons & Selection Checkmark */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-2.5">
            Playing Role <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                id: 'batsman',
                label: 'Batsman',
                desc: 'Top/Middle order specialist',
                icon: BatIcon
              },
              {
                id: 'bowler',
                label: 'Bowler',
                desc: 'Pace or spin strike weapon',
                icon: BallIcon
              },
              {
                id: 'all_rounder',
                label: 'All-Rounder',
                desc: 'Dual capability asset',
                icon: AllRounderIcon
              },
              {
                id: 'wicketkeeper',
                label: 'Wicketkeeper',
                desc: 'Glovework & top/finisher bat',
                icon: KeeperIcon
              }
            ].map(role => {
              const isSelected = selectedRole === role.id;
              const IconComp = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => setValue('playing_role', role.id as any, { shouldValidate: true })}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[105px] border ${
                    isSelected
                      ? 'bg-light-green border-primary-green shadow-xs ring-1 ring-primary-green'
                      : 'bg-white border-brand-border hover:bg-gray-50/80 hover:border-gray-300'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-primary-green text-white' : 'bg-gray-100 text-brand-muted'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-primary-green fill-primary-green/10" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300" />
                    )}
                  </div>

                  <div className="mt-2.5">
                    <p
                      className={`text-sm font-bold leading-tight ${
                        isSelected ? 'text-primary-green' : 'text-brand-dark'
                      }`}
                    >
                      {role.label}
                    </p>
                    <p className="text-[11px] text-brand-muted leading-tight mt-0.5">
                      {role.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.playing_role && (
            <p className="text-xs text-red-500 mt-1">{errors.playing_role.message}</p>
          )}
        </div>

        {/* Batting Style Chips */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-2">
            Batting Style <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'right_hand', label: 'Right Hand' },
              { id: 'left_hand', label: 'Left Hand' }
            ].map(item => {
              const active = selectedBatting === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setValue('batting_style', item.id as any, { shouldValidate: true })}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-green text-white shadow-xs'
                      : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bowling Arm Chips */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-2">
            Bowling Arm <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'right_arm', label: 'Right Arm' },
              { id: 'left_arm', label: 'Left Arm' },
              { id: 'do_not_bowl', label: 'Do Not Bowl' }
            ].map(item => {
              const active = selectedArm === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setValue('bowling_arm', item.id as any, { shouldValidate: true })}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-green text-white shadow-xs'
                      : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bowling Type Chips */}
        {selectedArm !== 'do_not_bowl' && (
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-2">
              Bowling Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'fast', label: 'Fast / Pace' },
                { id: 'medium', label: 'Medium' },
                { id: 'spin', label: 'Spin' },
                { id: 'not_applicable', label: 'Not Applicable' }
              ].map(item => {
                const active = selectedBowlingType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue('bowling_type', item.id as any, { shouldValidate: true })}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-green text-white shadow-xs'
                        : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================================== */}
      {/* SECTION 3: EMERGENCY CONTACT */}
      {/* ============================================================================== */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-primary-green text-white flex items-center justify-center font-bold text-xs shadow-xs">
            3
          </div>
          <h2 className="font-bold text-base text-brand-dark uppercase tracking-wide">
            Emergency Contact Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('emergency_contact_name')}
              placeholder="e.g. Suresh Sharma"
              className={`w-full h-11 px-3.5 rounded-lg border ${
                errors.emergency_contact_name ? 'border-red-500' : 'border-brand-border'
              } text-sm text-brand-dark bg-white focus-ring`}
            />
            {errors.emergency_contact_name && (
              <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              Relationship <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('emergency_relationship')}
              placeholder="e.g. Father, Brother"
              className={`w-full h-11 px-3.5 rounded-lg border ${
                errors.emergency_relationship ? 'border-red-500' : 'border-brand-border'
              } text-sm text-brand-dark bg-white focus-ring`}
            />
            {errors.emergency_relationship && (
              <p className="text-xs text-red-500 mt-1">{errors.emergency_relationship.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              Emergency Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('emergency_mobile')}
              placeholder="10-digit number"
              className={`w-full h-11 px-3.5 rounded-lg border ${
                errors.emergency_mobile ? 'border-red-500' : 'border-brand-border'
              } text-sm text-brand-dark bg-white focus-ring`}
            />
            {errors.emergency_mobile && (
              <p className="text-xs text-red-500 mt-1">{errors.emergency_mobile.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* SECTION 4: REGISTRATION PAYMENT (₹500 UPI) */}
      {/* ============================================================================== */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary-green text-white flex items-center justify-center font-bold text-xs shadow-xs">
              4
            </div>
            <h2 className="font-bold text-base text-brand-dark uppercase tracking-wide">
              Registration Payment
            </h2>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-light-green text-primary-green font-bold text-sm border border-primary-green/20">
            ₹{settings.registration_fee}
          </span>
        </div>

        {/* Payment Card with QR & UPI ID */}
        <div className="bg-gray-50 border border-brand-border rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-brand-border">
            {/* Live QR Code */}
            <QRCodeDisplay
              upiId={settings.upi_id}
              amount={settings.registration_fee}
              tournamentName={settings.tournament_name}
              customQrPath={settings.upi_qr_path}
            />

            {/* UPI Details & Instructions */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <span className="text-xs text-brand-muted font-medium">Official Tournament UPI ID</span>
                <div className="flex items-center justify-between bg-gray-50 border border-brand-border px-3 py-2 rounded-lg mt-1">
                  <span className="text-xs sm:text-sm font-mono font-semibold text-brand-dark select-all truncate">
                    {settings.upi_id}
                  </span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="inline-flex items-center gap-1 text-xs text-primary-green font-semibold hover:underline ml-2 flex-shrink-0"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy ID
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3 Step Instructions */}
              <div className="space-y-1 text-xs text-brand-muted">
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-primary-green">1.</span> Scan QR code or copy UPI ID in GPay / PhonePe / Paytm.
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-primary-green">2.</span> Pay exactly ₹{settings.registration_fee} from your verified account.
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-primary-green">3.</span> Copy the 12-digit UTR reference & upload screenshot receipt below.
                </p>
              </div>
            </div>
          </div>

          {/* UTR Number Input */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              UTR / Transaction Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={12}
              {...register('utr_number')}
              placeholder="12-digit numeric UTR e.g. 403928174629"
              className={`w-full h-11 px-3.5 rounded-lg border ${
                errors.utr_number ? 'border-red-500' : 'border-brand-border'
              } text-sm font-mono text-brand-dark bg-white focus-ring`}
            />
            {errors.utr_number && (
              <p className="text-xs text-red-500 mt-1">{errors.utr_number.message}</p>
            )}
            <p className="text-[11px] text-brand-muted mt-1">
              The 12-digit transaction reference shown on your bank/UPI debit receipt.
            </p>
          </div>

          {/* Payment Screenshot Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-brand-dark mb-1">
              Payment Screenshot Receipt <span className="text-red-500">*</span>
            </label>
            {screenshotPreview ? (
              <div className="p-3 bg-white border border-brand-border rounded-xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={screenshotPreview}
                    alt="Payment receipt preview"
                    className="w-12 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-brand-dark truncate">{screenshotName}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary-green font-semibold mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot Attached
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove screenshot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 hover:border-primary-green rounded-xl cursor-pointer bg-white hover:bg-light-green/30 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleScreenshotUpload}
                  disabled={uploadingScreenshot}
                />
                {uploadingScreenshot ? (
                  <div className="flex items-center gap-2 text-xs text-brand-muted">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-green" />
                    <span>Uploading receipt...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-primary-green mb-1" />
                    <span className="text-xs font-semibold text-brand-dark">Click to upload payment screenshot</span>
                    <span className="text-[11px] text-brand-muted">JPG, PNG or WEBP (Max 5MB)</span>
                  </>
                )}
              </label>
            )}
            {errors.screenshot_path && (
              <p className="text-xs text-red-500 mt-1">{errors.screenshot_path.message}</p>
            )}
          </div>

          {/* Verification Warning Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-700" />
            <p className="text-xs leading-relaxed">
              <strong>Mandatory Notice:</strong> Uploading a screenshot does not automatically confirm payment or registration. All submissions are manually verified against bank ledger records by tournament administrators. Any falsified or reused UTR will result in disqualification.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* SECTION 5: DECLARATION */}
      {/* ============================================================================== */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 sm:p-7 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-primary-green text-white flex items-center justify-center font-bold text-xs shadow-xs">
            5
          </div>
          <h2 className="font-bold text-base text-brand-dark uppercase tracking-wide">
            Declaration & Agreement
          </h2>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('confirm_accuracy')}
              className="w-4 h-4 mt-0.5 accent-primary-green rounded cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-brand-dark">
              I confirm that all personal and cricket information provided is true and matches my official identification.
            </span>
          </label>
          {errors.confirm_accuracy && (
            <p className="text-xs text-red-500 ml-7">{errors.confirm_accuracy.message}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('accept_rules')}
              className="w-4 h-4 mt-0.5 accent-primary-green rounded cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-brand-dark">
              I agree to abide by tournament rules, disciplinary codes, and official league guidelines.
            </span>
          </label>
          {errors.accept_rules && (
            <p className="text-xs text-red-500 ml-7">{errors.accept_rules.message}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('confirm_payment')}
              className="w-4 h-4 mt-0.5 accent-primary-green rounded cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-brand-dark">
              I confirm that I have transferred ₹{settings.registration_fee} via legitimate UPI payment rails and entered the correct 12-digit UTR.
            </span>
          </label>
          {errors.confirm_payment && (
            <p className="text-xs text-red-500 ml-7">{errors.confirm_payment.message}</p>
          )}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* FINAL SUBMIT BUTTON */}
      {/* ============================================================================== */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl bg-primary-green hover:bg-primary-dark text-white font-bold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Registration...</span>
            </>
          ) : (
            <>
              <span>Submit Player Registration</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-center text-xs text-brand-muted mt-2">
          Secure Submission • Admin review queue SLA: 2–4 hours
        </p>
      </div>
    </form>
  );
}

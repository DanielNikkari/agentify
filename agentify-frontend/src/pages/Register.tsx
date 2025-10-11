// src/views/Register.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import agentifyLogo from '../assets/agentify-logo-with-name.svg';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import TermsAndServices from '../components/TermsAndConditions';
import SlideAlert from '../components/SlideAlert';

// …imports stay the same

export default function Register() {
  const navigate = useNavigate();

  // email auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // highlight mismatch
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // alert state
  const [alert, setAlert] = useState<{
    type: 'error' | 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // terms and conditions state
  const [showTerms, setShowTerms] = useState(false);

  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const firebaseErrorToMessage = (err: any) => {
    const code = (err as AuthError)?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email is already in use. Try signing in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return 'Sign-up failed. Please check your details and try again.';
    }
  };

  const handleEmailRegistration = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setAlert({ type: 'error', message: 'Please enter your email.' });
      return;
    }
    if (password.length < 6) {
      setAlert({ type: 'error', message: 'Password should be at least 6 characters.' });
      return;
    }
    if (password !== retypePassword) {
      setPasswordMismatch(true); // <-- turn borders red
      setAlert({ type: 'error', message: 'Sign-up failed, the passwords do not match.' });
      return;
    }

    try {
      setSubmitting(true);
      setPasswordMismatch(false); // just in case it was set previously
      await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      navigate('/');
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err?.message);
      setAlert({ type: 'error', message: firebaseErrorToMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  // helper to build input classes
  const pwClass = (error: boolean) =>
    `h-12 w-full rounded-full bg-white text-agentify-dark px-5 text-base shadow-sm outline-none transition
     ${error ? 'ring-2 ring-red-500 focus:ring-red-600' : 'ring-1 ring-black/5 focus:ring-2 focus:ring-agentify-dark'}`;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] text-center">
      {alert && (
        <SlideAlert
          type={alert.type}
          message={alert.message}
          duration={7000}
          onClose={() => setAlert(null)}
        />
      )}

      <img
        src={agentifyLogo}
        alt="Agentify Logo"
        className="w-60 mb-6 prevent-drag"
        draggable={false}
      />

      <h1 className="text-2xl font-semibold mb-8 text-agentify-dark">sign up with email</h1>

      <section className="pr-6 pl-6 min-w-100 flex-none px-1">
        <form onSubmit={handleEmailRegistration} className="flex flex-col gap-4 items-stretch">
          <input
            ref={emailInputRef}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-full bg-white text-agentify-dark px-5 text-base shadow-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-agentify-dark transition"
            required
          />

          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordMismatch) setPasswordMismatch(false); // <-- remove red border on edit
            }}
            className={pwClass(passwordMismatch)}
            aria-invalid={passwordMismatch}
            required
            minLength={6}
          />

          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="retype password"
            value={retypePassword}
            onChange={(e) => {
              setRetypePassword(e.target.value);
              if (passwordMismatch) setPasswordMismatch(false); // <-- remove red border on edit
            }}
            className={pwClass(passwordMismatch)}
            aria-invalid={passwordMismatch}
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-full bg-agentify-accent-coral text-white text-base font-medium hover:shadow-lg transition disabled:opacity-60 hover:border-2 border-agentify-dark"
          >
            {submitting ? 'Signing up…' : 'sign up'}
          </button>
        </form>
      </section>

      <p className="mt-6 text-sm text-gray-600">
        Already a user?{' '}
        <button
          onClick={() => navigate('/login')}
          className="underline text-agentify-dark-gray hover:text-agentify-dark hover:cursor-pointer"
        >
          Sign in here.
        </button>
      </p>

      <p className="mt-4 text-xs text-gray-500 max-w-xs text-center">
        By signing in, you agree to agentify&apos;s{' '}
        <button
          onClick={() => setShowTerms(true)}
          className="underline text-agentify-dark-gray hover:text-agentify-dark hover:cursor-pointer"
        >
          Terms &amp; Conditions
        </button>
        .
      </p>

      <TermsAndServices isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

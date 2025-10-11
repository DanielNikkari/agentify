import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import agentifyLogo from '../assets/agentify-logo-with-name.svg';
import emailIcon from '../assets/icons/email-icon.svg';
import githubIcon from '../assets/icons/github-icon.svg';
import googleIcon from '../assets/icons/google-icon.svg';
import { auth } from '../lib/firebase';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import AuthButton from '../components/AuthButton';
import TermsAndServices from '../components/TermsAndServices';

export default function Login() {
  const navigate = useNavigate();

  // slider state: 0 = provider buttons, 1 = email form
  const [slide, setSlide] = useState<0 | 1>(0);

  // email auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // terms and conditions state
  const [showTerms, setShowTerms] = useState(false);

  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // focus the email input when entering slide 1 -> 2
  useEffect(() => {
    if (slide === 1) {
      // short delay ensures element is in the DOM after the transform tick
      const id = setTimeout(() => emailInputRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }
  }, [slide]);

  // keyboard: Escape returns to first slide
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && slide === 1) setSlide(0);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slide]);

  const goTo = (i: 0 | 1) => setSlide(i);

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err?.message);
      setError(err?.message ?? 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setSubmitting(true);
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error('GitHub Sign-In Error:', err?.message);
      setError(err?.message ?? 'GitHub sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEmail = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch (err: any) {
      console.error('Email Sign-In Error:', err?.message);
      setError('Sign-in failed. Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] text-center">
      {/* Logo */}
      <img
        src={agentifyLogo}
        alt="Agentify Logo"
        className="w-60 mb-6 prevent-drag"
        draggable={false}
      />

      {/* dynamic title per slide */}
      <h1 className="text-2xl font-semibold mb-8 text-agentify-dark">
        {slide === 0 ? 'sign in' : 'sign in with email'}
      </h1>

      {/* Slider viewport */}
      <div className="w-full h-full p-4 max-w-md overflow-hidden">
        {/* Track (2 slides). We translate the track by 0% or -50%. */}
        <div
          className="
            flex transition-transform ease-out
            transform-gpu will-change-transform motion-reduce:transition-none
          "
          style={{ transform: `translateX(-${slide * 100}%)` }} // slide = 0 or 1
        >
          {/* Slide 1: provider buttons */}
          <section className="pr-6 pl-6 min-w-full flex-none px-1">
            <div className="flex flex-col gap-4">
              {/* GitHub */}
              <AuthButton
                icon={githubIcon}
                label="Sign in with GitHub"
                onClick={handleGithubSignIn}
                disabled={submitting}
                bgClass="bg-agentify-dark"
                textClass="text-white"
                hoverClass="hover:shadow-lg hover:border"
                borderClass="border-agentify-white"
                shadowClass="shadow-sm"
              />

              {/* Google */}
              <AuthButton
                icon={googleIcon}
                label="Sign in with Google"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                bgClass="bg-agentify-white"
                textClass="text-agentify-dark"
                hoverClass="hover:shadow-lg hover:border"
                borderClass="border-agentify-dark-gray"
                shadowClass="shadow-sm"
              />

              {/* Email -> go to slide 2 */}
              <AuthButton
                icon={emailIcon}
                label="Sign in with email"
                onClick={() => goTo(1)}
                bgClass="bg-agentify-white"
                textClass="text-agentify-dark"
                hoverClass="hover:shadow-lg hover:border"
                borderClass="border-agentify-dark-gray"
                shadowClass="shadow-sm"
              />
            </div>
          </section>

          {/* Slide 2: email form */}
          <section className="pr-6 pl-6 min-w-full flex-none px-1">
            <form
              onSubmit={submitEmail}
              className="flex flex-col gap-4 items-stretch"
              aria-describedby={error ? 'email-auth-error' : undefined}
            >
              <input
                ref={emailInputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-full bg-white text-agentify-dark px-5 text-base shadow-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-agentify-dark"
                required
              />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-full bg-white text-agentify-dark px-5 text-base shadow-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-agentify-dark"
                required
              />

              {error && (
                <div id="email-auth-error" className="text-sm text-red-600 text-left px-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-full bg-agentify-accent-coral text-white text-base font-medium hover:shadow-lg transition disabled:opacity-60 hover:border-2 border-agentify-dark"
              >
                {submitting ? 'Signing in…' : 'sign in'}
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Slider indicators */}
      <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
        <button
          type="button"
          onClick={() => goTo(0)}
          className={`w-3 h-3 rounded-full ${
            slide === 0 ? 'bg-agentify-accent-coral' : 'bg-agentify-dark-gray'
          }`}
          aria-current={slide === 0}
          aria-label="All sign-in options"
        />
        <button
          type="button"
          onClick={() => goTo(1)}
          className={`w-3 h-3 rounded-full ${
            slide === 1 ? 'bg-agentify-accent-coral' : 'bg-agentify-dark-gray'
          }`}
          aria-current={slide === 1}
          aria-label="Email sign-in"
        />
      </div>

      {/* Footer */}
      <p className="mt-6 text-sm text-gray-600">
        New user?{' '}
        <button
          onClick={() => navigate('/register')}
          className="underline text-agentify-dark-gray hover:text-agentify-dark hover:cursor-pointer"
        >
          Register here.
        </button>
      </p>
      {/* Disclaimer under sign-in buttons */}
      <p className="mt-4 text-xs text-gray-500 max-w-xs text-center">
        By signing in, you agree to agentify's{' '}
        <button
          onClick={() => setShowTerms(true)}
          className="underline text-agentify-dark-gray hover:text-agentify-dark hover:cursor-pointer"
        >
          Terms & Conditions
        </button>
        .
      </p>
      {/* Modal */}
      <TermsAndServices isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

// src/views/Home.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AgentifyLoader from '../components/AgentifyLoader';
import '../components/AgentifyLoader.css';
import emptyBox from '../assets/illustrations/missing.png';
import agentifyLogo from '../assets/agentify-logo-with-name.svg';
import TermsAndConditions from '../components/TermsAndConditions';

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  // terms and conditions state
  const [showTerms, setShowTerms] = useState(false);

  if (loading)
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] text-center">
        <AgentifyLoader type="spinner" width="w-10" height="h-10" />
        <h4 className="text-agentify-dark-gray dots-loader mt-3">Authenticating...</h4>
      </div>
    );

  if (error) return <p className="text-center text-red-500 mt-10">Error: {error.message}</p>;

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-agentify-bg-gray text-center">
        <h1 className="text-2xl font-semibold text-agentify-dark m-2">
          Please sign in to continue.
        </h1>
        <button
          onClick={() => navigate('/login')}
          className="m-6 px-6 py-3 rounded-full bg-agentify-accent-coral text-white font-medium hover:shadow-lg transition border-agentify-dark"
        >
          go to login
        </button>
      </div>
    );

  // Main Home view
  return (
    <div className="flex min-h-screen bg-agentify-bg-gray">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-3 flex items-center space-x-2">
            <img
              src={agentifyLogo}
              alt="Agentify Logo"
              className="w-25 m-auto mt-4 prevent-drag"
              draggable={false}
            />
          </div>

          {/* Navigation */}
          <nav className="mt-4 space-y-2">
            <button className="w-9/10 flex items-center m-auto gap-3 px-6 py-3 rounded-xl bg-agentify-light-coral text-agentify-accent-coral font-medium bg-agentify-bg-gray">
              <span className="text-lg">
                <svg
                  viewBox="0 0 100 108"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 fill-agentify-accent-coral"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M34.6154 23.1429C34.6154 26.2118 33.3997 29.155 31.2358 31.3251C29.072 33.4952 26.1371 34.7143 23.0769 34.7143C20.0167 34.7143 17.0819 33.4952 14.918 31.3251C12.7541 29.155 11.5385 26.2118 11.5385 23.1429C11.5385 20.0739 12.7541 17.1307 14.918 14.9606C17.0819 12.7906 20.0167 11.5714 23.0769 11.5714C26.1371 11.5714 29.072 12.7906 31.2358 14.9606C33.3997 17.1307 34.6154 20.0739 34.6154 23.1429ZM46.1538 23.1429C46.1538 29.2807 43.7225 35.1672 39.3948 39.5073C35.067 43.8475 29.1973 46.2857 23.0769 46.2857C16.9565 46.2857 11.0868 43.8475 6.75907 39.5073C2.43131 35.1672 0 29.2807 0 23.1429C0 17.005 2.43131 11.1185 6.75907 6.77839C11.0868 2.43826 16.9565 0 23.0769 0C29.1973 0 35.067 2.43826 39.3948 6.77839C43.7225 11.1185 46.1538 17.005 46.1538 23.1429ZM76.9231 65.5714C79.9833 65.5714 82.9181 64.3523 85.082 62.1822C87.2459 60.0122 88.4615 57.0689 88.4615 54C88.4615 50.9311 87.2459 47.9878 85.082 45.8178C82.9181 43.6477 79.9833 42.4286 76.9231 42.4286C73.8629 42.4286 70.928 43.6477 68.7642 45.8178C66.6003 47.9878 65.3846 50.9311 65.3846 54C65.3846 57.0689 66.6003 60.0122 68.7642 62.1822C70.928 64.3523 73.8629 65.5714 76.9231 65.5714ZM76.9231 77.1429C83.0435 77.1429 88.9132 74.7046 93.2409 70.3645C97.5687 66.0243 100 60.1379 100 54C100 47.8621 97.5687 41.9757 93.2409 37.6355C88.9132 33.2954 83.0435 30.8571 76.9231 30.8571C70.8027 30.8571 64.933 33.2954 60.6052 37.6355C56.2775 41.9757 53.8462 47.8621 53.8462 54C53.8462 60.1379 56.2775 66.0243 60.6052 70.3645C64.933 74.7046 70.8027 77.1429 76.9231 77.1429ZM23.0769 96.4286C26.1371 96.4286 29.072 95.2094 31.2358 93.0394C33.3997 90.8693 34.6154 87.9261 34.6154 84.8571C34.6154 81.7882 33.3997 78.845 31.2358 76.6749C29.072 74.5048 26.1371 73.2857 23.0769 73.2857C20.0167 73.2857 17.0819 74.5048 14.918 76.6749C12.7541 78.845 11.5385 81.7882 11.5385 84.8571C11.5385 87.9261 12.7541 90.8693 14.918 93.0394C17.0819 95.2094 20.0167 96.4286 23.0769 96.4286ZM23.0769 108C29.1973 108 35.067 105.562 39.3948 101.222C43.7225 96.8815 46.1538 90.995 46.1538 84.8571C46.1538 78.7193 43.7225 72.8328 39.3948 68.4927C35.067 64.1525 29.1973 61.7143 23.0769 61.7143C16.9565 61.7143 11.0868 64.1525 6.75907 68.4927C2.43131 72.8328 0 78.7193 0 84.8571C0 90.995 2.43131 96.8815 6.75907 101.222C11.0868 105.562 16.9565 108 23.0769 108Z"
                  ></path>
                </svg>
              </span>{' '}
              agents
            </button>
            <button className="w-9/10 flex items-center m-auto gap-3 px-6 py-3 text-agentify-dark-gray hover:bg-agentify-bg-gray rounded-xl">
              <span className="text-lg">
                <svg
                  viewBox="0 0 110 110"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 fill-agentify-dark-gray stroke-agentify-dark-gray"
                >
                  <path
                    d="M38.5395 21.4695C38.5395 25.8375 40.2747 30.0266 43.3633 33.1152C46.452 36.2039 50.6411 37.939 55.0091 37.939C59.377 37.939 63.5661 36.2039 66.6548 33.1152C69.7434 30.0266 71.4786 25.8375 71.4786 21.4695C71.4786 17.1015 69.7434 12.9124 66.6548 9.82381C63.5661 6.73518 59.377 5 55.0091 5C50.6411 5 46.452 6.73518 43.3633 9.82381C40.2747 12.9124 38.5395 17.1015 38.5395 21.4695ZM13.4949 64.8502C11.5804 65.9097 9.89624 67.3401 8.54076 69.0577C7.18528 70.7754 6.18566 72.746 5.6003 74.8543C5.01493 76.9626 4.85555 79.1665 5.13147 81.3371C5.40738 83.5077 6.11306 85.6016 7.20729 87.4964C8.30151 89.3913 9.76235 91.0491 11.5045 92.373C13.2466 93.6969 15.235 94.6604 17.3537 95.2073C19.4723 95.7541 21.6787 95.8732 23.8439 95.5578C26.0092 95.2423 28.0898 94.4986 29.9644 93.37C33.7163 91.1704 36.4458 87.5762 37.5575 83.3716C38.6691 79.167 38.0725 74.6934 35.8979 70.927C33.7234 67.1607 30.1473 64.4073 25.9502 63.2678C21.7531 62.1283 17.2756 62.6952 13.4949 64.8447V64.8502ZM96.5232 64.8502C98.4344 65.9105 100.115 67.3408 101.468 69.0575C102.821 70.7742 103.818 72.7431 104.402 74.8493C104.986 76.9555 105.144 79.1568 104.868 81.325C104.593 83.4931 103.888 85.5846 102.795 87.4775C101.703 89.3704 100.244 91.0268 98.5046 92.3502C96.7651 93.6735 94.7796 94.6372 92.6638 95.1852C90.548 95.7332 88.3443 95.8544 86.1811 95.5418C84.018 95.2292 81.9388 94.489 80.0647 93.3645C76.362 91.1426 73.6804 87.5551 72.5978 83.3749C71.5152 79.1947 72.1181 74.7564 74.2768 71.0166C76.4355 67.2767 79.977 64.5347 84.1382 63.3812C88.2995 62.2278 92.7473 62.7554 96.5232 64.8502Z"
                    strokeWidth="10"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M38.9231 24.9992C38.4533 22.8592 38.4153 20.6469 38.8112 18.492C39.2071 16.337 40.029 14.2828 41.2288 12.4495C28.9878 16.0046 18.5944 24.1531 12.2206 35.192C5.8469 46.2309 3.98611 59.3061 7.02712 71.6848C8.01551 69.7297 9.38402 67.9915 11.0525 66.5718C12.721 65.1522 14.656 64.0797 16.7441 63.4171C16.0167 55.5065 17.7588 47.5647 21.7306 40.6849C25.7024 33.805 31.7087 28.3251 38.9231 24.9992ZM71.0936 24.9992C78.3079 28.3251 84.3143 33.805 88.2861 40.6849C92.2579 47.5647 93.9999 55.5065 93.2725 63.4171C95.3611 64.0803 97.2964 65.1537 98.9649 66.5743C100.633 67.9949 102.002 69.7342 102.99 71.6903C106.031 59.3115 104.17 46.2364 97.796 35.1975C91.4223 24.1586 81.0289 16.0101 68.7878 12.455C69.9869 14.2876 70.8084 16.3409 71.2043 18.4948C71.6002 20.6488 71.5626 22.86 71.0936 24.9992ZM89.21 95.5547C87.0223 95.6774 84.8321 95.3624 82.7676 94.6281C80.7032 93.8938 78.806 92.7548 77.1873 91.2781C70.7002 95.8626 62.9519 98.3243 55.0083 98.3243C47.0648 98.3243 39.3164 95.8626 32.8294 91.2781C31.2111 92.7558 29.3141 93.8957 27.2496 94.631C25.1852 95.3663 22.9947 95.6822 20.8066 95.5602C30.0064 104.384 42.2607 109.311 55.0083 109.311C67.7559 109.311 80.0103 104.379 89.21 95.5547Z"
                  ></path>
                </svg>
              </span>{' '}
              teams
            </button>
            <button className="w-9/10 flex items-center m-auto gap-3 px-6 py-3 text-agentify-dark-gray hover:bg-agentify-bg-gray rounded-xl">
              <span className="text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-agentify-dark-gray stroke-agentify-dark-gray"
                >
                  <path
                    fill="currentColor"
                    d="m22.47 18.82l-1-3.86l-3.15-11.59a1 1 0 0 0-1.22-.71l-3.87 1a1 1 0 0 0-.73-.33h-10a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8l2.2 8.22a1 1 0 0 0 1 .74a1.2 1.2 0 0 0 .26 0L21.79 20a1 1 0 0 0 .61-.47a1.05 1.05 0 0 0 .07-.71m-16 .55h-3v-2h3Zm0-4h-3v-6h3Zm0-8h-3v-2h3Zm5 12h-3v-2h3Zm0-4h-3v-6h3Zm0-8h-3v-2h3Zm2.25-1.74l2.9-.78l.52 1.93l-2.9.78Zm2.59 9.66l-1.55-5.8l2.9-.78l1.55 5.8Zm1 3.86l-.52-1.93l2.9-.78l.52 1.93Z"
                  />
                </svg>
              </span>{' '}
              knowledgebases
            </button>
            <button className="w-9/10 flex items-center m-auto gap-3 px-6 py-3 text-agentify-dark-gray hover:bg-agentify-bg-gray rounded-xl">
              <span className="text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 18 16"
                  className="h-6 w-6 fill-agentify-dark-gray stroke-agentify-dark-gray"
                >
                  <path
                    fill="currentColor"
                    d="M4.5 9a3.5 3.5 0 1 0 0 7h7a3.5 3.5 0 1 0 0-7zm7 6a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5m-7-14a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m2.45 0A3.5 3.5 0 0 1 8 3.5A3.5 3.5 0 0 1 6.95 6h4.55a2.5 2.5 0 0 0 0-5zM4.5 0h7a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7"
                  />
                </svg>
              </span>{' '}
              tools
            </button>
          </nav>

          {/* Recent conversations */}
          <div className="mt-10 px-6">
            <h4 className="text-sm font-semibold text-agentify-dark mb-2">recent conversations</h4>
            <ul className="space-y-1 text-agentify-dark-gray">
              <li className="hover:text-agentify-dark hover:cursor-pointer">conversation 1</li>
              <li className="hover:text-agentify-dark hover:cursor-pointer">conversation 2</li>
              <li className="hover:text-agentify-dark hover:cursor-pointer">conversation 3</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-xs text-agentify-dark-gray flex">
          <button
            className="hover:underline hover:cursor-pointer m-auto"
            onClick={() => setShowTerms(true)}
          >
            Terms of service
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <img src={emptyBox} alt="Empty box illustration" className="w-40 h-40 mb-6" />
        <h2 className="text-2xl font-semibold text-agentify-dark mb-2">
          Oopsie... you have no agents,
        </h2>
        <h2 className="text-2xl font-semibold text-agentify-dark mb-6">but we can create one!</h2>
        <button
          onClick={() => navigate('/create-agent')}
          className="px-8 py-3 rounded-full bg-agentify-dark text-white font-medium hover:shadow-lg transition"
        >
          create your first agent
        </button>
      </main>

      {/* Modal */}
      <TermsAndConditions isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

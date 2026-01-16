import { useState, useEffect } from 'react';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';

export default function AuthFlowDemo() {
  // Auth state
  const { user, profile, isLoading, signOut } = useAuth();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  const isLoggedIn = !!user;
  const currentUser = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || ''
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };

  // Handle completion callbacks
  const handleSignupComplete = () => {
    setShowRegistrationModal(false);
  };

  const handleLoginClick = () => {
    setShowRegistrationModal(false);
    // In a real app, you would open the Login modal here
    console.log('Switch to login');
  };

  useEffect(() => {
    if (isLoading || !user) return;
    const needsProfile =
      !profile ||
      !profile.full_name ||
      profile.full_name === 'New User' ||
      !profile.phone_number ||
      !profile.location;
    if (needsProfile) {
      setShowRegistrationModal(true);
    }
  }, [user, profile, isLoading]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Dynamic Navbar - switches based on auth state */}
      {isLoggedIn ? (
        <NavbarLoggedIn 
          userName={currentUser.name}
          userEmail={currentUser.email}
          hasUnreadNotifications={true}
          onLogout={handleLogout}
        />
      ) : (
        <NavbarLoggedOut 
          onSignUpClick={() => setShowRegistrationModal(true)}
        />
      )}

      {/* Page Content */}
      <div style={{ marginTop: '72px', padding: '64px 40px' }}>
        <div className="max-w-[1200px] mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              {isLoggedIn ? (
                <div
                  className="inline-flex px-6 py-3 rounded-full mb-4"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)'
                  }}
                >
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    ✓ Logged In
                  </span>
                </div>
              ) : (
                <div
                  className="inline-flex px-6 py-3 rounded-full mb-4"
                  style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    border: '1px solid var(--muted-foreground)'
                  }}
                >
                  <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    Logged Out
                  </span>
                </div>
              )}
            </div>

            <h1 
              className="text-5xl mb-6"
              style={{ 
                fontWeight: 700,
                color: 'var(--foreground)',
                lineHeight: '1.2'
              }}
            >
              {isLoggedIn ? `Welcome Back, ${currentUser.name.split(' ')[0]}! 👋` : 'Complete User Flow Demo'}
            </h1>
            <p 
              className="text-xl max-w-[800px] mx-auto mb-8"
              style={{ 
                color: 'var(--muted-foreground)',
                lineHeight: '1.6'
              }}
            >
              {isLoggedIn 
                ? 'You are logged in. Try clicking your profile avatar to access the user menu, or click logout to return to the logged-out state.'
                : 'You are logged out. Click the "Sign Up" button in the navbar to open the registration modal and create an account.'
              }
            </p>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    className="px-8 py-4 rounded-lg text-base transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(6, 132, 245, 0.3)'
                    }}
                  >
                    Create New Event
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-8 py-4 rounded-lg text-base transition-all"
                    style={{
                      border: '1px solid var(--destructive)',
                      color: 'var(--destructive)',
                      fontWeight: 600,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Logout (Quick Action)
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="px-8 py-4 rounded-lg text-base transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(6, 132, 245, 0.3)'
                    }}
                  >
                    Sign Up Now
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="px-8 py-4 rounded-lg text-base transition-all"
                    style={{
                      border: '1px solid var(--primary)',
                      color: 'var(--foreground)',
                      fontWeight: 600,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Flow Visualization */}
          <div
            className="p-8 rounded-xl mb-16"
            style={{
              backgroundColor: 'rgba(6, 132, 245, 0.1)',
              border: '1px solid var(--primary)'
            }}
          >
            <h2
              className="text-2xl mb-6"
              style={{
                fontWeight: 600,
                color: 'var(--foreground)'
              }}
            >
              Current User Flow
            </h2>

            {/* Flow Diagram */}
            <div className="relative">
              {/* Step 1 */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    backgroundColor: !isLoggedIn ? 'var(--primary)' : 'var(--muted)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 600
                  }}
                >
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-base mb-2" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                    Logged Out State
                  </p>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    User sees navbar with "Login" and "Sign Up" buttons
                  </p>
                  {!isLoggedIn && (
                    <div
                      className="inline-flex px-3 py-1 rounded text-xs"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        fontWeight: 600
                      }}
                    >
                      You are here
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-start mb-6 ml-5">
                <div style={{ color: 'var(--primary)', fontSize: '24px' }}>↓</div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--foreground)',
                    fontWeight: 600
                  }}
                >
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-base mb-2" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                    Registration Modal Opens
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Click "Sign Up" → Modal appears with Google OAuth and Email options
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-start mb-6 ml-5">
                <div style={{ color: 'var(--primary)', fontSize: '24px' }}>↓</div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    backgroundColor: isLoggedIn ? 'var(--primary)' : 'var(--muted)',
                    color: isLoggedIn ? 'var(--primary-foreground)' : 'var(--foreground)',
                    fontWeight: 600
                  }}
                >
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-base mb-2" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                    Logged In State
                  </p>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    After successful signup, navbar shows notification bell and user profile menu
                  </p>
                  {isLoggedIn && (
                    <div
                      className="inline-flex px-3 py-1 rounded text-xs"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        fontWeight: 600
                      }}
                    >
                      You are here
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-start mb-6 ml-5">
                <div style={{ color: 'var(--primary)', fontSize: '24px' }}>↓</div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--foreground)',
                    fontWeight: 600
                  }}
                >
                  4
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-base mb-2" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                    Logout
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Click profile avatar → Select "Logout" → Returns to logged-out navbar state
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Wired Features */}
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <h3 className="text-lg mb-4" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                Wired Features
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Sign Up button opens registration modal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Google/Email signup creates account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Navbar switches to logged-in state</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Logout returns to logged-out navbar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>User data persists during session</span>
                </li>
              </ul>
            </div>

            {/* Interactive Elements */}
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <h3 className="text-lg mb-4" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                Try These Actions
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li className="flex items-start gap-2">
                  <span>1.</span>
                  <span>Click "Sign Up" in navbar (logged-out)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>2.</span>
                  <span>Select Google or Email in modal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>3.</span>
                  <span>Watch navbar change to logged-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>4.</span>
                  <span>Click profile avatar to see menu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>5.</span>
                  <span>Click "Logout" to return to start</span>
                </li>
              </ul>
            </div>

            {/* Current State Info */}
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-light)'
              }}
            >
              <h3 className="text-lg mb-4" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                Current State
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p style={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}>Status:</p>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    {isLoggedIn ? 'Logged In' : 'Logged Out'}
                  </p>
                </div>
                {isLoggedIn && (
                  <>
                    <div>
                      <p style={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}>User:</p>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                        {currentUser.name}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}>Email:</p>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                        {currentUser.email}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p style={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}>Navbar:</p>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    {isLoggedIn ? 'NavbarLoggedIn' : 'NavbarLoggedOut'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <ModalRegistrationEntry
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onGoogleSignup={handleSignupComplete}
        onEmailSignup={handleSignupComplete}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
}

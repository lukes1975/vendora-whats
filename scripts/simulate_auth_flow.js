// Simple local simulation of auth flows (no Firebase network calls).
// This mirrors the logic in src/services/auth.js to validate our code paths.

(async () => {
  // Mock storage
  const users = new Map(); // uid -> profile
  const emailToUid = new Map();
  let sentVerifications = new Map(); // uid -> count

  // Utilities
  const nowIso = () => new Date().toISOString();
  const makeUid = (email) => `mock_${Math.abs(hashCode(email))}`;

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i) | 0;
    return h;
  }

  // Mock firebase auth/db functions used by auth.js
  const createUserWithEmailAndPassword = async (email, password) => {
    if (emailToUid.has(email)) {
      const err = new Error('auth/email-already-in-use'); err.code = 'auth/email-already-in-use'; throw err;
    }
    const uid = makeUid(email);
    const user = { uid, email, displayName: '', emailVerified: false };
    emailToUid.set(email, uid);
    // store minimal user object separately (auth user)
    users.set(uid, { auth: user, profile: null, password });
    return { user };
  };

  const updateProfile = async (user, { displayName }) => {
    const rec = users.get(user.uid);
    if (rec) rec.auth.displayName = displayName;
  };

  const sendEmailVerification = async (user) => {
    const count = sentVerifications.get(user.uid) || 0;
    sentVerifications.set(user.uid, count + 1);
    return true;
  };

  const setDoc = async (ref, data) => {
    // ref assumed to be { collection: 'users', id: uid }
    const uid = ref.id;
    const rec = users.get(uid) || {};
    rec.profile = data;
    users.set(uid, rec);
  };

  const getDoc = async (ref) => {
    const uid = ref.id;
    const rec = users.get(uid);
    if (rec && rec.profile) return { exists: () => true, data: () => rec.profile };
    return { exists: () => false };
  };

  // Simulate the auth.js signUp flow (simplified)
  async function signUp(email, password, userData = {}) {
    try {
      const result = await createUserWithEmailAndPassword(email, password);
      if (userData.displayName) {
        await updateProfile(result.user, { displayName: userData.displayName });
      }
      try { await sendEmailVerification(result.user); } catch (e) { /* ignore */ }

      const now = nowIso();
      const profileData = {
        email: result.user.email,
        displayName: userData.displayName || '',
        role: userData.role || 'customer',
        businessName: userData.businessName || '',
        phone: userData.phone || '',
        address: userData.address || {},
        createdAt: now,
        updatedAt: now,
        isActive: true,
        emailVerified: result.user.emailVerified
      };
      if (userData.isStudent || userData.role === 'student') profileData.role = 'student';
      await setDoc({ collection: 'users', id: result.user.uid }, profileData);
      return { user: result.user, profile: profileData };
    } catch (error) {
      throw error;
    }
  }

  async function resendVerification(uid) {
    const rec = users.get(uid);
    if (!rec) throw new Error('No authenticated user to resend verification for');
    await sendEmailVerification(rec.auth);
  }

  async function signIn(email, password) {
    const uid = emailToUid.get(email);
    if (!uid) { const err = new Error('auth/user-not-found'); err.code='auth/user-not-found'; throw err; }
    const rec = users.get(uid);
    if (rec.password !== password) { const err = new Error('auth/wrong-password'); err.code='auth/wrong-password'; throw err; }
    return { user: rec.auth, profile: rec.profile };
  }

  // Run the simulated flow
  console.log('--- Simulation start ---');
  const email = 'student1@example.com';
  const password = 'Password123';
  console.log('Signing up as student...');
  const { user, profile } = await signUp(email, password, { isStudent: true, displayName: 'Student One' });
  console.log('signup profile.role =', profile.role, 'emailVerified=', profile.emailVerified);
  console.log('Sent verification count:', sentVerifications.get(user.uid) || 0);

  console.log('Attempting sign-in before verification (should be blocked by AuthContext)');
  try {
    const s = await signIn(email, password);
    console.log('signIn returned user emailVerified =', s.user.emailVerified);
    if (s.profile.role === 'student' && !s.user.emailVerified) {
      console.log('Simulated AuthContext would block this student until emailVerified is true.');
    }
  } catch (err) {
    console.log('signIn error:', err.message);
  }

  console.log('Resending verification...');
  await resendVerification(user.uid);
  console.log('Sent verification count after resend:', sentVerifications.get(user.uid));

  console.log('Simulate verifying email (set emailVerified true)');
  const rec = users.get(user.uid);
  rec.auth.emailVerified = true;
  rec.profile.emailVerified = true;
  users.set(user.uid, rec);

  console.log('Attempting sign-in after verification');
  const after = await signIn(email, password);
  console.log('signIn success, role=', after.profile.role, 'emailVerified=', after.user.emailVerified);

  console.log('--- Simulation complete ---');
})();

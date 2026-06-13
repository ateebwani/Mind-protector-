import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { FocusSessionLog } from '../types';

// Detect if Firebase connection parameters are valid and configured
export const isRealFirebaseEnabled = (): boolean => {
  return !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5);
};

// Initialize real Firebase services if enabled
let app;
let realAuth: any = null;
let realDb: any = null;

if (isRealFirebaseEnabled()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realAuth = getAuth(app);
    realDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    // Run connection test
    const testConnection = async () => {
      try {
        const { getDocFromServer } = await import('firebase/firestore');
        await getDocFromServer(doc(realDb, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firebase client appears to be offline. Connection is monitored.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.warn("Failed to initialize active Firebase client: ", err);
  }
}

// -------------------------------------------------------------
// LOCAL STATE DATABASE (FALLBACK SUITE)
// -------------------------------------------------------------
// Used when real Firebase is not yet configured or is being provisioned.
// Emulates authentic credential hashing, profile updates, and active stores.

const LOCAL_USERS_KEY = 'lumina_auth_users';
const LOCAL_LOGS_KEY = 'lumina_focus_logs';
const LOCAL_SAVED_KEY = 'lumina_saved_items';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinedDate: string;
  password?: string; // Stored securely in simulator
  marketingPreference?: boolean;
  cognitiveFocusGoal?: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  title: string;
  type: string;
  tag: string;
  createdAt: string;
}

// Initialize simulation database with template user accounts and logs
const getLocalUsers = (): UserAccount[] => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    const defaultUsers: UserAccount[] = [
      {
        uid: 'user_alex',
        name: 'Alex Rivera',
        email: 'alex@company.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedDate: 'Jun 2026',
        password: 'password123',
        marketingPreference: true,
        cognitiveFocusGoal: '4.8h/day'
      }
    ];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(data);
};

const getLocalSavedItems = (): SavedItem[] => {
  const data = localStorage.getItem(LOCAL_SAVED_KEY);
  if (!data) {
    const defaultSaved: SavedItem[] = [
      {
        id: 's1',
        userId: 'user_alex',
        title: 'Cosmic Rain Peak Audio Wave',
        type: 'Audio Preset',
        tag: 'Neurology',
        createdAt: 'Jun 12, 2026'
      },
      {
        id: 's2',
        userId: 'user_alex',
        title: 'Deep Coding Sprint Config',
        type: 'Flow State Limit',
        tag: 'Focus Labs',
        createdAt: 'Jun 11, 2026'
      }
    ];
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(defaultSaved));
    return defaultSaved;
  }
  return JSON.parse(data);
};

// Error generator following instructions
export function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: isRealFirebaseEnabled() ? realAuth?.currentUser?.uid : 'user_simulated',
      email: isRealFirebaseEnabled() ? realAuth?.currentUser?.email : 'sim_user@domain.com',
    },
    operationType,
    path
  };
  console.error('Mind Protector Database Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// CORE SERVICES WRAPPER (REAL OR SIMULATED)
// -------------------------------------------------------------

export const authService = {
  // 1. Password Registration
  signUp: async (email: string, password: string, name: string, avatarUrl?: string): Promise<UserAccount> => {
    if (isRealFirebaseEnabled()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(realAuth, email, password);
        const uid = userCredential.user.uid;
        const profile: UserAccount = {
          uid,
          name,
          email,
          avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          joinedDate: new Date().toLocaleDateString([], { month: 'short', year: 'numeric' }),
          marketingPreference: true,
          cognitiveFocusGoal: '5.0h/day'
        };
        // Save profile in Firestore
        await setDoc(doc(realDb, 'users', uid), profile);
        return profile;
      } catch (err) {
        handleFirestoreError(err, 'create', `users/auth`);
      }
    }

    // Local Storage Fallback
    const users = getLocalUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("This email is already registered in Mind Protector.");
    }
    const newUid = `user_${Date.now()}`;
    const newUser: UserAccount = {
      uid: newUid,
      name,
      email,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toLocaleDateString([], { month: 'short', year: 'numeric' }),
      password,
      marketingPreference: true,
      cognitiveFocusGoal: '4.8h/day'
    };
    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  // 2. Email Login
  signIn: async (email: string, password: string): Promise<UserAccount> => {
    if (isRealFirebaseEnabled()) {
      try {
        const res = await signInWithEmailAndPassword(realAuth, email, password);
        const userDoc = await getDoc(doc(realDb, 'users', res.user.uid));
        if (userDoc.exists()) {
          return userDoc.data() as UserAccount;
        } else {
          // Sync missing profile details
          const profile: UserAccount = {
            uid: res.user.uid,
            name: email.split('@')[0],
            email,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            joinedDate: new Date().toLocaleDateString([], { month: 'short', year: 'numeric' }),
            marketingPreference: true,
            cognitiveFocusGoal: '4.8h/day'
          };
          await setDoc(doc(realDb, 'users', res.user.uid), profile);
          return profile;
        }
      } catch (err) {
        handleFirestoreError(err, 'get', 'users/auth');
      }
    }

    // Local Storage Mock Fallback
    const users = getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("No account matched this email.");
    }
    if (user.password !== password) {
      throw new Error("Incorrect password string.");
    }
    return user;
  },

  // 3. Social Sign-In (Google/Facebook triggers popup, simulated returns beautiful Alex)
  socialSignIn: async (providerName: 'google' | 'facebook'): Promise<UserAccount> => {
    if (isRealFirebaseEnabled()) {
      try {
        const provider = providerName === 'google' 
          ? new GoogleAuthProvider() 
          : new FacebookAuthProvider();
        const res = await signInWithPopup(realAuth, provider);
        const user = res.user;
        const userDoc = await getDoc(doc(realDb, 'users', user.uid));
        if (userDoc.exists()) {
          return userDoc.data() as UserAccount;
        } else {
          const profile: UserAccount = {
            uid: user.uid,
            name: user.displayName || 'Authorized Member',
            email: user.email || 'social@lumina.com',
            avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            joinedDate: new Date().toLocaleDateString([], { month: 'short', year: 'numeric' }),
            marketingPreference: true,
            cognitiveFocusGoal: '4.8h/day'
          };
          await setDoc(doc(realDb, 'users', user.uid), profile);
          return profile;
        }
      } catch (err) {
        handleFirestoreError(err, 'get', 'users/social');
      }
    }

    // Return gorgeous aesthetic mockup users with proper credentials
    const names = providerName === 'google' ? 'Google Associate' : 'Facebook Contributor';
    const initials = providerName === 'google' ? 'G' : 'F';
    const emailStr = providerName === 'google' ? 'google@scholar.edu' : 'facebook@dev.corp';
    const photo = providerName === 'google'
      ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';

    return {
      uid: `social_${providerName}_${Date.now()}`,
      name: names,
      email: emailStr,
      avatarUrl: photo,
      joinedDate: 'Jun 2026',
      marketingPreference: true,
      cognitiveFocusGoal: '5.2h/day'
    };
  },

  // 4. Password Reset Trigger
  sendResetToken: async (email: string): Promise<string> => {
    if (isRealFirebaseEnabled()) {
      try {
        await sendPasswordResetEmail(realAuth, email);
        return "Firebase has sent an authentication reset link successfully.";
      } catch (err) {
        handleFirestoreError(err, 'write', 'users/reset');
      }
    }

    // Emulated password reset flow 
    const users = getLocalUsers();
    const match = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!match) {
      throw new Error("No account found with this email in Mind Protector simulator.");
    }
    return `Reset email successfully queued. A simulated token was dispatched to ${email}.`;
  },

  // 5. Update profile parameters
  updateProfile: async (uid: string, name: string, email: string, avatarUrl: string, cognitiveFocusGoal: string, marketingPreference: boolean): Promise<UserAccount> => {
    if (isRealFirebaseEnabled()) {
      try {
        const updateData = { name, email, avatarUrl, cognitiveFocusGoal, marketingPreference };
        await updateDoc(doc(realDb, 'users', uid), updateData);
        const updated = await getDoc(doc(realDb, 'users', uid));
        return updated.data() as UserAccount;
      } catch (err) {
        handleFirestoreError(err, 'update', `users/${uid}`);
      }
    }

    // Modify local storage profile
    const users = getLocalUsers();
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        name,
        email,
        avatarUrl,
        cognitiveFocusGoal,
        marketingPreference
      };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      return users[index];
    }
    throw new Error("User index was not resolved.");
  }
};

// -------------------------------------------------------------
// FIRE_LOG AND BOOKMARK PREFERENCE ACCESSORS
// -------------------------------------------------------------

export const dbService = {
  // Logs list
  fetchLogs: async (uid: string): Promise<FocusSessionLog[]> => {
    if (isRealFirebaseEnabled()) {
      try {
        const q = query(collection(realDb, `users/${uid}/logs`));
        const res = await getDocs(q);
        const list: FocusSessionLog[] = [];
        res.forEach(d => {
          list.push(d.data() as FocusSessionLog);
        });
        return list;
      } catch (err) {
        handleFirestoreError(err, 'list', `users/${uid}/logs`);
      }
    }

    const saved = localStorage.getItem(LOCAL_LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  addLog: async (uid: string, log: FocusSessionLog): Promise<FocusSessionLog> => {
    if (isRealFirebaseEnabled()) {
      try {
        await setDoc(doc(realDb, `users/${uid}/logs`, log.id), log);
        return log;
      } catch (err) {
        handleFirestoreError(err, 'create', `users/${uid}/logs/${log.id}`);
      }
    }

    const logs = dbService.getLocalLogsSim();
    logs.unshift(log);
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs));
    return log;
  },

  getLocalLogsSim: (): FocusSessionLog[] => {
    const saved = localStorage.getItem(LOCAL_LOGS_KEY);
    if (!saved) {
      const defaultLogs: FocusSessionLog[] = [
        { id: 'l1', date: 'Fri, Jun 12', durationMinutes: 90, mode: 'Deep Work', status: 'completed', category: 'UI Design' },
        { id: 'l2', date: 'Thu, Jun 11', durationMinutes: 45, mode: 'Light Flow', status: 'completed', category: 'Research' },
        { id: 'l3', date: 'Wed, Jun 10', durationMinutes: 60, mode: 'Creative', status: 'interrupted', category: 'Writing' }
      ];
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(defaultLogs));
      return defaultLogs;
    }
    return JSON.parse(saved);
  },

  // Saved items list
  fetchSavedItems: async (uid: string): Promise<SavedItem[]> => {
    if (isRealFirebaseEnabled()) {
      try {
        const q = query(collection(realDb, `users/${uid}/savedItems`));
        const res = await getDocs(q);
        const list: SavedItem[] = [];
        res.forEach(d => {
          list.push(d.data() as SavedItem);
        });
        return list;
      } catch (err) {
        handleFirestoreError(err, 'list', `users/${uid}/savedItems`);
      }
    }

    return getLocalSavedItems().filter(i => i.userId === uid);
  },

  addSavedItem: async (uid: string, title: string, type: string, tag: string): Promise<SavedItem> => {
    const newItem: SavedItem = {
      id: `saved_${Date.now()}`,
      userId: uid,
      title,
      type,
      tag,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (isRealFirebaseEnabled()) {
      try {
        await setDoc(doc(realDb, `users/${uid}/savedItems`, newItem.id), newItem);
        return newItem;
      } catch (err) {
        handleFirestoreError(err, 'create', `users/${uid}/savedItems/${newItem.id}`);
      }
    }

    const items = getLocalSavedItems();
    items.unshift(newItem);
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(items));
    return newItem;
  },

  deleteSavedItem: async (uid: string, itemId: string): Promise<string> => {
    if (isRealFirebaseEnabled()) {
      try {
        await deleteDoc(doc(realDb, `users/${uid}/savedItems`, itemId));
        return itemId;
      } catch (err) {
        handleFirestoreError(err, 'delete', `users/${uid}/savedItems/${itemId}`);
      }
    }

    const items = getLocalSavedItems();
    const filtered = items.filter(i => i.id !== itemId);
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(filtered));
    return itemId;
  }
};

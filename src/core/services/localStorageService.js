import { 
  learningMaterials as defaultMaterials,
  practiceVideos as defaultVideos,
  quizQuestions as defaultQuizzes,
  emergencyContacts as defaultContacts 
} from '../../data/dummyData';
import { db } from './firebase';
import { ref, set, get, child } from 'firebase/database';

const KEY_PROFILE = 'user_profile';
const KEY_EMERGENCY_CONTACTS = 'emergency_contacts';
const KEY_USERS = 'app_users';
const KEY_SESSION_USER = 'session_user';
const KEY_LEARNING_MATERIALS = 'learning_materials';
const KEY_PRACTICE_VIDEOS = 'practice_videos';
const KEY_QUIZ_QUESTIONS = 'quiz_questions';

const defaultProfile = {
  name: 'Relawan PMR',
  role: 'PMR Madya',
  xp: 0,
  quizHistory: [], // items: { quizLabel, mode, part, score, total, date, isEvaluation, predikat, emoji, timeTakenSeconds }
  readMaterials: [], // materialIds
  unlockedAchievements: [], // achievementIds
};

// Firebase Sync Helpers
const promiseTimeout = (promise, ms) => {
  let timeout = new Promise((_, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('TIMEOUT'));
    }, ms);
  });
  return Promise.race([promise, timeout]);
};

async function syncFromFirebase(username) {
  try {
    const dbRef = ref(db);
    
    // 0. Sync Session User
    const userSnap = await promiseTimeout(get(child(dbRef, `users/${username}`)), 3000);
    if (userSnap.exists()) {
      localStorage.setItem('session_user', JSON.stringify(userSnap.val()));
    }

    // 1. Profile
    const profileSnap = await promiseTimeout(get(child(dbRef, `profiles/${username}`)), 3000);
    if (profileSnap.exists()) {
      localStorage.setItem(`user_profile_${username}`, JSON.stringify(profileSnap.val()));
    }
    
    // 2. Emergency Contacts
    const contactsSnap = await promiseTimeout(get(child(dbRef, `emergency_contacts/${username}`)), 3000);
    if (contactsSnap.exists()) {
      localStorage.setItem(KEY_EMERGENCY_CONTACTS, JSON.stringify(contactsSnap.val()));
    }
    
    // 3. Read Subtopics
    const subtopicsSnap = await promiseTimeout(get(child(dbRef, `read_subtopics/${username}`)), 3000);
    if (subtopicsSnap.exists()) {
      const subtopicsObj = subtopicsSnap.val();
      Object.keys(subtopicsObj).forEach(materialId => {
        localStorage.setItem(`read_subtopics_${materialId}`, JSON.stringify(subtopicsObj[materialId]));
      });
    }
    
    window.dispatchEvent(new Event('auth-changed'));
  } catch (error) {
    console.warn("Firebase sync failed, using cached local data", error);
  }
}

async function syncGlobalDataFromFirebase() {
  try {
    const dbRef = ref(db);
    
    const materialsSnap = await promiseTimeout(get(child(dbRef, 'learning_materials')), 3000);
    if (materialsSnap.exists()) {
      localStorage.setItem(KEY_LEARNING_MATERIALS, JSON.stringify(materialsSnap.val()));
    }
    
    const videosSnap = await promiseTimeout(get(child(dbRef, 'practice_videos')), 3000);
    if (videosSnap.exists()) {
      localStorage.setItem(KEY_PRACTICE_VIDEOS, JSON.stringify(videosSnap.val()));
    }
    
    const quizzesSnap = await promiseTimeout(get(child(dbRef, 'quiz_questions')), 3000);
    if (quizzesSnap.exists()) {
      localStorage.setItem(KEY_QUIZ_QUESTIONS, JSON.stringify(quizzesSnap.val()));
    }
    
    window.dispatchEvent(new Event('auth-changed'));
  } catch (e) {
    console.warn("Global data sync failed, using local fallback", e);
  }
}

async function syncAllUsersFromFirebase() {
  try {
    const dbRef = ref(db);
    
    // 1. Sync list of users
    const usersSnap = await promiseTimeout(get(child(dbRef, 'users')), 3000);
    if (usersSnap.exists()) {
      const usersObj = usersSnap.val();
      const usersList = Object.values(usersObj);
      localStorage.setItem(KEY_USERS, JSON.stringify(usersList));
    }
    
    // 2. Sync list of user profiles (to populate XP, quiz stats, etc. in Admin dashboard)
    const profilesSnap = await promiseTimeout(get(child(dbRef, 'profiles')), 3000);
    if (profilesSnap.exists()) {
      const profilesObj = profilesSnap.val();
      Object.keys(profilesObj).forEach(username => {
        localStorage.setItem(`user_profile_${username}`, JSON.stringify(profilesObj[username]));
      });
    }
    
    window.dispatchEvent(new Event('auth-changed'));
  } catch (e) {
    console.warn("Failed to sync users and profiles from Firebase", e);
  }
}

function syncProfileToFirebase(username, profile) {
  try {
    set(ref(db, `profiles/${username}`), profile);
  } catch (e) {
    console.error("Failed to sync profile to Firebase", e);
  }
}

function syncContactsToFirebase(username, contacts) {
  try {
    set(ref(db, `emergency_contacts/${username}`), contacts);
  } catch (e) {
    console.error("Failed to sync contacts to Firebase", e);
  }
}

function syncSubtopicsToFirebase(username, materialId, subtopics) {
  try {
    set(ref(db, `read_subtopics/${username}/${materialId}`), subtopics);
  } catch (e) {
    console.error("Failed to sync subtopics to Firebase", e);
  }
}

function syncGlobalMaterialsToFirebase(materials) {
  try {
    set(ref(db, 'learning_materials'), materials);
  } catch (e) {
    console.error(e);
  }
}

function syncGlobalVideosToFirebase(videos) {
  try {
    set(ref(db, 'practice_videos'), videos);
  } catch (e) {
    console.error(e);
  }
}

function syncGlobalQuizzesToFirebase(quizzes) {
  try {
    set(ref(db, 'quiz_questions'), quizzes);
  } catch (e) {
    console.error(e);
  }
}

export const localStorageService = {
  getCurrentUser() {
    const data = localStorage.getItem(KEY_SESSION_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (_) {
      return null;
    }
  },

  getUserProfile() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return defaultProfile;
    
    const key = `user_profile_${currentUser.username}`;
    const data = localStorage.getItem(key);
    if (!data) {
      const profile = { ...defaultProfile, name: currentUser.name || currentUser.username };
      localStorage.setItem(key, JSON.stringify(profile));
      return profile;
    }
    try {
      return { ...defaultProfile, ...JSON.parse(data) };
    } catch (_) {
      return { ...defaultProfile, name: currentUser.name || currentUser.username };
    }
  },

  saveUserProfile(profile) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    const key = `user_profile_${currentUser.username}`;
    localStorage.setItem(key, JSON.stringify(profile));

    // Sync name in users list and session_user
    if (profile.name && profile.name !== currentUser.name) {
      currentUser.name = profile.name;
      localStorage.setItem(KEY_SESSION_USER, JSON.stringify(currentUser));
      
      const users = this.getUsers();
      const uIdx = users.findIndex(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
      if (uIdx !== -1) {
        users[uIdx].name = profile.name;
        this.saveUsers(users);
      }
    }

    // Sync to Firebase background
    syncProfileToFirebase(currentUser.username, profile);
  },

  addXp(amount) {
    const profile = this.getUserProfile();
    profile.xp += amount;
    this.saveUserProfile(profile);
  },

  markMaterialAsRead(materialId) {
    const profile = this.getUserProfile();
    if (profile.readMaterials.includes(materialId)) return;

    profile.readMaterials.push(materialId);
    profile.xp += 20; // Reward XP for reading a material

    // Check material achievements
    const updated = this._checkMaterialAchievements(profile);
    this.saveUserProfile(updated);
  },

  isMaterialRead(materialId) {
    const profile = this.getUserProfile();
    return profile.readMaterials.includes(materialId);
  },

  getReadSubtopics(materialId) {
    const key = `read_subtopics_${materialId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (_) {
      return [];
    }
  },

  markSubtopicAsRead(materialId, subtopicTitle) {
    const key = `read_subtopics_${materialId}`;
    const current = this.getReadSubtopics(materialId);
    if (!current.includes(subtopicTitle)) {
      current.push(subtopicTitle);
      localStorage.setItem(key, JSON.stringify(current));
    }
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      syncSubtopicsToFirebase(currentUser.username, materialId, current);
    }
  },

  resetMaterialProgress(materialId) {
    const key = `read_subtopics_${materialId}`;
    localStorage.removeItem(key);

    const profile = this.getUserProfile();
    profile.readMaterials = profile.readMaterials.filter(id => id !== materialId);
    this.saveUserProfile(profile);

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      syncSubtopicsToFirebase(currentUser.username, materialId, null);
    }
  },

  saveQuizResult(item) {
    const profile = this.getUserProfile();
    const newHistory = [...profile.quizHistory];

    // Insert latest to top
    newHistory.unshift({
      ...item,
      date: new Date().toISOString(),
    });

    // Check if matching attempts reaches 5 to perform filtering
    let matchingAttempts = [];
    if (item.isEvaluation) {
      matchingAttempts = newHistory.filter(q => q.isEvaluation && q.quizLabel === item.quizLabel);
    } else {
      matchingAttempts = newHistory.filter(q =>
        !q.isEvaluation &&
        q.part === item.part &&
        q.mode.toLowerCase() === item.mode.toLowerCase()
      );
    }

    if (matchingAttempts.length >= 5) {
      let bestItem = matchingAttempts[0];
      for (let i = 1; i < matchingAttempts.length; i++) {
        const current = matchingAttempts[i];
        if (current.score > bestItem.score) {
          bestItem = current;
        } else if (current.score === bestItem.score) {
          const currentSec = current.timeTakenSeconds ?? 999999;
          const bestSec = bestItem.timeTakenSeconds ?? 999999;
          if (currentSec < bestSec) {
            bestItem = current;
          } else if (currentSec === bestSec) {
            if (new Date(current.date) > new Date(bestItem.date)) {
              bestItem = current;
            }
          }
        }
      }

      // Remove matching attempts
      if (item.isEvaluation) {
        profile.quizHistory = newHistory.filter(q => !(q.isEvaluation && q.quizLabel === item.quizLabel));
      } else {
        profile.quizHistory = newHistory.filter(q => !(
          !q.isEvaluation &&
          q.part === item.part &&
          q.mode.toLowerCase() === item.mode.toLowerCase()
        ));
      }

      profile.quizHistory.unshift(bestItem);
    } else {
      profile.quizHistory = newHistory;
    }

    // Reward XP: 10 XP per correct, 50 XP bonus for perfect score
    let earnedXp = item.score * 10;
    if (item.score === item.total && item.total > 0) {
      earnedXp += 50;
    }
    profile.xp += earnedXp;

    // Check quiz achievements
    const updated = this._checkQuizAchievements(profile, item);
    this.saveUserProfile(updated);
  },

  unlockAchievement(achievementId) {
    const profile = this.getUserProfile();
    if (profile.unlockedAchievements.includes(achievementId)) return;

    profile.unlockedAchievements.push(achievementId);
    profile.xp += 30; // +30 XP bonus
    this.saveUserProfile(profile);
  },

  _checkMaterialAchievements(profile) {
    const achievements = [...profile.unlockedAchievements];
    let extraXp = 0;

    // Read >= 5 materials
    if (profile.readMaterials.length >= 5 && !achievements.includes('ach_read_5')) {
      achievements.push('ach_read_5');
      extraXp += 30;
    }

    // Read all 9 and complete Eval A & B
    const hasEvalA = profile.quizHistory.some(q => q.isEvaluation && q.quizLabel.includes('Bagian A'));
    const hasEvalB = profile.quizHistory.some(q => q.isEvaluation && q.quizLabel.includes('Bagian B'));
    if (profile.readMaterials.length >= 9 && hasEvalA && hasEvalB && !achievements.includes('ach_pakar_pmr')) {
      achievements.push('ach_pakar_pmr');
      extraXp += 50;
    }

    profile.unlockedAchievements = achievements;
    profile.xp += extraXp;
    return profile;
  },

  _checkQuizAchievements(profile, lastItem) {
    const achievements = [...profile.unlockedAchievements];
    let extraXp = 0;

    // 100% Score
    if (lastItem.score === lastItem.total && lastItem.total > 0 && !achievements.includes('ach_quiz_perfect')) {
      achievements.push('ach_quiz_perfect');
      extraXp += 30;
    }

    // Complete >= 3 quizzes
    if (profile.quizHistory.length >= 3 && !achievements.includes('ach_consistency_3')) {
      achievements.push('ach_consistency_3');
      extraXp += 30;
    }

    // Completed in Tanggap mode
    if (lastItem.mode && lastItem.mode.toLowerCase() === 'tanggap' && !achievements.includes('ach_mode_tanggap')) {
      achievements.push('ach_mode_tanggap');
      extraXp += 30;
    }

    // Read all 9 and complete Eval A & B
    const hasEvalA = profile.quizHistory.some(q => q.isEvaluation && q.quizLabel.includes('Bagian A'));
    const hasEvalB = profile.quizHistory.some(q => q.isEvaluation && q.quizLabel.includes('Bagian B'));
    if (profile.readMaterials.length >= 9 && hasEvalA && hasEvalB && !achievements.includes('ach_pakar_pmr')) {
      achievements.push('ach_pakar_pmr');
      extraXp += 50;
    }

    profile.unlockedAchievements = achievements;
    profile.xp += extraXp;
    return profile;
  },

  getEmergencyContacts() {
    const data = localStorage.getItem(KEY_EMERGENCY_CONTACTS);
    if (!data) return defaultContacts;
    try {
      return JSON.parse(data);
    } catch (_) {
      return defaultContacts;
    }
  },

  saveEmergencyContacts(contacts) {
    localStorage.setItem(KEY_EMERGENCY_CONTACTS, JSON.stringify(contacts));
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      syncContactsToFirebase(currentUser.username, contacts);
    }
  },

  addEmergencyContact(contact) {
    const current = this.getEmergencyContacts();
    current.push(contact);
    this.saveEmergencyContacts(current);
  },

  updateEmergencyContact(updatedContact) {
    const current = this.getEmergencyContacts();
    const idx = current.findIndex(c => c.id === updatedContact.id);
    if (idx !== -1) {
      current[idx] = updatedContact;
      this.saveEmergencyContacts(current);
    }
  },

  deleteEmergencyContact(id) {
    const current = this.getEmergencyContacts();
    const updated = current.filter(c => c.id !== id);
    this.saveEmergencyContacts(updated);
  },

  resetEmergencyContacts() {
    localStorage.removeItem(KEY_EMERGENCY_CONTACTS);
  },

  clearAll() {
    localStorage.clear();
  },

  // --- USER AUTHENTICATION & MANAGEMENT ---
  getUsers() {
    const defaultAdmin = {
      id: 'usr_admin',
      name: 'Admin PMR',
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    };
    const data = localStorage.getItem(KEY_USERS);
    if (!data) {
      const initialUsers = [defaultAdmin];
      localStorage.setItem(KEY_USERS, JSON.stringify(initialUsers));
      return initialUsers;
    }
    try {
      const list = JSON.parse(data);
      if (!list.some(u => u.username.toLowerCase() === 'admin')) {
        list.push(defaultAdmin);
        localStorage.setItem(KEY_USERS, JSON.stringify(list));
      }
      return list;
    } catch (_) {
      return [defaultAdmin];
    }
  },

  saveUsers(users) {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  },

  async registerUser(name, username, password) {
    const cleanUsername = username.trim().toLowerCase();
    
    try {
      const dbRef = ref(db);
      const snapshot = await promiseTimeout(get(child(dbRef, `users/${cleanUsername}`)), 3000);
      if (snapshot.exists()) {
        return { success: false, message: 'Username atau email sudah digunakan.' };
      }
      
      const newUser = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        username: username.trim(),
        password: password,
        role: 'student'
      };

      await set(ref(db, `users/${cleanUsername}`), newUser);

      const newProfile = {
        ...defaultProfile,
        name: newUser.name,
        role: 'PMR Madya'
      };
      await set(ref(db, `profiles/${cleanUsername}`), newProfile);

      const localUsers = this.getUsers();
      if (!localUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
        localUsers.push(newUser);
        this.saveUsers(localUsers);
      }

      return { success: true };
    } catch (error) {
      console.error("Firebase registration error, falling back to local storage", error);
      const users = this.getUsers();
      const exists = users.some(u => u.username.toLowerCase() === cleanUsername);
      if (exists) {
        return { success: false, message: 'Username atau email sudah digunakan.' };
      }
      const newUser = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        username: username.trim(),
        password: password,
        role: 'student'
      };
      users.push(newUser);
      this.saveUsers(users);

      const profileKey = `user_profile_${newUser.username}`;
      const newProfile = { ...defaultProfile, name: newUser.name, role: 'PMR Madya' };
      localStorage.setItem(profileKey, JSON.stringify(newProfile));

      return { success: true };
    }
  },

  async loginUser(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
      const adminUser = {
        id: 'usr_admin',
        name: 'Admin PMR',
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      };
      try {
        const dbRef = ref(db);
        const snapshot = await promiseTimeout(get(child(dbRef, `users/admin`)), 3000);
        if (!snapshot.exists()) {
          await set(ref(db, `users/admin`), adminUser);
        }
        await syncAllUsersFromFirebase();
      } catch (e) {
        console.warn("Failed to check admin in Firebase", e);
      }
      return { success: true, user: adminUser };
    }

    try {
      const dbRef = ref(db);
      const snapshot = await promiseTimeout(get(child(dbRef, `users/${cleanUsername}`)), 3000);
      if (!snapshot.exists()) {
        return { success: false, message: 'Username atau password yang Anda masukkan tidak sesuai.' };
      }

      const foundUser = snapshot.val();
      if (foundUser.password !== password) {
        return { success: false, message: 'Username atau password yang Anda masukkan tidak sesuai.' };
      }

      await syncFromFirebase(cleanUsername);

      return { success: true, user: foundUser };
    } catch (error) {
      console.error("Firebase login error, checking local fallback", error);
      const users = this.getUsers();
      const foundUser = users.find(u => u.username.toLowerCase() === cleanUsername);
      if (!foundUser || foundUser.password !== password) {
        return { success: false, message: 'Username atau password yang Anda masukkan tidak sesuai.' };
      }
      return { success: true, user: foundUser };
    }
  },

  setSessionUser(user) {
    localStorage.setItem(KEY_SESSION_USER, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-changed'));
  },

  logoutUser() {
    localStorage.removeItem(KEY_SESSION_USER);
    window.dispatchEvent(new Event('auth-changed'));
  },

  // --- LEARNING MATERIALS ---
  getLearningMaterials() {
    const data = localStorage.getItem(KEY_LEARNING_MATERIALS);
    if (!data) {
      localStorage.setItem(KEY_LEARNING_MATERIALS, JSON.stringify(defaultMaterials));
      return defaultMaterials;
    }
    try {
      return JSON.parse(data);
    } catch (_) {
      return defaultMaterials;
    }
  },

  saveLearningMaterials(materials) {
    localStorage.setItem(KEY_LEARNING_MATERIALS, JSON.stringify(materials));
    syncGlobalMaterialsToFirebase(materials);
  },

  addLearningMaterial(material) {
    const list = this.getLearningMaterials();
    list.push(material);
    this.saveLearningMaterials(list);
  },

  updateLearningMaterial(updated) {
    const list = this.getLearningMaterials();
    const idx = list.findIndex(m => m.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveLearningMaterials(list);
    }
  },

  deleteLearningMaterial(id) {
    const list = this.getLearningMaterials();
    const filtered = list.filter(m => m.id !== id);
    this.saveLearningMaterials(filtered);
  },

  // --- PRACTICE VIDEOS ---
  getPracticeVideos() {
    const data = localStorage.getItem(KEY_PRACTICE_VIDEOS);
    if (!data) {
      localStorage.setItem(KEY_PRACTICE_VIDEOS, JSON.stringify(defaultVideos));
      return defaultVideos;
    }
    try {
      return JSON.parse(data);
    } catch (_) {
      return defaultVideos;
    }
  },

  savePracticeVideos(videos) {
    localStorage.setItem(KEY_PRACTICE_VIDEOS, JSON.stringify(videos));
    syncGlobalVideosToFirebase(videos);
  },

  addPracticeVideo(video) {
    const list = this.getPracticeVideos();
    list.push(video);
    this.savePracticeVideos(list);
  },

  updatePracticeVideo(updated) {
    const list = this.getPracticeVideos();
    const idx = list.findIndex(v => v.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.savePracticeVideos(list);
    }
  },

  deletePracticeVideo(id) {
    const list = this.getPracticeVideos();
    const filtered = list.filter(v => v.id !== id);
    this.savePracticeVideos(filtered);
  },

  // --- QUIZ QUESTIONS ---
  getQuizQuestions() {
    const data = localStorage.getItem(KEY_QUIZ_QUESTIONS);
    if (!data) {
      localStorage.setItem(KEY_QUIZ_QUESTIONS, JSON.stringify(defaultQuizzes));
      return defaultQuizzes;
    }
    try {
      return JSON.parse(data);
    } catch (_) {
      return defaultQuizzes;
    }
  },

  saveQuizQuestions(questions) {
    localStorage.setItem(KEY_QUIZ_QUESTIONS, JSON.stringify(questions));
    syncGlobalQuizzesToFirebase(questions);
  },

  addQuizQuestion(question) {
    const list = this.getQuizQuestions();
    list.push(question);
    this.saveQuizQuestions(list);
  },

  updateQuizQuestion(updated) {
    const list = this.getQuizQuestions();
    const idx = list.findIndex(q => q.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveQuizQuestions(list);
    }
  },

  deleteQuizQuestion(id) {
    const list = this.getQuizQuestions();
    const filtered = list.filter(q => q.id !== id);
    this.saveQuizQuestions(filtered);
  }
};

// Start background sync on load
setTimeout(() => {
  syncGlobalDataFromFirebase();
  const currentUser = localStorageService.getCurrentUser();
  if (currentUser) {
    syncFromFirebase(currentUser.username);
    if (currentUser.role === 'admin') {
      syncAllUsersFromFirebase();
    }
  }
}, 500);

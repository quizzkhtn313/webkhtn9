// ================================================================
//  SHARED USER DATA – MỘT NGUỒN DỮ LIỆU DUY NHẤT
// ================================================================

const STORAGE_KEY = 'studentProfile';

// -------------------- DỮ LIỆU MẶC ĐỊNH --------------------
function getDefaultUserData() {
  return {
    username: 'Học sinh',
    class: 'Lớp 8 · THCS',
    avatar: 'H',
    streak: 0,
    xp: 0,
    totalCorrect: 0,
    totalWrong: 0,
    lastActive: null,
    level: 1,
    totalScore: 0,

    // Thành tích
    achievements: {},

    // Tiến độ quiz (hóa học)
    quizProgress: {},
    quizHistory: [],
    quizAchievements: {},

    // Dữ liệu lớp học (từ trang chủ)
    myClass: null,
    myName: null,
    myUsername: null,
    classInfo: null,
    assignments: [],
    submits: [],

    // Thống kê chung
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    playTime: 0,
    firstPlayDate: null,
    lastLogin: null,

    // Lịch sử các bài tập đã làm (để đồng bộ)
    exerciseHistory: []
  };
}

// -------------------- ĐỌC / GHI --------------------
function loadUserData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const defaults = getDefaultUserData();
      // Tự động bổ sung các trường thiếu
      for (const key in defaults) {
        if (!(key in data)) {
          data[key] = defaults[key];
        }
      }
      // Di chuyển dữ liệu cũ (nếu có) sang key mới
      migrateOldData(data);
      return data;
    }
  } catch (e) {
    console.warn('⚠️ Lỗi đọc dữ liệu:', e);
  }
  return getDefaultUserData();
}

function saveUserData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Thông báo cho các trang khác (nếu đang mở cùng lúc)
    if (typeof window.onUserDataChanged === 'function') {
      window.onUserDataChanged();
    }
  } catch (e) {
    console.warn('⚠️ Lỗi lưu dữ liệu:', e);
  }
}

function updateUserData(callback) {
  const data = loadUserData();
  callback(data);
  saveUserData(data);
  return data;
}

function syncUserInterface() {
  if (typeof window.onUserDataChanged === 'function') {
    window.onUserDataChanged();
  }
}

// -------------------- DI CHUYỂN DỮ LIỆU CŨ --------------------
function migrateOldData(data) {
  // 1. Từ chem_user, chem_progress, chem_history, chem_achievements
  const oldUser = localStorage.getItem('chem_user');
  if (oldUser) {
    try {
      const u = JSON.parse(oldUser);
      data.username = u.name || data.username;
      data.class = u.class || data.class;
      data.avatar = u.avatar || data.avatar;
      data.streak = u.streak || data.streak;
      data.xp = u.xp || data.xp;
      data.totalCorrect = u.totalCorrect || data.totalCorrect;
      data.totalWrong = u.totalWrong || data.totalWrong;
      data.lastActive = u.lastActive || data.lastActive;
      localStorage.removeItem('chem_user');
    } catch (_) {}
  }

  const oldProgress = localStorage.getItem('chem_progress');
  if (oldProgress) {
    try {
      data.quizProgress = JSON.parse(oldProgress);
      localStorage.removeItem('chem_progress');
    } catch (_) {}
  }

  const oldHistory = localStorage.getItem('chem_history');
  if (oldHistory) {
    try {
      data.quizHistory = JSON.parse(oldHistory);
      localStorage.removeItem('chem_history');
    } catch (_) {}
  }

  const oldAch = localStorage.getItem('chem_achievements');
  if (oldAch) {
    try {
      data.quizAchievements = JSON.parse(oldAch);
      localStorage.removeItem('chem_achievements');
    } catch (_) {}
  }

  // 2. Từ currentUser, q9a-current, playerStats_*
  const oldUser2 = localStorage.getItem('currentUser');
  if (oldUser2) {
    data.username = oldUser2;
    localStorage.removeItem('currentUser');
  }

  const oldQ9a = localStorage.getItem('q9a-current');
  if (oldQ9a) {
    try {
      const u = JSON.parse(oldQ9a);
      if (u && u.username) data.username = u.username;
      localStorage.removeItem('q9a-current');
    } catch (_) {}
  }

  if (data.username) {
    const statsKey = 'playerStats_' + data.username;
    const oldStats = localStorage.getItem(statsKey);
    if (oldStats) {
      try {
        const s = JSON.parse(oldStats);
        data.totalScore = s.totalPoints || data.totalScore;
        data.playTime = s.playTime || data.playTime;
        data.firstPlayDate = s.firstPlayDate || data.firstPlayDate;
        data.totalQuizzes = s.totalQuizzes || data.totalQuizzes;
        data.completedQuizzes = s.completedQuizzes || data.completedQuizzes;
        localStorage.removeItem(statsKey);
      } catch (_) {}
    }
  }

  // 3. Dữ liệu lớp học
  const myClass = localStorage.getItem('sd-myClass');
  if (myClass) {
    data.myClass = myClass;
    localStorage.removeItem('sd-myClass');
  }
  const myName = localStorage.getItem('sd-myName');
  if (myName) {
    data.myName = myName;
    localStorage.removeItem('sd-myName');
  }
  const myUsername = localStorage.getItem('sd-myUsername');
  if (myUsername) {
    data.myUsername = myUsername;
    localStorage.removeItem('sd-myUsername');
  }

  if (data.myClass) {
    const ciKey = 'sd-classInfo-' + data.myClass;
    const ci = localStorage.getItem(ciKey);
    if (ci) {
      try {
        data.classInfo = JSON.parse(ci);
        localStorage.removeItem(ciKey);
      } catch (_) {}
    }

    const assignKey = 'assignments-' + data.myClass;
    const assignData = localStorage.getItem(assignKey);
    if (assignData) {
      try {
        data.assignments = JSON.parse(assignData);
        localStorage.removeItem(assignKey);
      } catch (_) {}
    }

    const submitKey = 'submits-' + data.myClass;
    const submitData = localStorage.getItem(submitKey);
    if (submitData) {
      try {
        data.submits = JSON.parse(submitData);
        localStorage.removeItem(submitKey);
      } catch (_) {}
    }

    const personalKey = 'assign-personal-' + data.myClass;
    const personalData = localStorage.getItem(personalKey);
    if (personalData) {
      try {
        const p = JSON.parse(personalData);
        data.assignments = [...data.assignments, ...p];
        localStorage.removeItem(personalKey);
      } catch (_) {}
    }
  }

  // Lưu lại sau khi di chuyển
  saveUserData(data);
}

// -------------------- HÀM TIỆN ÍCH CHO CÁC TRANG --------------------
function getUserStats() {
  const data = loadUserData();
  return {
    username: data.username,
    class: data.class,
    avatar: data.avatar,
    streak: data.streak,
    xp: data.xp,
    totalCorrect: data.totalCorrect,
    totalWrong: data.totalWrong,
    level: data.level,
    totalScore: data.totalScore,
    totalQuizzes: data.totalQuizzes,
    completedQuizzes: data.completedQuizzes,
    averageScore: data.averageScore,
    playTime: data.playTime,
    firstPlayDate: data.firstPlayDate,
    lastLogin: data.lastLogin
  };
}

function addXP(points) {
  updateUserData((data) => {
    data.xp = (data.xp || 0) + points;
    data.totalScore = (data.totalScore || 0) + points;
    // Tăng cấp
    const newLevel = Math.floor(data.xp / 100) + 1;
    if (newLevel > data.level) {
      data.level = newLevel;
    }
  });
  syncUserInterface();
}

function addCorrect() {
  updateUserData((data) => {
    data.totalCorrect = (data.totalCorrect || 0) + 1;
  });
}

function addWrong() {
  updateUserData((data) => {
    data.totalWrong = (data.totalWrong || 0) + 1;
  });
}

function updateStreak() {
  updateUserData((data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = data.lastActive ? new Date(data.lastActive) : null;
    if (last) {
      last.setHours(0, 0, 0, 0);
      const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      if (diff === 0) {
        // giữ nguyên
      } else if (diff === 1) {
        data.streak = (data.streak || 0) + 1;
      } else {
        data.streak = 0;
      }
    } else {
      data.streak = 0;
    }
    data.lastActive = today.toISOString();
  });
}

// Xuất ra toàn cục
window.SharedData = {
  STORAGE_KEY,
  getDefaultUserData,
  loadUserData,
  saveUserData,
  updateUserData,
  syncUserInterface,
  getUserStats,
  addXP,
  addCorrect,
  addWrong,
  updateStreak,
  migrateOldData
};

// Gắn callback để các trang đăng ký
window.onUserDataChanged = null;

console.log('✅ Shared Data loaded. Key:', STORAGE_KEY);
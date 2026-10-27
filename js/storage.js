const STORAGE_PREFIX = "rv-workspace:";
const Storage = {
  getPreference(key, fallback = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  setPreference(key, value) {
    try {
      localStorage.setItem(
        STORAGE_PREFIX + key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.warn("Could not save preference", error);
    }
  },

  getSession(key, fallback = null) {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  setSession(key, value) {
    try {
      sessionStorage.setItem(
        STORAGE_PREFIX + key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.warn("Could not save session state", error);
    }
  },

  removeSession(key) {
    try {
      sessionStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.warn("Could not clear session state", error);
    }
  }
};
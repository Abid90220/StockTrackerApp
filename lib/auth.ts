export type StoredUser = {
    id: string;
    name: string;
    email: string;
    image?: string;
};

const CURRENT_USER_STORAGE_KEY = "tradeinsight-ai-current-user";
const REGISTERED_USERS_STORAGE_KEY = "tradeinsight-ai-users";

const isBrowser = () => typeof window !== "undefined";

const createUserId = (email: string) => email.trim().toLowerCase();

const getStoredUsers = (): StoredUser[] => {
    if (!isBrowser()) return [];

    try {
        const value = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
};

const saveStoredUsers = (users: StoredUser[]) => {
    if (!isBrowser()) return;
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): StoredUser | null => {
    if (!isBrowser()) return null;

    try {
        const value = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

export const setCurrentUser = (user: StoredUser | null) => {
    if (!isBrowser()) return;

    if (user) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }

    window.dispatchEvent(new Event("tradeinsight-ai-auth-change"));
};

export const registerUser = (formData: SignUpFormData): StoredUser => {
    const email = formData.email.trim().toLowerCase();
    const user: StoredUser = {
        id: createUserId(email),
        name: formData.fullName.trim(),
        email,
    };

    const users = getStoredUsers();
    const nextUsers = [...users.filter((storedUser) => storedUser.email !== email), user];
    saveStoredUsers(nextUsers);
    setCurrentUser(user);

    return user;
};

export const signInUser = (formData: SignInFormData): StoredUser => {
    const email = formData.email.trim().toLowerCase();
    const existingUser = getStoredUsers().find((storedUser) => storedUser.email === email);
    const user =
        existingUser ??
        ({
            id: createUserId(email),
            name: email.split("@")[0] || "TradeInsight User",
            email,
        } satisfies StoredUser);

    setCurrentUser(user);

    return user;
};

export const updateCurrentUser = (updates: Partial<StoredUser>) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const nextUser = {...currentUser, ...updates};
    setCurrentUser(nextUser);

    const users = getStoredUsers();
    saveStoredUsers(users.map((user) => (user.id === nextUser.id ? nextUser : user)));

    return nextUser;
};

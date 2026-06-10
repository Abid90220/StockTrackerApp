export type StoredUser = {
    id: string;
    name: string;
    email: string;
    image?: string;
};

type RegisteredUser = StoredUser & {
    passwordHash: string;
};

const CURRENT_USER_STORAGE_KEY = "tradeinsight-ai-current-user";
const REGISTERED_USERS_STORAGE_KEY = "tradeinsight-ai-users";

const isBrowser = () => typeof window !== "undefined";

const createUserId = (email: string) => email.trim().toLowerCase();

const getStoredUsers = (): RegisteredUser[] => {
    if (!isBrowser()) return [];

    try {
        const value = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
};

const saveStoredUsers = (users: RegisteredUser[]) => {
    if (!isBrowser()) return;
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
};

const toStoredUser = ({ id, name, email, image }: RegisteredUser): StoredUser => ({
    id,
    name,
    email,
    image,
});

const createPasswordHash = async (password: string) => {
    const normalizedPassword = password.trim();

    if (!isBrowser() || !window.crypto?.subtle) {
        return `plain:${normalizedPassword}`;
    }

    const data = new TextEncoder().encode(normalizedPassword);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

export const getCurrentUser = (): StoredUser | null => {
    if (!isBrowser()) return null;

    try {
        const value = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        const currentUser = value ? (JSON.parse(value) as StoredUser) : null;
        if (!currentUser) return null;

        const registeredUser = getStoredUsers().find(
            (user) => user.email === currentUser.email && Boolean(user.passwordHash)
        );

        if (!registeredUser) {
            localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
            return null;
        }

        return toStoredUser(registeredUser);
    } catch {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
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

export const registerUser = async (formData: SignUpFormData): Promise<StoredUser> => {
    const email = formData.email.trim().toLowerCase();
    const users = getStoredUsers();
    const existingUser = users.find((storedUser) => storedUser.email === email);

    if (existingUser?.passwordHash) {
        throw new Error("An account with this email already exists. Please sign in.");
    }

    const user: RegisteredUser = {
        id: createUserId(email),
        name: formData.fullName.trim(),
        email,
        passwordHash: await createPasswordHash(formData.password),
    };

    const nextUsers = [...users.filter((storedUser) => storedUser.email !== email), user];
    saveStoredUsers(nextUsers);
    setCurrentUser(toStoredUser(user));

    return toStoredUser(user);
};

export const signInUser = async (formData: SignInFormData): Promise<StoredUser> => {
    const email = formData.email.trim().toLowerCase();
    const existingUser = getStoredUsers().find((storedUser) => storedUser.email === email);

    if (!existingUser) {
        throw new Error("No account found with this email. Please sign up first.");
    }

    if (!existingUser.passwordHash) {
        throw new Error("This account needs to be recreated. Please sign up again.");
    }

    const passwordHash = await createPasswordHash(formData.password);
    if (existingUser.passwordHash !== passwordHash) {
        throw new Error("Incorrect password. Please try again.");
    }

    const user = toStoredUser(existingUser);
    setCurrentUser(user);

    return user;
};

export const updateCurrentUser = (updates: Partial<StoredUser>) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const nextUser = {...currentUser, ...updates};
    setCurrentUser(nextUser);

    const users = getStoredUsers();
    saveStoredUsers(
        users.map((user) =>
            user.id === nextUser.id
                ? {
                      ...user,
                      ...updates,
                  }
                : user
        )
    );

    return nextUser;
};

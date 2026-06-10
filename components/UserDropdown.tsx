'use client';

import {useEffect, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {Button} from "@/components/ui/button";
import {LogIn, LogOut} from "lucide-react";
import NavItems from "@/components/NavItems";
import {getCurrentUser, setCurrentUser, StoredUser, updateCurrentUser} from "@/lib/auth";

const UserDropdown = () => {
    const router = useRouter();
    const [user, setUser] = useState<StoredUser | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState("");

    useEffect(() => {
        const syncUser = () => {
            const currentUser = getCurrentUser();
            setUser(currentUser);
            setProfileImageUrl(currentUser?.image ?? "");
        };

        syncUser();
        window.addEventListener("tradeinsight-ai-auth-change", syncUser);
        window.addEventListener("storage", syncUser);

        return () => {
            window.removeEventListener("tradeinsight-ai-auth-change", syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    const handleSignOut = async () => {
        setCurrentUser(null);
        setUser(null);
        setProfileImageUrl("");
        router.push("/sign-in");
    };

    const handleProfileImageChange = (value: string) => {
        const trimmedValue = value.trim();
        setProfileImageUrl(value);
        const updatedUser = updateCurrentUser({image: trimmedValue || undefined});
        setUser(updatedUser);
    };

    if (!user) {
        return (
            <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-500"
                onClick={() => router.push("/sign-in")}
            >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
            </Button>
        );
    }

    const userInitial = user.name.charAt(0).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} className={"flex items-center gap-3 text-gray-400 hover:text-yellow-500"}>
                    <Avatar className="h-8 w-8">
                        {user.image && <AvatarImage src={user.image} alt={`${user.name} profile image`} />}
                        <AvatarFallback className="bg-yellow-500 text-white text-sm font-bold">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-base font-medium text-gray-400">
                            {user.name}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
                <DropdownMenuContent className={"text-gray-400"}>
                <DropdownMenuLabel>
                    <div className={"flex relative items-center gap-3 py-2"}>
                        <Avatar className="h-10 w-10">
                            {user.image && <AvatarImage src={user.image} alt={`${user.name} profile image`} />}
                            <AvatarFallback className="bg-yellow-500 text-white text-sm font-bold">
                                {userInitial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                        <span className="text-base font-medium text-gray-400">
                            {user.name}
                        </span>
                            <span className={"text-sm text-gray-500"}>{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={"bg-gray-600"}/>
                <div className="px-2 py-2">
                    <label className="text-xs font-medium text-gray-500" htmlFor="profile-image-url">
                        Profile image URL
                    </label>
                    <input
                        id="profile-image-url"
                        value={profileImageUrl}
                        onChange={(event) => handleProfileImageChange(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        placeholder="https://example.com/avatar.jpg"
                        className="mt-1 h-9 w-full rounded border border-gray-600 bg-gray-800 px-2 text-sm text-gray-400 outline-none focus:border-yellow-500"
                    />
                </div>
                <DropdownMenuSeparator className={"bg-gray-600"}/>
                <DropdownMenuItem onClick={() => handleSignOut()} className={"text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer "}>
                    <LogOut className="h-4 w-4 mr-2 hidden sm:block" />
                    Logout
                </DropdownMenuItem>
                    <DropdownMenuSeparator className="hidden sm:block bg-gray-600" />
                    <nav className="sm:hidden">
                        <NavItems/>
                    </nav>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserDropdown

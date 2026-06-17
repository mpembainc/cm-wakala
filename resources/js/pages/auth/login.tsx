import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div 
            className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(rgba(3, 7, 18, 0.85), rgba(3, 7, 18, 0.85)), url("/bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Ambient Background Blobs acting as light overlays */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/15 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/15 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                {/* Gold Animated Border Wrapper */}
                <div className="relative p-[3.5px] rounded-xl overflow-hidden bg-slate-900/10 shadow-2xl">
                    {/* Rotating Gold Gradient */}
                    <div 
                        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] pointer-events-none"
                        style={{
                            background: 'conic-gradient(from 0deg, transparent 40%, #d4af37 60%, #f9e8a2 75%, #d4af37 90%, transparent 95%)',
                        }}
                    />

                    {/* Inner Card */}
                    <Card className="relative bg-white p-8 md:p-10 rounded-lg border-0 z-10 w-full shadow-none">
                        {/* Logo */}
                        <div className="flex justify-center">
                            <div className="relative group">
                                <img
                                    src="/logo.png"
                                    alt="Logo"
                                    className="relative w-26 h-26 transition duration-500 hover:scale-102"
                                />
                            </div>
                        </div>

                        {/* Header Texts */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
                                {import.meta.env.VITE_APP_NAME}
                            </h1>
                            <p className="mt-1 text-xs text-gray-500 font-medium">
                                Sign in to manage your agent account
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-6">
                            {/* Username */}
                            <div className="space-y-1">
                                <Label htmlFor="username" className="text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Enter Username"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    className="w-full h-11 px-3 py-2.5 transition-all duration-200 outline-none"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.username}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <Label htmlFor="password" className="text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter Password"
                                        required
                                        autoComplete="current-password"
                                        className="w-full h-11 pl-3 pr-10 py-2.5 transition-all duration-200 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 bg-[#3f51b5] hover:bg-[#32408f] text-white font-semibold text-sm rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {processing && (
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                )}
                                Sign In
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Footer Text */}
                <div className="mt-8 text-center text-xs text-gray-400 font-semibold tracking-wide space-y-1">
                    <p>
                        {import.meta.env.VITE_APP_NAME} &copy; {new Date().getFullYear()} &middot; Secure Agent Portal
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-start justify-center pt-20 pb-10 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl px-8 py-8">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <img
                        src="/logo.jpg"
                        alt="Logo"
                        className="w-24 h-24 rounded-xl object-cover shadow-md"
                    />
                </div>

                {/* App Name */}
                <h1 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8">
                    {import.meta.env.VITE_APP_NAME}
                </h1>

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="Username"
                            required
                            autoFocus
                            autoComplete="username"
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 bg-gray-50 outline-none transition
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                ${errors.username ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.username && (
                            <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 bg-gray-50 outline-none transition
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                            text-white font-semibold text-sm py-2.5 rounded-lg transition-colors duration-200"
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
                    </button>

                    {/* Footer */}
                    <p className="mt-6 text-center text-xs text-gray-400">
                        {import.meta.env.VITE_APP_NAME} &copy; {new Date().getFullYear()}
                    </p>
                </form>
            </div>
        </div>
    );
}

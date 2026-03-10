<!-- frontend/views/Login.vue -->
<template>
    <div class="auth-container">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <button type="submit" class="login-btn">Login</button>
        </form>
        
        <div class="divider">
            <span>or</span>
        </div>
        
        <button type="button" @click="loginWithGoogle" class="google-login-btn">
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        </button>
        
        <p class="link-text">Don't have an account? <router-link to="/register">Sign Up</router-link></p>
        <p class="link-text">
            <router-link to="/forgot-password">Forgot Password?</router-link>
        </p>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter, useRoute} from 'vue-router'

const email = ref('')
const password = ref('')
const showToast = inject('showToast')
const user = inject('user')
const router = useRouter()
const route = useRoute()


const handleLogin = async () => {
    try {
        const res = await fetch('https://mochi-mevn.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: email.value, password: password.value }),
        })

        const data = await res.json()

        if (res.ok) {
            showToast('Login successful!', 'success')

            // ✅ Lưu token
            localStorage.setItem('token', data.token)

            // ✅ Lưu user kèm avatar
            const userObj = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                avatar: data.user.avatar || '',
                phone: data.user.phone || '',
                address: data.user.address || ''
            }

            localStorage.setItem('mochi_user', JSON.stringify(userObj))
            user.value = userObj

            const redirectPath = route.query.redirect

            if (data.user.role === 'admin') {
                router.push('/admin/dashboard')
            } else if (redirectPath) {
                router.push(redirectPath)
            } else {
                router.push('/')
            }
        } else {
            showToast(data.message || 'Login failed.', 'error')
        }
    } catch (err) {
        showToast('Error connecting to server.', 'error')
    }
};

const loginWithGoogle = () => {
    localStorage.removeItem('mochi_user');

    const popupWidth = 500;
    const popupHeight = 600;
    const screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const screenWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;

    const left = screenLeft + (screenWidth - popupWidth) / 2;
    const top = screenTop + (screenHeight - popupHeight) / 2;

    const googleWindow = window.open(
        'https://mochi-mevn.onrender.com/api/auth/google',
        'GoogleLogin',
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
    );

    const handleMessage = async (event) => {
        console.log('📩 Message received:', event.origin, event.data);

        const allowedOrigins = [
  'http://localhost:5000',
  'http://192.168.1.11:5000',
  'https://mochi-mevn.onrender.com'
];
        
        if (!allowedOrigins.includes(event.origin)) {
            console.log('❌ Origin not allowed:', event.origin);
            return;
        }

        console.log('✅ Origin allowed, checking data type...');

        if (event.data.type === 'google-login-success') {
            console.log('🔄 Fetching user info...');
            
            try {
                // ✅ FIX 1: Đợi một chút để backend set cookie
                await new Promise(resolve => setTimeout(resolve, 500));

                const res = await fetch('https://mochi-mevn.onrender.com/api/auth/me', {
                    credentials: 'include'
                });

                console.log('📡 /me response status:', res.status);

                if (res.ok) {
                    const data = await res.json();
                    // console.log('👤 User data:', data);
                    
                    // ✅ FIX 2: Xử lý nhiều cấu trúc response khác nhau
                    const userObj = {
                        id: data.userId || data.id || data.user?.id,
                        name: data.name || data.user?.name,
                        email: data.email || data.user?.email,
                        role: data.role || data.user?.role || 'user',
                        avatar: data.avatar || data.user?.avatar || '',
                        phone: data.phone || data.user?.phone || '',
                        address: data.address || data.user?.address || ''
                    };

                    localStorage.setItem('mochi_user', JSON.stringify(userObj));
                    user.value = userObj;

                    console.log('💾 User saved to localStorage and reactive state');

                    showToast('Google Login successful!', 'success');

                    // ✅ FIX 3: Lấy redirectPath từ route.query
                    const redirectPath = route.query.redirect;

                    if (userObj.role === 'admin') {
                        router.push('/admin/dashboard');
                    } else if (redirectPath) {
                        console.log('🔀 Redirecting to:', redirectPath);
                        router.push(redirectPath);
                    } else {
                        router.push('/');
                    }
                } else {
                    const errorText = await res.text();
                    console.error('❌ /me failed:', errorText);
                    showToast('Failed to fetch user info. Please try again.', 'error');
                }
            } catch (err) {
                console.error('❌ Error fetching user info:', err);
                showToast('Error fetching user info', 'error');
            }
        } else {
            console.log('⚠️ Message type mismatch:', event.data);
        }

        window.removeEventListener('message', handleMessage);
    };

    window.addEventListener('message', handleMessage);
};
</script>

<style scoped>
.auth-container {
    max-width: 400px;
    margin: 100px auto;
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.auth-container h2 {
    margin-bottom: 20px;
    font-size: 24px;
    text-align: center;
    color: #333;
}

.auth-container input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.auth-container input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.login-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.divider {
    display: flex;
    align-items: center;
    margin: 24px 0;
    color: #888;
    font-size: 14px;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
}

.divider span {
    padding: 0 16px;
    background: white;
}

.google-login-btn {
    width: 100%;
    padding: 12px 16px;
    background: white;
    color: #3c4043;
    border: 1px solid #dadce0;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.google-login-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
}

.google-login-btn:hover::before {
    left: 100%;
}

.google-login-btn:hover {
    background: #f8f9fa;
    border-color: #c8c9ca;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transform: translateY(-1px);
}

.google-login-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.google-icon {
    flex-shrink: 0;
}

.link-text {
    margin-top: 16px;
    text-align: center;
    font-size: 14px;
    color: #666;
}

.link-text a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
}

.link-text a:hover {
    text-decoration: underline;
    color: #5a67d8;
}
</style>
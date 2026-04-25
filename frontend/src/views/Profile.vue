<!-- frontend/views/Profile.vue -->
<template>
  <div class="profile-wrapper">
    <div class="profile-container">
      <!-- Elegant Header -->
      <!-- <div class="profile-header">
        <div class="header-bg"></div>
        <div class="header-content">
          <div class="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2>My Profile</h2>
          <p class="subtitle">Manage your personal information</p>
        </div>
      </div> -->

      <form @submit.prevent="updateProfile" enctype="multipart/form-data">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-container">
            <div class="avatar-ring"></div>
            <img :src="preview || user.avatar || defaultAvatar" alt="avatar" class="profile-avatar" />
            <label for="avatar-input" class="avatar-edit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </label>
            <input 
              id="avatar-input"
              type="file" 
              @change="onFileChange" 
              accept="image/*"
              style="display: none;"
            />
          </div>
          <p class="avatar-label">{{ user.name || 'User' }}</p>
          <span class="avatar-hint">Click camera icon to change photo</span>
        </div>

        <!-- Form Fields -->
        <div class="form-content">
          <div class="form-grid">
            <div class="form-field">
              <label for="name">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Full Name
              </label>
              <input 
                id="name"
                v-model="form.name" 
                type="text" 
                placeholder="Enter your full name" 
                required 
              />
            </div>

            <div class="form-field">
              <label for="email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Email Address
              </label>
              <input 
  id="email"
  v-model="form.email" 
  type="email" 
  placeholder="your.email@example.com" 
  required 
  title="Email change will be verified by OTP in the next step"
/>

            </div>

            <div class="form-field">
              <label for="phone">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Phone Number
              </label>
              <input 
                id="phone"
                v-model="form.phone" 
                type="text" 
                placeholder="+84 123 456 789" 
              />
            </div>

            <div class="form-field form-field-full">
              <label for="address">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Delivery Address
              </label>
              <textarea 
                id="address"
                v-model="form.address" 
                placeholder="Enter your full address for delivery"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Action Button -->
          <button type="submit" class="save-btn" :disabled="loading">
            <span v-if="!loading" class="btn-content">
              
              Save Changes
            </span>
            <span v-else class="btn-loading">
              <span class="spinner"></span>
              Saving...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- OTP Modal -->
<div v-if="showOtpModal" class="modal-backdrop">
  <div class="modal">
    <h3>Verify Phone Number</h3>
    <p>An OTP code has been sent to <strong>{{ pendingPhone }}</strong>.</p>
    <input
      v-model="otpCode"
      maxlength="6"
      inputmode="numeric"
      placeholder="Enter 6-digit OTP"
      class="otp-input"
    />
    <div class="modal-actions">
      <button class="btn" :disabled="otpVerifying" @click="verifyPhoneOtp">
        {{ otpVerifying ? 'Verifying...' : 'Verify' }}
      </button>
      <button class="btn-outline" :disabled="otpSeconds>0 || otpSending" @click="resendOtp">
        {{ otpSeconds>0 ? `Resend in ${otpSeconds}s` : (otpSending ? 'Sending...' : 'Resend OTP') }}
      </button>
      <button class="btn-ghost" @click="showOtpModal=false">Cancel</button>
    </div>
  </div>
</div>


<!-- Email OTP Modal -->
<div v-if="showEmailOtpModal" class="modal-backdrop">
  <div class="modal">
    <h3>Verify Email Address</h3>
    <p>An OTP code has been sent to <strong>{{ pendingEmail }}</strong>.</p>
    <input
      v-model="emailOtpCode"
      maxlength="6"
      inputmode="numeric"
      placeholder="Enter 6-digit OTP"
      class="otp-input"
    />
    <div class="modal-actions">
      <button class="btn" :disabled="otpVerifying" @click="verifyEmailOtp">
        {{ otpVerifying ? 'Verifying...' : 'Verify' }}
      </button>
      <button class="btn-outline" :disabled="otpSeconds>0 || otpSending" @click="resendEmailOtp">
        {{ otpSeconds>0 ? `Resend in ${otpSeconds}s` : (otpSending ? 'Sending...' : 'Resend OTP') }}
      </button>
      <button class="btn-ghost" @click="showEmailOtpModal=false">Cancel</button>
    </div>
  </div>
</div>


</template>

<script setup>
import { ref, inject, onMounted } from 'vue'

const showToast = inject('showToast')
const user = inject('user')
const loading = ref(false)
const preview = ref(null)
const defaultAvatar = '/assets/default-avatar.png'

const showOtpModal = ref(false)
const otpCode = ref('')
const otpSending = ref(false)
const otpVerifying = ref(false)
const otpSeconds = ref(0)
const pendingPhone = ref('') // số mới chờ xác thực
const showEmailOtpModal = ref(false)
const pendingEmail = ref('')
const emailOtpCode = ref('')

function startOtpTimer(seconds = 60) {
  otpSeconds.value = seconds
  const iv = setInterval(() => {
    otpSeconds.value -= 1
    if (otpSeconds.value <= 0) clearInterval(iv)
  }, 1000)
}
function toE164(vnPhone) {
  // Đưa số VN về dạng +84xxxxxxxxx
  let p = (vnPhone || '').replace(/\s/g, '')
  if (p.startsWith('+')) return p
  if (p.startsWith('0')) return '+84' + p.slice(1)
  // nếu user đã nhập '84...' thì thêm '+'
  if (/^\d{9,11}$/.test(p)) return '+84' + p
  return p
}

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

onMounted(() => {
  if (user.value) {
    form.value = {
      name: user.value.name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      address: user.value.address || ''
    }
  }
})

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) preview.value = URL.createObjectURL(file)
}

const updateProfile = async () => {
  const originalEmail = user.value?.email || ''
  const originalPhone = user.value?.phone || ''
  const newEmail = form.value.email.trim()
  const newPhoneE164 = toE164(form.value.phone)

  let emailChanged = newEmail && newEmail !== originalEmail
  let phoneChanged = newPhoneE164 && newPhoneE164 !== originalPhone

  // Nếu đổi cả email & phone => gửi OTP cho cả hai
  if (emailChanged || phoneChanged) {
    try {
      otpSending.value = true
      const tasks = []

      if (emailChanged) {
        tasks.push(
          fetch('http://https://mochi-mevn.onrender.com/api/users/email/change/request', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newEmail })
          })
        )
      }

      if (phoneChanged) {
        tasks.push(
          fetch('http://https://mochi-mevn.onrender.com/api/users/phone/change/request', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: newPhoneE164 })
          })
        )
      }

      // Gửi song song cả 2 request
      const results = await Promise.all(tasks.map(r => r.then(res => res.json().then(data => ({ res, data })))) )

      // Kiểm tra lỗi cho từng loại
      if (emailChanged) {
        const { res, data } = results[0]
        if (!res.ok) throw new Error(data.message || 'Failed to send email OTP')
        pendingEmail.value = newEmail
        showEmailOtpModal.value = true
      }

      if (phoneChanged) {
        const { res, data } = results[results.length - 1]
        if (!res.ok) throw new Error(data.message || 'Failed to send phone OTP')
        pendingPhone.value = newPhoneE164
        showOtpModal.value = true
      }

      startOtpTimer(60)
      showToast('OTP sent successfully!', 'success')

    } catch (err) {
      showToast(err.message || 'Failed to send OTPs', 'error')
    } finally {
      otpSending.value = false
    }

    return // chờ xác minh OTP xong mới lưu các field khác
  }

  // Nếu không đổi email hoặc phone => lưu trực tiếp
  await saveOtherFields()
}


async function saveOtherFields() {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)     // giữ nguyên
    formData.append('address', form.value.address)

    const fileInput = document.getElementById('avatar-input')
    if (fileInput?.files?.[0]) formData.append('avatar', fileInput.files[0])

    const res = await fetch('http://https://mochi-mevn.onrender.com/api/users/profile', {
      method: 'PUT',
      credentials: 'include',
      body: formData
    })

    const data = await res.json()
    if (res.ok) {
      user.value = data
      localStorage.setItem('mochi_user', JSON.stringify(data))
      showToast('Profile updated successfully!', 'success')
    } else {
      showToast(data.message || 'Failed to update profile', 'error')
    }
  } catch (err) {
    showToast('Error updating profile', 'error')
  } finally {
    loading.value = false
  }
}

// Xác minh OTP -> cập nhật phone trên server -> sau đó lưu các field khác (name/address/avatar)
async function verifyPhoneOtp() {
  if (!pendingPhone.value || !otpCode.value) {
    showToast('Please enter the OTP code', 'warning')
    return
  }

  try {
    otpVerifying.value = true
    const res = await fetch('http://https://mochi-mevn.onrender.com/api/users/phone/change/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingPhone.value, code: otpCode.value })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Invalid OTP code')

    // Server has verified and updated the phone number, returning the updated user
    user.value = data.user || user.value
    form.value.phone = user.value.phone
    localStorage.setItem('mochi_user', JSON.stringify(user.value))

    showToast('Phone number verified successfully!', 'success')
    showOtpModal.value = false
    otpCode.value = ''

    // Save other profile fields if needed
    await saveOtherFields()
  } catch (err) {
    showToast(err.message || 'Failed to verify OTP', 'error')
  } finally {
    otpVerifying.value = false
  }
}



async function resendOtp() {
  if (otpSeconds.value > 0 || !pendingPhone.value) return
  try {
    otpSending.value = true
    const res = await fetch('http://https://mochi-mevn.onrender.com/api/users/phone/change/request', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingPhone.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to resend OTP')
    startOtpTimer(60)
    showToast('OTP has been resent successfully', 'success')
  } catch (err) {
    showToast(err.message || 'Unable to resend OTP', 'error')
  } finally {
    otpSending.value = false
  }
}

// Gửi lại OTP email
async function resendEmailOtp() {
  if (otpSeconds.value > 0 || !pendingEmail.value) return
  try {
    otpSending.value = true
    const res = await fetch('http://https://mochi-mevn.onrender.com/api/users/email/change/request', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to resend OTP')

    startOtpTimer(60)
    showToast('OTP has been resent to your email', 'success')
  } catch (err) {
    showToast(err.message || 'Unable to resend OTP email', 'error')
  } finally {
    otpSending.value = false
  }
}


async function verifyEmailOtp() {
  if (!pendingEmail.value || !emailOtpCode.value) {
    showToast('Please enter the OTP code', 'warning')
    return
  }
  try {
    otpVerifying.value = true
    const res = await fetch('http://https://mochi-mevn.onrender.com/api/users/email/change/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail.value, code: emailOtpCode.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Invalid OTP code')

    user.value = data.user || user.value
    form.value.email = user.value.email
    localStorage.setItem('mochi_user', JSON.stringify(user.value))
    showToast('Email verified successfully!', 'success')
    showEmailOtpModal.value = false
    emailOtpCode.value = ''
    await saveOtherFields()
  } catch (err) {
    showToast(err.message || 'Failed to verify OTP', 'error')
  } finally {
    otpVerifying.value = false
  }
}



</script>

<style scoped>
* {
  box-sizing: border-box;
}

.profile-wrapper {
  position: relative;
  min-height: calc(100vh - 82px);
  padding: clamp(64px, 7vw, 108px) 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 12%, rgba(217, 255, 143, 0.08), transparent 26rem),
    radial-gradient(circle at 84% 26%, rgba(139, 74, 47, 0.28), transparent 30rem),
    linear-gradient(135deg, #211d18 0%, #3b2419 100%);
  color: #fffaf2;
}

.profile-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 250, 242, 0.34) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 250, 242, 0.22) 0 1px, transparent 1px);
  background-size: 18px 18px, 26px 26px;
}

.profile-wrapper::after {
  content: 'Profile';
  position: absolute;
  left: 6vw;
  top: 48px;
  color: rgba(255, 250, 242, 0.045);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(8rem, 20vw, 22rem);
  line-height: 0.8;
  letter-spacing: -0.09em;
  pointer-events: none;
}

.profile-container {
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.055);
  background-blend-mode: luminosity;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.16),
    0 34px 100px rgba(0, 0, 0, 0.28);
}

.profile-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.2px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.48) 0%,
    rgba(255, 255, 255, 0.14) 22%,
    rgba(255, 255, 255, 0.02) 48%,
    rgba(255, 255, 255, 0.16) 78%,
    rgba(255, 255, 255, 0.42) 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Avatar */
.avatar-section {
  position: relative;
  padding: 44px 34px 34px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12);
}

.avatar-section::before {
  content: 'Account details';
  display: block;
  margin-bottom: 24px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.avatar-container {
  position: relative;
  width: 136px;
  height: 136px;
  margin: 0 auto 18px;
}

.avatar-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 1px solid rgba(217, 255, 143, 0.38);
  background:
    radial-gradient(circle, rgba(217, 255, 143, 0.14), transparent 58%);
  animation: profilePulse 2.8s ease-in-out infinite;
}

.profile-avatar {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 3px solid rgba(255, 250, 242, 0.78);
  border-radius: 50%;
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
}

.avatar-edit {
  position: absolute;
  right: 4px;
  bottom: 8px;
  z-index: 2;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 250, 242, 0.22);
  border-radius: 50%;
  background: #fffaf2;
  color: #211d18;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.24);
  transition: transform 160ms ease, background 160ms ease;
}

.avatar-edit:hover {
  transform: translateY(-2px) scale(1.04);
  background: #d9ff8f;
}

.avatar-label {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.055em;
}

.avatar-hint {
  display: block;
  margin-top: 10px;
  color: rgba(255, 250, 242, 0.5);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* Form */
.form-content {
  position: relative;
  padding: 34px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 26px;
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-field label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 9px;
  color: rgba(255, 250, 242, 0.62);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.form-field label svg {
  width: 15px;
  height: 15px;
  color: #d9ff8f;
}

.form-field input,
.form-field textarea {
  width: 100%;
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 18px;
  background: rgba(255, 250, 242, 0.08);
  color: #fffaf2;
  padding: 15px 16px;
  font: inherit;
  outline: none;
  resize: vertical;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.form-field input::placeholder,
.form-field textarea::placeholder {
  color: rgba(255, 250, 242, 0.34);
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: rgba(217, 255, 143, 0.58);
  background: rgba(255, 250, 242, 0.11);
  box-shadow: 0 0 0 4px rgba(217, 255, 143, 0.08);
}

.form-field textarea {
  min-height: 96px;
  line-height: 1.65;
}

.save-btn {
  width: 100%;
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fffaf2;
  border-radius: 999px;
  background: #fffaf2;
  color: #211d18;
  padding: 0 24px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.save-btn:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.btn-content,
.btn-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(33, 29, 24, 0.18);
  border-top-color: #211d18;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* OTP modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(33, 29, 24, 0.58);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal {
  width: min(440px, 100%);
  padding: 28px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(217, 255, 143, 0.08), transparent 18rem),
    rgba(33, 29, 24, 0.92);
  color: #fffaf2;
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.36);
}

.modal h3 {
  margin: 0 0 10px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.2rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.05em;
}

.modal p {
  margin: 0;
  color: rgba(255, 250, 242, 0.68);
  line-height: 1.6;
}

.modal strong {
  color: #fffaf2;
}

.otp-input {
  width: 100%;
  margin: 18px 0 18px;
  padding: 15px 16px;
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 18px;
  background: rgba(255, 250, 242, 0.08);
  color: #fffaf2;
  font: inherit;
  font-size: 1.2rem;
  letter-spacing: 0.28em;
  text-align: center;
  outline: none;
}

.otp-input:focus {
  border-color: rgba(217, 255, 143, 0.58);
  box-shadow: 0 0 0 4px rgba(217, 255, 143, 0.08);
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.btn,
.btn-outline,
.btn-ghost {
  min-height: 42px;
  border-radius: 999px;
  padding: 0 15px;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
}

.btn {
  border: 1px solid #fffaf2;
  background: #fffaf2;
  color: #211d18;
}

.btn-outline {
  border: 1px solid rgba(255, 250, 242, 0.22);
  background: transparent;
  color: #fffaf2;
}

.btn-ghost {
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 250, 242, 0.62);
}

.btn:hover:not(:disabled),
.btn-outline:hover:not(:disabled),
.btn-ghost:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:hover:not(:disabled) {
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 250, 242, 0.08);
}

.btn:disabled,
.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
@keyframes profilePulse {
  0%,
  100% {
    opacity: 0.44;
    transform: scale(1);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.04);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 760px) {
  .profile-wrapper {
    padding: 54px 14px;
  }

  .profile-container {
    border-radius: 26px;
  }

  .avatar-section {
    padding: 34px 20px 28px;
  }

  .avatar-container {
    width: 118px;
    height: 118px;
  }

  .form-content {
    padding: 24px 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    justify-content: stretch;
  }

  .btn,
  .btn-outline,
  .btn-ghost {
    flex: 1;
  }
}
</style>
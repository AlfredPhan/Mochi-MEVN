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
          fetch('http://localhost:5000/api/users/email/change/request', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newEmail })
          })
        )
      }

      if (phoneChanged) {
        tasks.push(
          fetch('http://localhost:5000/api/users/phone/change/request', {
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

    const res = await fetch('http://localhost:5000/api/users/profile', {
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
    const res = await fetch('http://localhost:5000/api/users/phone/change/verify', {
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
    const res = await fetch('http://localhost:5000/api/users/phone/change/request', {
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
    const res = await fetch('http://localhost:5000/api/users/email/change/request', {
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
    const res = await fetch('http://localhost:5000/api/users/email/change/verify', {
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
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
  padding: 80px 20px 40px;
  position: relative;
}

.profile-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(240, 147, 251, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.profile-container {
  max-width: 680px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(102, 126, 234, 0.25),
    0 8px 24px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Header */
.profile-header {
  position: relative;
  padding: 48px 32px;
  text-align: center;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 1;
}

.header-bg::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.03) 10px,
    rgba(255, 255, 255, 0.03) 20px
  );
  animation: slide 20s linear infinite;
}

@keyframes slide {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  color: white;
  margin: 0 auto 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-header h2 {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 0;
}

/* Avatar Section */
.avatar-section {
  padding: 48px 32px 32px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-container {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 16px;
}

.avatar-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  opacity: 0.15;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.05); opacity: 0.25; }
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.avatar-container:hover .profile-avatar {
  transform: scale(1.05);
}

.avatar-edit {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 2;
}

.avatar-edit:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.avatar-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.avatar-hint {
  font-size: 0.85rem;
  color: #999;
}

/* Form Content */
.form-content {
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-field label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #444;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.form-field label svg {
  color: #764ba2;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: inherit;
  color: #333;
  background: #fafafa;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-field textarea {
  resize: vertical;
  min-height: 90px;
  line-height: 1.6;
}

/* Save Button */
.save-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.save-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.save-btn:hover:not(:disabled)::before {
  left: 100%;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
}

.save-btn:active:not(:disabled) {
  transform: translateY(0);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content,
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .profile-wrapper {
    padding: 60px 16px 30px;
  }

  .profile-header {
    padding: 36px 24px;
  }

  .profile-header h2 {
    font-size: 1.6rem;
  }

  .header-icon {
    width: 64px;
    height: 64px;
  }

  .header-icon svg {
    width: 36px;
    height: 36px;
  }

  .avatar-container {
    width: 120px;
    height: 120px;
  }

  .form-content {
    padding: 24px 20px;
  }
}

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal {
  width: 100%; max-width: 420px; background: #fff; border-radius: 16px;
  padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal h3 { margin: 0 0 8px; }
.otp-input {
  width: 100%; padding: 12px 14px; font-size: 1.1rem; letter-spacing: 4px;
  text-align: center; border: 2px solid #e8e8e8; border-radius: 12px; margin: 12px 0 16px;
}
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; padding:10px 16px; border-radius:10px; cursor:pointer; }
.btn-outline { background:#fff; border:2px solid #e8e8e8; padding:10px 16px; border-radius:10px; cursor:pointer; }
.btn-ghost { background:transparent; border:none; padding:10px 16px; cursor:pointer; }
.btn:disabled, .btn-outline:disabled { opacity:.6; cursor:not-allowed; }

</style>
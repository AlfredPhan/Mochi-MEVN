<template>
    <div v-if="visible" class="toast" :class="type">{{ message }}</div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps(['message', 'type'])
  const visible = ref(true)
  
  setTimeout(() => {
    visible.value = false
  }, 3000)
  </script>
  
  <style scoped>
  .toast {
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 500;
    z-index: 9999;
    animation: fade 0.3s ease;
    color: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
  .toast.success {
    background: linear-gradient(135deg, #16a34a, #22c55e);
  }
  .toast.error {
    background: linear-gradient(135deg, #dc2626, #f87171);
  }

  .toast.warning {
  background: linear-gradient(135deg, #ea580c, #fb923c);
}

  
  @keyframes fade {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  </style>
  
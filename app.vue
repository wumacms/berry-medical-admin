<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// 等待 Pinia store 可用
await useAuthStore()
</script>

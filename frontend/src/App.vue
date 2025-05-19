<template>
  <header>
    <nav class="navigation">
      <router-link class="nav_link" to="/">Главная</router-link>
      <router-link class="nav_link" to="/create-new-ticket">Создать обращение</router-link>
    </nav>
  </header>
  <div class="wrapper">
    <router-view />
  </div>
</template>

<script setup>
</script>
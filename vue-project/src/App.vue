<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-brand">
        <h2>Project Manager</h2>
      </div>
      <div class="nav-links">
        <router-link to="/projects" class="nav-link">Projects</router-link>
        <router-link to="/reports" class="nav-link">Reports</router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// App logic
</script>

<style scoped>
#app {
  max-width: none;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.main-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h2 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.main-content {
  min-height: calc(100vh - 80px);
  background: #f9fafb;
}
</style>
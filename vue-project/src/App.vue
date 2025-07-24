<script setup>
import KanbanBoard from './components/KanbanBoard.vue'
</script>


<template>
    <KanbanBoard />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f5f7fa;
  color: #2c3e50;
}

#app {
  min-height: 100vh;
}
</style>

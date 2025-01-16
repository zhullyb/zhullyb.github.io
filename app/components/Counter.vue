<template>
  <div>
    <h1>Counter: {{ count }}</h1>
    <button
      class="mr-2"
      @click="increment"
    >
      Increment
    </button>
    <button @click="decrement">
      Decrement
    </button>
  </div>
</template>

<script setup lang="ts">
const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<style scoped>
button {
  margin: 5px;
}
</style>

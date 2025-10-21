<template>
    <div class="d-flex admin-root">
        <SidebarAdmin class="flex-shrink-0" />
        <main id="content" class="flex-grow-1 p-3">
            <RouterView />
        </main>
    </div>
</template>

<script setup>
import SidebarAdmin from '../common/SidebarAdmin.vue'
</script>

<style scoped>
.admin-root {
    height: 100vh;
    overflow: hidden;
}

#content {
    height: 100vh;
    overflow-y: auto;
    background-color: #f9f9f9;
}
</style>

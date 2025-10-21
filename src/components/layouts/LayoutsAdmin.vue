<template>
    <!-- <HeaderAdmin /> -->
    <div class="d-flex admin-root">
        <SidebarAdmin class="flex-shrink-0" />
        <main id="content" class="flex-grow-1 p-3">
            <RouterView />
        </main>
    </div>
</template>

<script setup>
import SidebarAdmin from '../common/SidebarAdmin.vue';

</script>

<style scoped>
</style>
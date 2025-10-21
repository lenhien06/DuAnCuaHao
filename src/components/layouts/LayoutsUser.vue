<template>
  <div class="userLayout">
    <header class="sticky-header">
      <NavbarUser />
    </header>

    <div class="container-fluid">
      <div class="row">
        <Banner />
        <main class="main-content">
          <div class="container">
            <RouterView />
          </div>
        </main>
      </div>
    </div>

    <Footer></Footer>
  </div>
</template>

<script setup>
import Banner from '../common/Banner.vue'
import Footer from '../common/Footer.vue'
import NavbarUser from '../common/NavbarUser.vue'
</script>

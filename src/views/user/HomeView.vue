<template>
  <main>
    <HeroSectionView></HeroSectionView>
    <CategoryView></CategoryView>
    <!-- <ProductListUserView/> -->
    <RestaurantListView />
  </main>
</template>

<script setup>

import RestaurantListView from './RestaurantListView.vue'
import CategoryView from './CategoryView.vue';
import HeroSectionView from './HeroSectionView.vue';

</script>

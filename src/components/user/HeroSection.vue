<template>
    <!-- Hero section -->
    <div class="container text-center my-5">
        <h1 class="fw-bold">Order food you love</h1>
        <p class="text-muted">Discover restaurants that deliver near you</p>
        <div class="search-box input-group mt-4">
            <input type="text" class="form-control" placeholder="Enter your delivery address">
            <button class="btn btn-brand">Tìm kiếm</button>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
.btn-brand {
    background-color: #00b14f;
    color: #fff;
}

.btn-brand:hover {
    background-color: #009944;
    color: #fff;
}

.search-box {
    max-width: 600px;
    margin: auto;
}
</style>
<template>
    <div class="not-found">
        <h3>{{strings.route_not_found}}</h3>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: "not-found",
        computed: mapState(['strings']),
        created: function() {
        }
    }
</script>

<style scoped>

</style>

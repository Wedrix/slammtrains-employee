<template>
    <router-view/>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';

    export default {
        name: 'DashboardLayout',
        created() {
            this.$store.dispatch('initializeSettings');

            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    this.$store.dispatch('initializeCompany');
                    this.$store.dispatch('initializeEmployee');
                } else {
                    this.$store.dispatch('clear');
                }
            });
        }
    };
</script>

<style lang="scss">
    .textured-background {
        background-image: url('../../assets/background.png');
        background-repeat: repeat;
    }
    .plain-background {
        background-color: #32527910 !important;
    }
</style>
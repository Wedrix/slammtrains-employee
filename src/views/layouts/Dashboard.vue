<template>
    <v-app>
        <v-app-bar app flat style="background-color: white; border-bottom: thin solid rgba(0, 0, 0, 0.12) !important">
            <v-container 
                fluid 
                fill-height 
                class="pa-0" 
                style="max-width:1450px;">            
                    <v-sheet 
                        class="d-flex px-4" 
                        width="100%"  
                        min-height="100%"
                        style="align-items:center;">
                            <v-avatar tile width="145">
                                <img src="@/assets/logo.png"/>
                            </v-avatar>

                            <v-spacer/>

                            <v-avatar
                                size="40"
                                tile>
                                    <img :src="company.logo.src"/>
                            </v-avatar>

                            <v-spacer/>

                            <v-btn icon>
                                <v-icon>mdi-bell</v-icon>
                            </v-btn>

                            <v-menu bottom left offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn class="ml-2" color="secondary" fab :elevation="0" small v-bind="attrs" v-on="on">
                                        {{ getInitials(employee.name) }}
                                    </v-btn>
                                </template>

                                <v-list>
                                    <v-list-item>
                                        <v-list-item-icon>
                                            <v-icon>mdi-account-outline</v-icon>
                                        </v-list-item-icon>

                                        <v-list-item-content>
                                            <v-list-item-title>Profile</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-list-item>
                                        <v-list-item-icon>
                                            <v-icon>mdi-clock-outline</v-icon>
                                        </v-list-item-icon>

                                        <v-list-item-content>
                                            <v-list-item-title>Learning History</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-list-item>
                                        <v-list-item-icon>
                                            <v-icon>mdi-message-question-outline</v-icon>
                                        </v-list-item-icon>

                                        <v-list-item-content>
                                            <v-list-item-title>Asked Questions</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-list-item>
                                        <v-list-item-icon>
                                            <v-icon>mdi-information-outline</v-icon>
                                        </v-list-item-icon>

                                        <v-list-item-content>
                                            <v-list-item-title>About</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-divider/>

                                    <v-list-item @click="logout()">
                                        <v-list-item-icon>
                                            <v-icon>mdi-logout</v-icon>
                                        </v-list-item-icon>

                                        <v-list-item-content>
                                            <v-list-item-title>Logout</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                    </v-sheet>
            </v-container>
        </v-app-bar>

        <v-main class="plain-background">
            <v-container 
                fluid 
                fill-height 
                class="d-flex pa-0" 
                style="justify-content:center;max-width:1450px;"> 
                    <router-view/>
            </v-container>

            <notification/>

            <v-overlay :value="isInitializing">
                <v-progress-circular indeterminate size="64"/>
            </v-overlay>
        </v-main>
    </v-app>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';
    import 'firebase/auth';

    import Notification from '@/components/Notification.vue';

    import { mapState } from 'vuex';

    export default {
        name: 'DashboardLayout',
        components: {
            'notification': Notification,
        },
        computed: {
            ...mapState([
                'employee',
                'company',
            ]),
            isInitializing() {
                if (!this.employee.id && !this.company.id) {
                    return true;
                }

                return false;
            }
        },
        methods: {
            async logout() {
                try {
                    await firebase.auth().signOut();
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }
            },
            getInitials(name) {
                const names = name.split(' ');

                let initials = `${names[0].charAt(0)}`;

                if (names[names.length - 1]) {
                    initials = initials + `${names[names.length - 1].charAt(0)}`;
                }

                return initials;
            },
        },
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

<style>
    .main-view {
        border-top: thin solid rgba(0, 0, 0, 0.12) !important;
        border-left: thin solid rgba(0, 0, 0, 0.12) !important;
        border-right: thin solid rgba(0, 0, 0, 0.12) !important;
    }
    .v-toolbar__content {
        padding: 0;
    }
    .textured-background {
        background-image: url('../../assets/background.png');
        background-repeat: repeat;
    }
    .plain-background {
        background-color: #32527910 !important;
    }
</style>
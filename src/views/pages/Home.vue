<template>
    <v-app>
        <v-app-bar app flat color="white" style="border-bottom: thin solid rgba(0, 0, 0, 0.12) !important">
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

                            <v-menu left bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn class="ml-2" color="secondary" fab :elevation="0" small v-bind="attrs" v-on="on">
                                        {{ getInitials(employee.name) }}
                                    </v-btn>
                                </template>

                                <v-list>
                                    <v-list-item>
                                        <v-list-item-icon>
                                            <v-icon>mdi-account-circle</v-icon>
                                        </v-list-item-icon>

                                        <v-list-item-content>
                                            <v-list-item-title>Account</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-divider/>

                                    <v-list-item>
                                        <v-btn @click="logout()" color="secondary" small block>
                                            <v-icon>mdi-logout</v-icon> LOGOUT
                                        </v-btn>
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
                    <v-sheet 
                        class="main-view pa-12" 
                        color="white" 
                        width="100%"  
                        min-height="100%">
                            <div class="text-h4 font-weight-bold primary--text pb-6">Welcome {{ employee.name }}</div>
                            <div class="bp-12">
                                <div class="text-h6 primary--text">Course List</div>
                                <v-row>
                                    <v-col
                                        v-for="course in courses"
                                        :key="course.id"
                                        cols="12"
                                        sm="6"
                                        md="4"
                                        lg="3">
                                            <course-swatch :course="course"/>
                                    </v-col>
                                </v-row>
                            </div>
                    </v-sheet>
            </v-container>

            <notification/>
        </v-main>
    </v-app>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';

    import Notification from '@/components/Notification.vue';
    import CourseSwatch from '@/components/CourseSwatch.vue';

    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'Home',
        components: {
            'notification': Notification,
            'course-swatch': CourseSwatch,
        },
        computed: {
            ...mapState([
                'employee',
                'company',
            ]),
            ...mapGetters([
                'courses',
            ]),
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
    };
</script>

<style scoped>
    .main-view {
        border-top: thin solid rgba(0, 0, 0, 0.12) !important;
        border-left: thin solid rgba(0, 0, 0, 0.12) !important;
        border-right: thin solid rgba(0, 0, 0, 0.12) !important;
    }
</style>

<style>
    .v-toolbar__content {
        padding: 0;
    }
</style>
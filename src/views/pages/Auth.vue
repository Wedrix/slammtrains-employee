<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
            <v-form 
                ref="verifyAuthEmailForm" 
                @submit.prevent="signIn()">
                    <v-card elevation="12" class="px-2 py-4">
                        <div class="d-flex pa-4">
                            <a href="http://slammtrains.com" class="mx-auto">
                                <v-avatar tile width="145" color="white">
                                    <img src="@/assets/logo.png"/>
                                </v-avatar>
                            </a>
                        </div>
                        <v-card-text>
                            <v-alert v-model="alert.show" 
                                :dismissible="true" 
                                :prominent="true" 
                                type="error"
                                class="pb-4">
                                    {{ alert.message }}
                            </v-alert>
                            <div class="text-h6 primary--text text-center pb-4">
                                Kindly verify the email to which your sign-in link was sent
                            </div>
                            <v-text-field
                                label="Email"
                                name="email"
                                prepend-icon="mdi-email"
                                type="email"
                                v-model="authEmail"
                                :rules="[required,isEmail]"
                                required/>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer/>
                            <v-btn color="primary" type="submit" :loading="isSigningIn">Verify Email</v-btn>
                        </v-card-actions>
                    </v-card>
            </v-form>
        </v-col>
    </v-row>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/auth';

    import validators from '@/mixins/validators';

    export default {
        mixins: [validators],
        data() {
            return {
                authEmail: '',
                alert: {
                    message: null,
                    show: false,
                },
                isSigningIn: false,
            };
        },
        methods: {
            async signIn() {
                this.isSigningIn = true;

                try {
                    await firebase.auth()
                                .signInWithEmailLink(this.authEmail, location.href);

                    this.$refs.verifyAuthEmailForm.resetValidation();
                } catch (error) {
                    this.alert = {
                        message: error.message,
                        show: true,
                    };
                }

                this.isSigningIn = false;
            }
        }
    };
</script>
<template>
    <div class="d-flex justify-center align-center pa-6" style="width:100%;">
        <v-card
            outlined
            elevation="1"
            color="white"
            class="pb-4"
            max-width="400px"
            width="100%">
                <template v-if="auth.mode === 'authenticate'">
                    <v-form @submit.prevent="authenticate()" ref="authForm">
                        <v-card-title>
                            <span class="headline primary--text">Sign In</span>
                        </v-card-title>
                        <template v-if="auth.emailLinkSent">
                            <v-card-text class="primary--text">
                                A sign in link has been sent to the provided email. 
                                <br/>Kindly use it to authenticate your account.
                            </v-card-text>
                            <v-card-actions>
                                <v-btn 
                                    color="secondary" 
                                    depressed
                                    large
                                    rounded
                                    block
                                    :disabled="auth.cannotResendEmailLink">
                                        Resend Link 
                                        <span v-if="auth.cannotResendEmailLink" class="pl-2">
                                            ({{ auth.resendEmailLinkTimer.secondsRemaining | toTimer }})
                                        </span>
                                </v-btn>
                            </v-card-actions>
                        </template>
                        <template v-else>
                            <v-card-text>
                                <v-alert 
                                    v-model="auth.error.show" 
                                    :dismissible="false" 
                                    prominent
                                    colored-border
                                    border="right"
                                    type="error">
                                        {{ auth.error.message }}
                                </v-alert>

                                <v-text-field 
                                    v-model="auth.email"
                                    label="Work Email" 
                                    :rules="[required]"
                                    required/>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn 
                                    color="secondary" 
                                    type="submit"
                                    depressed
                                    :loading="auth.isAuthenticating"
                                    large
                                    rounded
                                    block>
                                        Sign In
                                </v-btn>
                            </v-card-actions>
                        </template>
                    </v-form>
                </template>
                <template v-if="auth.mode === 'verify'">
                    <v-form @submit.prevent="signIn(auth.email)" ref="authForm">
                        <v-card-title>
                            <span class="headline primary--text">Verify Email</span>
                        </v-card-title>
                        <v-card-text class="primary--text">
                            Kindly verify the email to which the authentication link was sent.
                        </v-card-text>
                        <v-card-text>
                            <v-alert 
                                v-model="auth.error.show" 
                                :dismissible="false" 
                                prominent
                                colored-border
                                border="right"
                                type="error">
                                    {{ auth.error.message }}
                            </v-alert>
                            
                            <v-text-field 
                                v-model="auth.email"
                                label="Authenticated Email" 
                                :rules="[required]"
                                required/>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn 
                                color="secondary" 
                                type="submit"
                                depressed
                                :loading="auth.isAuthenticating"
                                large
                                rounded
                                block>
                                    Verify Email
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </template>
        </v-card>
        <v-overlay :value="loading">
            <v-progress-circular indeterminate size="64"/>
        </v-overlay>
    </div>
</template>


<script>
    import firebase from '@/firebase';
    import 'firebase/auth';

    import { cloneDeep } from 'lodash';

    import validators from '@/mixins/validators';

    const init = {
        timer: {
            id: null,
            secondsRemaining: 0,
            callbackFunction: null,
        },
    };

    export default {
        name: 'AuthPage',
        mixins: [validators],
        data() {
            return {
                loading: false,
                auth: {
                    mode: 'authenticate',
                    error: {
                        show: false,
                        message: '',
                    },
                    email: '',
                    isAuthenticating: false,
                    emailLinkSent: false,
                    cannotResendEmailLink: true,
                    resendEmailLinkTimer: cloneDeep(init.timer),
                },
            };
        },
        methods: {
            async authenticate() {
                this.auth.isAuthenticating = true;

                const actionCodeSettings = {
                    url: this.$$config.auth.app_domain,
                    handleCodeInApp: true, // This must be true
                };

                try {
                    await firebase.auth().sendSignInLinkToEmail(this.auth.email, actionCodeSettings);

                    localStorage.setItem('authEmail', this.auth.email);

                    this.auth.emailLinkSent = true;

                    this.auth.cannotResendEmailLink = true;

                    this.setTimer(this.auth.resendEmailLinkTimer, 60, () => {
                        this.auth.cannotResendEmailLink = false;
                    });

                    this.auth.email = '';
                    this.$refs.authForm.resetValidation();
                }
                catch (error) {
                    this.auth.error = {
                        ...error,
                        show: true,
                    };
                }

                this.auth.isAuthenticating = false;
            },
            async signIn(email) {
                this.loading = true;

                try {
                    await firebase.auth().signInWithEmailLink(email, location.href);
                }
                catch (error) {
                    this.auth.error = {
                        ...error,
                        show: true,
                    };
                }

                this.loading = false;
            },
            setTimer(timer, durationInSeconds, callbackFunction = null) {
                this.clearTimer(timer);

                timer.secondsRemaining = durationInSeconds;

                timer.callbackFunction = callbackFunction;

                timer.id = setInterval(() => {
                    if (timer.secondsRemaining > 0) {
                        timer.secondsRemaining--;
                    } else {
                        timer.callbackFunction();

                        clearInterval(timer.id);
                    }
                }, 1000);
            },
            clearTimer(timer) {
                if (timer.id) {
                    clearInterval(timer.id);
                }

                timer = cloneDeep(init.timer);
            },
        },
        mounted() {
            if (firebase.auth().isSignInWithEmailLink(location.href)) {
                const email = localStorage.getItem('authEmail');

                if (!email) {
                    this.auth.mode = 'verify';
                    this.auth.showDialog = true;

                    return;
                }

                this.signIn(email);

                localStorage.removeItem('authEmail');
            }
        },
        created() {
            this.$store.dispatch('initializeSettings');
        },
        filters: {
            toTimer(durationInSeconds) {
                const seconds = (durationInSeconds % 60);
                const minutes = (Math.floor(durationInSeconds / 60));

                let secondsString = seconds.toString();
                let minutesString = minutes.toString();

                if (secondsString.length === 1) {
                    secondsString = `0${secondsString}`;
                }

                if (minutesString.length === 1) {
                    minutesString = `0${minutesString}`;
                }

                return `${minutesString}:${secondsString}`;
            }
        },
    };
</script>
<template>
    <div class="pa-4">
        <v-row class="ma-0">
            <v-col cols="1" class="d-flex justify-center align-center">
                <v-avatar color="teal lighten-2" size="54">
                    <span class="font-weight-bold white--text">{{ review.employeeInitials }}</span>
                </v-avatar>
            </v-col>
            <v-col cols="11" class="d-flex flex-column justify-center">
                <div class="text--secondary">Reviewed on {{ formatDate(review.createdAt) }}</div>
                <v-rating
                    v-model="review.rating"
                    color="amber lighten-1"
                    background-color="grey darken-1"
                    dense
                    readonly/>
            </v-col>
        </v-row>
        <div>
            <div class="font-weight-bold one-line-clamped">{{ summary }}</div>
            <div class="text-body-2">{{ review.body }}</div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';

    export default {
        name: 'Review',
        props: ['review'],
        computed: {
            summary() {
                return this.review.body.substring(0, 64);
            }
        },
        methods: {
            formatDate(timestamp) {
                return moment(timestamp).format("DD/MM/YY");
            },
        }
    };
</script>

<style scoped>
    .one-line-clamped {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-height: 1.375rem;
        height: 1.375rem;
        -webkit-line-clamp: 1; /* number of lines to show */
        -webkit-box-orient: vertical;
    }
</style>
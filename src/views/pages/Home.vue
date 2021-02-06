<template>         
    <v-sheet 
        class="main-view pa-12"
        width="100%"  
        min-height="100%"
        style="background-color: white;">
            <div class="text-h4 font-weight-bold primary--text pb-6">Welcome, {{ employee.name }}</div>
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
                            <course-swatch :course="course" @click="isShowingCoursesOverviewDialog[course.id] = true;"/>
                            <v-dialog
                                v-model="isShowingCoursesOverviewDialog[course.id]"
                                max-width="800">
                                    <course-overview :course="course"/>
                            </v-dialog>
                    </v-col>
                </v-row>
            </div>
    </v-sheet>
</template>

<script>
    import CourseSwatch from '@/components/CourseSwatch.vue';

    import { mapState, mapGetters } from 'vuex';
    import CourseOverview from '../../components/CourseOverview.vue';

    export default {
        name: 'Home',
        components: {
            CourseSwatch,
            CourseOverview
        },
        data() {
            return {
                isShowingCoursesOverviewDialog: {},
            };
        },
        computed: {
            ...mapState([
                'employee',
            ]),
            ...mapGetters([
                'courses',
            ]),
        },
        mounted() {
            const unwatch = this.$watch('courses', courses => {
                if (courses && (courses.length > 0)) {
                    courses.forEach(course => {
                        this.$set(this.isShowingCoursesOverviewDialog, course.id, false);
                    });

                    if (unwatch) {
                        unwatch();
                    }
                }
            }, { immediate: true });
        }
    };
</script>
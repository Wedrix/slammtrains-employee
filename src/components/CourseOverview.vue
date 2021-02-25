<template>
    <v-card 
        outlined
        elevation="1"
        color="white"
        min-height="90vh">
            <v-sheet 
                min-height="200px">
                    <v-row class="ma-0">
                        <v-col class="pa-0" cols="12" sm="4">
                            <v-img class="rounded-tl" height="100%" min-height="200" :src="course.thumbnail.src"/>
                        </v-col>
                        <v-col cols="12" sm="8">
                            <div class="pa-4">
                                <div class="text-h4 primary--text pb-4">{{ course.name }}</div>
                                <div class="text-body-2 three-line-clamped">{{ course.overview }}</div>
                            </div>
                        </v-col>
                    </v-row>
                    <v-divider/>
                    <v-row class="ma-0">
                        <v-col class="d-flex align-center" cols="12" sm="9">
                            <div class="d-flex text-caption">
                                <div class="d-flex align-center pr-4">
                                    <template v-if="rating">
                                        <v-rating :value="rating" 
                                            color="amber lighten-1"
                                            background-color="grey darken-1"
                                            dense 
                                            readonly/>
                                        <span class="pl-1">({{ course.reviewsSumTotal }} review)</span>
                                    </template>
                                    <template v-else>
                                        <v-rating :value="0" 
                                            background-color="grey" 
                                            color="grey" 
                                            dense 
                                            readonly/>
                                        <span class="font-italic pl-1">(No reviews)</span>
                                    </template>
                                </div>
                            </div>
                        </v-col>
                        <v-col class="d-flex align-center" cols="12" sm="3">
                            <v-btn 
                                :to="`/courses/${course.id}`"
                                color="secondary" 
                                depressed>
                                    {{ courseCompletionPercentage > 0 ? 'Resume Course' : 'Start Course' }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-divider/>
            </v-sheet>

            <v-progress-linear
                color="teal lighten-2"
                :value="courseCompletionPercentage"/>

            <v-tabs v-model="tab" height="60">
                <v-tab>Table of contents</v-tab>
                <v-tab>Description</v-tab>
                <v-tab>Reviews & Rating</v-tab>
            </v-tabs>

            <v-divider/>

            <v-tabs-items v-model="tab">
                <v-tab-item>
                    <div class="py-2 px-4 d-flex justify-end">
                        <v-btn @click="
                            (expandedModules.length === course.modules.length) 
                            ? collapseAllModules() 
                            : expandAllModules()"
                            text 
                            color="primary">
                                {{ 
                                    (expandedModules.length === course.modules.length) 
                                    ? 'Collapse All' 
                                    : 'Expand All' 
                                }}
                        </v-btn>
                    </div>
                    <v-divider/>
                    <v-expansion-panels v-model="expandedModules" flat accordion multiple>
                        <v-expansion-panel
                            v-for="(courseModule, index) in course.modules"
                            :key="`courseModule-${index}`">
                                <v-expansion-panel-header>
                                    <v-row no-gutters>
                                        <v-col cols="7" class="d-flex align-center">
                                            <div class="text-body-1">{{ courseModule.name }}</div>
                                        </v-col>
                                        <v-col cols="5" class="d-flex align-center justify-end pr-4">
                                            <v-icon v-if="courseModule.percentageCompleted === 100"
                                                color="teal lighten-2"
                                                class="mr-6">
                                                    mdi-check
                                            </v-icon>
                                            <div class="text-right">
                                                {{ courseModule.lessons.length }} lessons .
                                                {{ computeCourseModuleDurationInSeconds(courseModule) | toTimer }}
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-list class="pl-2">
                                        <template 
                                            v-for="(lesson, index) in courseModule.lessons">
                                                <v-divider :key="`section-divider-${index}`"/>
                                                <v-list-item 
                                                    :key="`lesson-${index}`">
                                                        <v-row 
                                                            align="center" 
                                                            class="text-caption">
                                                                <v-col cols="9" class="d-flex align-center">
                                                                    <v-icon 
                                                                        color="secondary" 
                                                                        class="mr-8"
                                                                        size="18">
                                                                            {{ lessonContentIcons[lesson.contentType] }}
                                                                    </v-icon>
                                                                    <div>{{ lesson.title }}</div>
                                                                </v-col>
                                                                <v-col cols="3" class="d-flex justify-end align-center">
                                                                    <v-icon v-if="lesson.isCompleted"
                                                                        color="teal lighten-2"
                                                                        class="mr-6">
                                                                            mdi-check
                                                                    </v-icon>
                                                                    <div>{{ lesson.durationInSeconds | toTimer }}</div>
                                                                </v-col>
                                                        </v-row>
                                                </v-list-item>
                                        </template>
                                    </v-list>
                                </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-tab-item>
                <v-tab-item>
                    <div class="pa-6">{{ course.description }}</div>
                </v-tab-item>
                <v-tab-item>
                    <template v-for="(review, index) in reviews">
                        <review :key="review.id" :review="review"/>
                        <v-divider v-if="(index + 1) !== reviews.length" :key="index"/>
                    </template>
                </v-tab-item>
            </v-tabs-items>

            <v-divider/>
    </v-card>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/firestore';

    import { mapState } from 'vuex';

    import Review from './Review';

    export default {
        name: 'CourseOverview',
        props: ['course'],
        components: {
            Review,
        },
        data() {
            return {
                tab: 0,
                lessonContentIcons: {
                    html: 'mdi-file-document',
                    video: 'mdi-video',
                    questions: 'mdi-help-circle',
                },
                expandedModules: [0],
                reviews: [],
            };
        },
        computed: {
            ...mapState([
                'employee',
            ]),
            courseCompletionPercentage() {
                const completedLessonsCount = 
                    this.course
                        .modules
                        .reduce((totalLessonsCompleted, courseModule) => {
                            return totalLessonsCompleted + courseModule.lessons
                                            .reduce((lessonsCompletedCount, lesson) => {
                                                if (lesson.isCompleted) {
                                                    return lessonsCompletedCount + 1;
                                                }

                                                return lessonsCompletedCount;
                                            }, 0);
                        }, 0);

                const lessonsCount = 
                    this.course
                        .modules
                        .reduce((totalLessons, courseModule) => {
                            return totalLessons + courseModule.lessons.length;
                        }, 0);

                if (lessonsCount > 0) {
                    return Math.ceil(completedLessonsCount / lessonsCount * 100);
                }

                return 0;
            },
            rating() {
                if (this.course.reviewsSumTotal > 0) {
                    return (this.course.ratingsSumTotal / this.course.reviewsSumTotal).toFixed(1);
                }

                return null;
            }
        },
        methods: {
            setLearningHistory() {
                const hasCompletedLesson = lesson => {
                    let completed = false;

                    const enrolledCourse = this.employee.enrolledCourses[this.course.id];

                    if (enrolledCourse) {
                        const lessonModule = this.getLessonModule(lesson);

                        const moduleTaken = enrolledCourse[lessonModule.name];

                        if (moduleTaken) {
                            completed = moduleTaken.completedLessons.includes(lesson.title);
                        }
                    }

                    return completed;
                };

                const computeModuleCompletionPercentage = courseModule => {
                    const completedLessonsCount = courseModule.lessons.reduce((count, lesson) => {
                        if (lesson.isCompleted) {
                            return count + 1;
                        }

                        return count;
                    }, 0);

                    return (completedLessonsCount / courseModule.lessons.length * 100);
                };

                this.course
                    .modules
                    .forEach(courseModule => {
                        courseModule.lessons.forEach(lesson => {
                            if (!lesson.isCompleted) {
                                this.$set(lesson, 'isCompleted', hasCompletedLesson(lesson));
                            }
                        });

                        this.$set(courseModule, 'percentageCompleted', computeModuleCompletionPercentage(courseModule));
                    });
            },
            getLessonModule(lesson) {
                return this.course.modules.find(courseModule => {
                    return courseModule.lessons.includes(lesson);
                });
            },
            computeCourseModuleDurationInSeconds(courseModule) {
                const durationInSeconds = (courseModule.lessons.reduce((total, currentModule) => {
                                            return total + currentModule.durationInSeconds;
                                        }, 0));

                return durationInSeconds;
            },
            expandAllModules() {
                this.expandedModules = [...Array(this.course.modules).keys()].map((k, i) => i)
            },
            collapseAllModules() {
                this.expandedModules = []
            },
            loadReviews() {
                this.$bind('reviews', firebase.firestore().collection(`courses/${this.course.id}/reviews`));
            }
        },
        mounted() {
            this.setLearningHistory();

            this.loadReviews();
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

<style scoped>
    .three-line-clamped {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-height: 1.375rem;
        height: 4.125rem;
        -webkit-line-clamp: 3; /* number of lines to show */
        -webkit-box-orient: vertical;
    }
</style>
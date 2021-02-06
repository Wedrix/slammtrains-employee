<template>
    <v-app>
        <v-app-bar 
            app 
            flat 
            clipped-right
            color="white" 
            style="border-bottom: thin solid rgba(0, 0, 0, 0.12) !important">
                <v-btn 
                    icon 
                    to="/"
                    class="mx-4"
                    color="secondary">
                        <v-icon size="30">mdi-home-variant</v-icon>
                </v-btn>
                <div class="text-h5 primary--text">{{ activeLesson.title }}</div>
                <v-spacer/>
                <div class="d-none d-md-flex mx-6">
                    <div 
                        class="d-flex align-center primary--text mx-6" 
                        style="cursor:pointer;"
                        @click="isShowingAskAQuestionDialog = true;">
                            <v-icon size="22" class="mr-1" color="blue-grey lighten-2">mdi-message-question</v-icon>
                            Ask a question
                    </div>
                    <div 
                        class="d-flex align-center primary--text mx-6" 
                        style="cursor:pointer;">
                            <v-icon size="22" class="mr-1" color="blue-grey lighten-2">mdi-star</v-icon>
                            Leave a review
                    </div>
                    <div class="d-flex align-center primary--text mx-6">
                        <v-progress-circular
                            color="teal lighten-2"
                            :size="40"
                            :value="courseCompletionPercentage"
                            :rotate="270"
                            width="3"
                            class="mr-2">
                                <div class="text-caption primary--text">
                                    {{ courseCompletionPercentage }}%
                                </div>
                        </v-progress-circular>
                        Course progress
                    </div>
                </div>
        </v-app-bar>

        <v-main class="plain-background">
            <v-container 
                fluid 
                fill-height 
                class="pa-0">
                    <v-sheet 
                        color="white" 
                        height="100%"
                        width="100%">
                            <template v-if="activeLesson.contentType === 'questions'">
                                <v-progress-linear
                                    color="teal lighten-2"
                                    :value="percentageQuestionsAnswered"/>

                                <div class="py-6 px-12">
                                    <template v-if="activeQuestion">
                                        <v-row>
                                            <v-col cols="12" md="9">
                                                <v-form ref="questionForm" @submit.prevent="answerQuestion()">
                                                    <v-row>
                                                        <v-col cols="12">
                                                            <div class="text-h4 secondary--text">
                                                                <span>(Qn.{{ activeLesson.content.questions.indexOf(activeQuestion) + 1 }})</span>
                                                                {{ activeQuestion.question }}
                                                            </div>
                                                        </v-col>
                                                        <v-col 
                                                            cols="12">
                                                                <v-checkbox 
                                                                    v-for="(option, index) in activeQuestion.options"
                                                                    :key="`answer-${index}`"
                                                                    :value="option"
                                                                    :disabled="isShowingAnswersWithExplanation"
                                                                    v-model="answers">
                                                                        <template v-slot:label>
                                                                            <div>
                                                                                <div class="text-h5 primary--text">{{ option }}</div>
                                                                            </div>
                                                                        </template>
                                                                </v-checkbox>
                                                        </v-col>
                                                        <v-col v-if="!isShowingAnswersWithExplanation" cols="12">
                                                            <v-btn 
                                                                type="submit" 
                                                                color="primary" 
                                                                x-large>
                                                                    Answer
                                                            </v-btn>
                                                        </v-col>
                                                    </v-row>
                                                </v-form>
                                            </v-col>
                                            <v-col cols="12" md="3" class="d-flex" style="align-items:center;justify-content:center;">
                                                <v-progress-circular 
                                                    color="red darken-1" 
                                                    :size="250" 
                                                    :width="10"
                                                    :rotate="-90"
                                                    :value="(questionTimer.secondsRemaining / activeQuestion.durationInSeconds * 100)">
                                                        <div class="text-h3">
                                                            {{ questionTimer.secondsRemaining }}
                                                        </div>
                                                </v-progress-circular>
                                            </v-col>
                                        </v-row>
                                        
                                        <v-divider v-if="isShowingAnswersWithExplanation"/>

                                        <div v-if="isShowingAnswersWithExplanation">
                                            <v-row>
                                                <v-col 
                                                    cols="12" 
                                                    md="3">
                                                        <template v-if="questionAnswered">
                                                            <v-sheet 
                                                                class="pa-6" 
                                                                v-if="answersAreCorrect" 
                                                                color="green lighten-5"
                                                                style="display:flex;flex-direction:column;align-items:center;">
                                                                    <v-avatar color="white" size="120">
                                                                        <v-icon
                                                                            dark
                                                                            color="green darken-1" 
                                                                            size="120">
                                                                                mdi-check-circle-outline
                                                                        </v-icon>
                                                                    </v-avatar>
                                                                    <div class="text-h6 pt-2 green--text text--darken-1">Correct!</div>
                                                            </v-sheet>
                                                            <v-sheet 
                                                                class="pa-6" 
                                                                v-else
                                                                color="red lighten-5"
                                                                style="display:flex;flex-direction:column;align-items:center;">
                                                                    <v-avatar color="white" size="120">
                                                                        <v-icon
                                                                            dark
                                                                            color="red darken-1" 
                                                                            size="120">
                                                                                mdi-close-circle-outline
                                                                        </v-icon>
                                                                    </v-avatar>
                                                                    <div class="text-h6 pt-2 red--text text--darken-1">Wrong!</div>
                                                            </v-sheet>
                                                        </template>
                                                        <template v-else>
                                                            <v-sheet 
                                                                class="pa-6"
                                                                color="blue-grey lighten-5"
                                                                style="display:flex;flex-direction:column;align-items:center;">
                                                                    <v-avatar color="white" size="120">
                                                                        <v-icon
                                                                            dark
                                                                            color="blue-grey darken-1" 
                                                                            size="120">
                                                                                mdi-alarm
                                                                        </v-icon>
                                                                    </v-avatar>
                                                                    <div class="text-h6 pt-2 blue-grey--text text--darken-1">Time's Up!</div>
                                                            </v-sheet>
                                                        </template>
                                                </v-col>
                                                <v-col cols="12" md="9">
                                                    <div class="px-6">
                                                        <v-row>
                                                            <v-col cols="12">
                                                                <div class="pb-4">
                                                                    <div class="text-h4 secondary--text pb-3">Correct Answer:</div>
                                                                    <div class="text-h5 primary--text">
                                                                        <ul>
                                                                            <li class="pb-2" v-for="(answer, index) in activeQuestion.answers" :key="`answer-${index}`">
                                                                                {{ answer }}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </v-col>
                                                            <v-col cols="12">
                                                                <div class="pb-4">
                                                                    <div class="text-h4 secondary--text pb-3">Explanation:</div>
                                                                    <div class="text-h5 primary--text">{{ activeQuestion.explanation }}</div>
                                                                </div>
                                                            </v-col>
                                                            <v-col cols="12">
                                                                <div class="pb-4">
                                                                    <v-btn 
                                                                        x-large 
                                                                        color="primary" 
                                                                        @click="advance()">
                                                                            Next
                                                                    </v-btn>
                                                                </div>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </template>
                                </div>
                            </template>
                            <template v-else>
                                <v-progress-linear
                                    color="teal lighten-2"
                                    :value="activeLessonProgressPercentage"/>

                                <div 
                                    v-if="activeLesson.contentType === 'html'" 
                                    class="pa-6 text-h4 primary--text" 
                                    style="line-height:3rem;"
                                    v-html="activeLesson.content.html"/>

                                <video 
                                    v-if="activeLesson.contentType === 'video'" 
                                    controls 
                                    :src="activeLesson.content.video.src" 
                                    width="100%" 
                                    height="100%"
                                    style="background-color:black"
                                    ref="video"/>
                            </template>
                    </v-sheet>
            </v-container>

            <notification/>
        </v-main>

        <v-navigation-drawer
            app
            right
            clipped
            width="380">
                <v-sheet dark color="background" class="textured-background px-4 py-6">
                    <div class="text-h6">{{ course.name }}</div>
                </v-sheet>
                <v-divider dark/>
                <v-expansion-panels
                    :value="modulesInView"
                    dark
                    accordion
                    focusable
                    multiple>
                        <v-expansion-panel
                            v-for="(courseModule, index) in course.modules" 
                            :key="`module-${index}`"
                            :readonly="courseModule.isActive">
                                <v-expansion-panel-header 
                                    color="primary" 
                                    class="py-1 px-4"
                                    :hide-actions="courseModule.isActive">
                                        <v-row 
                                            align="center">
                                                <v-col cols="2">
                                                    <v-progress-circular 
                                                        :value="courseModule.percentageCompleted"
                                                        :rotate="-90"
                                                        color="teal lighten-2">
                                                            <span class="white--text">{{ index + 1 }}</span>
                                                    </v-progress-circular>
                                                </v-col>
                                                <v-col cols="10">
                                                    <div class="text-body-1">{{ courseModule.name }}</div>
                                                    <div>
                                                        <v-icon small>mdi-timer</v-icon> 
                                                        <small class="pl-1">
                                                            {{ computeCourseModuleDurationInSeconds(courseModule) | toTimer }}
                                                        </small>
                                                    </div>
                                                </v-col>
                                        </v-row>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content
                                        color="primary" 
                                        class="curriculum-wrapper">
                                            <v-list 
                                                color="primary" 
                                                dense
                                                class="pl-2">
                                                    <template 
                                                        v-for="(lesson, index) in courseModule.lessons">
                                                            <v-list-item 
                                                                color="teal lighten-2"
                                                                style="cursor: pointer;"
                                                                :style="{ 'pointer-events': canTakeLesson(lesson) ? 'initial' : 'none' }"
                                                                :key="`lesson-${index}`"
                                                                :input-value="activeLesson && (activeLesson.title === lesson.title)"
                                                                @click="setActiveModule(getLessonModule(lesson)); setActiveLesson(lesson);"
                                                                inactive>
                                                                    <v-row 
                                                                        align="center" 
                                                                        class="text-caption">
                                                                            <v-col cols="1">
                                                                                <v-icon
                                                                                    :color="!lesson.isCompleted ? 'grey' : 'teal lighten-2'"
                                                                                    small>
                                                                                        mdi-check-circle
                                                                                </v-icon>
                                                                            </v-col>
                                                                            <v-col cols="1">
                                                                                <v-icon small>{{ lessonContentIcons[lesson.contentType] }}</v-icon>
                                                                            </v-col>
                                                                            <v-col cols="7">
                                                                                <div>{{ lesson.title }}</div>
                                                                            </v-col>
                                                                            <v-col cols="3">
                                                                                <div class="text-right">{{ lesson.durationInSeconds | toTimer }}</div>
                                                                            </v-col>
                                                                    </v-row>
                                                            </v-list-item>
                                                            <v-divider :key="`section-divider-${index}`"/>
                                                    </template>
                                            </v-list>
                                </v-expansion-panel-content>
                        </v-expansion-panel>
                </v-expansion-panels>
        </v-navigation-drawer>

        <v-footer app inset color="white" style="border-top: thin solid rgba(0, 0, 0, 0.12) !important;">
            <div class="text-caption">&#169;{{ year }} {{ settings.business.legalName }} All rights reserved.</div>
        </v-footer>

        <v-dialog
            v-model="isShowingCourseCompleteDialog"
            max-width="600">
                <v-sheet color="white" class="pa-12" rounded>
                    <div class="d-flex pb-8" style="justify-content:center;">
                        <img src="@/assets/dance.svg" width="120" height="60"/>
                        <img src="@/assets/confetti.svg" width="120" height="120"/>
                        <img src="@/assets/dance.svg" width="120" height="60"/>
                    </div>
                    <div class="secondary--text text-center">
                        <div class="text-h3 pb-1">Cheers!</div>
                        <div class="text-overline">You've Successfully Completed The Course</div>
                        <v-btn 
                            color="primary" 
                            class="mt-6" 
                            to="/">
                                Take Another Course
                        </v-btn>
                    </div>
                </v-sheet>
        </v-dialog>

        <v-dialog
            v-model="accessBlocked"
            max-width="600"
            persistent>
                <v-sheet color="white" class="pa-12" rounded>
                    <div class="secondary--text text-center">
                        <div class="text-h5">You Do Not Have Access To This Course</div>
                        <v-btn 
                            color="primary" 
                            class="mt-6" 
                            to="/">
                                Return Home
                        </v-btn>
                    </div>
                </v-sheet>
        </v-dialog>

        <v-dialog
            v-model="isShowingMustWatchVideoPrompt"
            max-width="600">
                <v-sheet color="white" class="pa-12" rounded>
                    <div class="secondary--text text-center">
                        <div class="text-h5">
                            Kindly spend a minimum of {{ this.activeLesson.durationInSeconds }}s 
                            on this lesson to advance to the next.
                        </div>
                    </div>
                </v-sheet>
        </v-dialog>

        <v-dialog
            v-model="isShowingAskAQuestionDialog"
            max-width="600"
            persistent>
                <v-card>
                    <v-form @submit.prevent="askAQuestion()" ref="askAQuestionForm">
                        <v-card-title>
                            <span class="headline primary--text">Ask A Question</span>
                            <v-spacer/>
                            <v-btn @click="isShowingAskAQuestionDialog = !isShowingAskAQuestionDialog" color="primary" icon small>
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-input
                                        v-model="askedQuestion.body"
                                        :rules="[required]"
                                        required>
                                            <quill-editor 
                                                v-model="askedQuestion.body"
                                                :options="quillConfig"
                                                style="width:100%"/>
                                    </v-input>
                                </v-col>
                                <v-col cols="12">
                                    <v-checkbox
                                        v-model="askedQuestion.referencesActiveLesson"
                                        label="Reference current lesson"/>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer/>
                            <v-btn 
                                color="primary" 
                                type="submit" 
                                dark 
                                :loading="isAskingAQuestion">
                                    Ask Question
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

    import Notification from '@/components/Notification.vue';
    import validators from '@/mixins/validators';

    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import { quillEditor } from 'vue-quill-editor';

    import { mapState } from 'vuex';
    import { cloneDeep } from 'lodash';

    const init = {
        course: {
            name: '',
            description: '',
            overview: '',
            thumbnail: null,
            modules: [],
        },
        lesson: {
            title: '',
            durationInSeconds: null,
            contentType: '',
            content: null,
        },
        module: {
            name: '',
            lessons: [],
            canBePreviewed: false,
        },
        question: {
            question: '',
            options: [],
            answers: [],
            explanation: '',
            durationInSeconds: null,
        },
        timer: {
            id: null,
            callbackFunction: null,
            secondsRemaining: 0,
        },
        playingVideo: {
            currentTime: 0,
            watchedTime: 0,
            lastUpdated: 'currentTime',
        },
        askedQuestion: {
            body: '',
            referencesActiveLesson: true,
        }
    };

    export default {
        name: 'Course',
        mixins: [validators],
        components: {
            quillEditor,
            Notification
        },
        data() {
            return {
                lessonContentIcons: {
                    html: 'mdi-file-document',
                    video: 'mdi-video',
                    questions: 'mdi-help-circle',
                },
                course: cloneDeep(init.course),
                activeModule: cloneDeep(init.module),
                activeLesson: cloneDeep(init.lesson),
                activeQuestion: cloneDeep(init.question),
                answers: [],
                isShowingAnswersWithExplanation: false,
                isShowingCourseCompleteDialog: false,
                modulesInView: [0],
                lessonTimer: cloneDeep(init.timer),
                questionTimer: cloneDeep(init.timer),
                playingVideo: cloneDeep(init.playingVideo),
                isShowingMustWatchVideoPrompt: false,
                isShowingAskAQuestionDialog: false,
                isAskingAQuestion: false,
                askedQuestion: cloneDeep(init.askedQuestion),
                quillConfig: {
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],

                            [{ 'align' : null },{ 'align': 'right' },{ 'align': 'center' },{ 'align': 'justify' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],

                            [{ 'color': [] }, { 'background': [] }],

                            ['blockquote','link'],

                            ['image','video'],

                            ['clean'],
                        ]
                    },
                },
            };
        },
        computed: {
            ...mapState([
                'employee',
                'settings',
            ]),
            ...mapState([
                'company',
            ]),
            questionAnswered() {
                return this.answers.length > 0;
            },
            answersAreCorrect() {
                return Array.equalElements(this.activeQuestion.answers, this.answers);
            },
            percentageQuestionsAnswered() {
                if (this.activeLesson.contentType === 'questions') {
                    const questions = this.activeLesson.content.questions;

                    return ((questions.indexOf(this.activeQuestion) + 1) / questions.length) * 100;
                }

                return null;
            },
            accessBlocked() {
                if (this.company.accessToCoursesBlockedAt) {
                    return true;
                }

                if (this.company.plan.courses.every(course => typeof course !== 'string')) {
                    if (this.company.plan.courses.length > 0) {
                        const courseId = this.$route.params.courseId;

                        const courseIds = this.company.plan.courses.map(course => {
                            return course.id;
                        });

                        return (!courseIds.includes(courseId));
                    }
                }

                return false;
            },
            activeLessonIsSet() {
                return (JSON.stringify(this.activeLesson) !== JSON.stringify(init.lesson));
            },
            courseIsSet() {
                return (JSON.stringify(this.course) !== JSON.stringify(init.course));
            },
            year() {
                return new Date().getFullYear();
            },
            activeLessonProgressPercentage() {
                return 100 - (this.lessonTimer.secondsRemaining / this.activeLesson.durationInSeconds * 100);
            },
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
            initialized() {
                return this.course.id && this.employee.id;
            },
            aDialogIsOpen() {
                return this.isShowingCourseCompleteDialog
                    || this.isShowingMustWatchVideoPrompt
                    || this.isShowingAskAQuestionDialog;
            }
        },
        watch: {
            accessBlocked: {
                immediate: true,
                handler(accessBlocked) {
                    if (accessBlocked) {
                        this.$watch('lessonTimer', lessonTimer => {
                            if (lessonTimer.id) {
                                this.stopCourse();
                            }
                        }, { deep: true });

                        this.$watch('questionTimer', questionTimer => {
                            if (questionTimer.id) {
                                this.stopCourse();
                            }
                        }, { deep: true });
                    }
                }
            },
            aDialogIsOpen: {
                handler(aDialogIsOpen) {
                    if (aDialogIsOpen) {
                        this.pauseActiveLesson();
                    }
                    else {
                        this.resumeActiveLesson();
                    }
                }
            },
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
            markActiveLessonCompleted() {
                const activeModuleIndex = this.course.modules.indexOf(this.activeModule);
                const activeLessonIndex = this.course.modules[activeModuleIndex].lessons.indexOf(this.activeLesson);
                
                const lesson = this.course.modules[activeModuleIndex].lessons[activeLessonIndex];

                this.$set(lesson, 'isCompleted', true);

                this.addEmployeeCompletedLesson(this.activeLesson);
            },
            advance() {
                const advanceToNextLesson = () => {
                    this.markActiveLessonCompleted();

                    const activeLessonIndex = this.activeModule.lessons.indexOf(this.activeLesson);

                    if (activeLessonIndex < (this.activeModule.lessons.length - 1)) {
                        const lesson = this.activeModule.lessons[activeLessonIndex + 1];

                        this.setActiveLesson(lesson);
                    }
                    
                    if (activeLessonIndex === (this.activeModule.lessons.length - 1)) {
                        const activeModuleIndex = this.course.modules.indexOf(this.activeModule);

                        if (activeModuleIndex < (this.course.modules.length - 1)) {
                            const courseModuleIndex = activeModuleIndex + 1;

                            const courseModule = this.course.modules[courseModuleIndex];
                            this.setActiveModule(courseModule);

                            const lesson = courseModule.lessons[0];
                            this.setActiveLesson(lesson);
                        }

                        if (activeModuleIndex === (this.course.modules.length - 1)) {
                            this.isShowingCourseCompleteDialog = true;
                        }
                    }
                };

                if (this.activeLesson.contentType === 'video' || this.activeLesson.contentType === 'html') {
                    advanceToNextLesson();

                    return;
                }
                
                if (this.activeLesson.contentType === 'questions') {
                    const activeQuestionIndex = this.activeLesson.content.questions.indexOf(this.activeQuestion);

                    if (activeQuestionIndex < (this.activeLesson.content.questions.length - 1)) {
                        const question = this.activeLesson.content.questions[activeQuestionIndex + 1];

                        this.setActiveQuestion(question);

                        return;
                    }

                    if (activeQuestionIndex === (this.activeLesson.content.questions.length - 1)) {
                        advanceToNextLesson();

                        return;
                    }
                }
            },
            async addEmployeeCompletedLesson(lesson) {
                try {
                    const lessonModule = this.getLessonModule(lesson);

                    const completedLesson = { 
                        courseId: this.course.id, 
                        moduleName: lessonModule.name,
                        lessonTitle: lesson.title, 
                    };

                    const addEmployeeCompletedLesson = firebase.functions()
                                                                .httpsCallable('addEmployeeCompletedLesson');

                    await addEmployeeCompletedLesson({ completedLesson });
                } 
                catch (error) {
                    this.addEmployeeCompletedLesson(lesson);
                }
            },
            setActiveQuestion(question) {
                this.activeQuestion = question;

                this.answers = [];
                this.isShowingAnswersWithExplanation = false;
                this.clearTimer('questionTimer');

                if (question) {
                    this.setTimer(
                        'questionTimer',
                        question.durationInSeconds,
                        this.answerQuestion
                    );
                }
            },
            setActiveLesson(lesson) {
                this.clearTimer('lessonTimer');
                this.setActiveQuestion(init.question);
                this.playingVideo = init.playingVideo;
                
                this.activeLesson = lesson;

                if (lesson.contentType === 'html') {
                    this.setTimer(
                        'lessonTimer',
                        lesson.durationInSeconds,
                        this.advance
                    );
                }

                if (lesson.contentType === 'video') {
                    this.setTimer(
                        'lessonTimer',
                        lesson.durationInSeconds,
                        this.markActiveLessonCompleted
                    );

                    this.pauseTimer('lessonTimer');

                    this.$nextTick(this.configureVideoPlayer);
                }

                if (lesson.contentType === 'questions') {
                    this.setActiveQuestion(lesson.content.questions[0]);
                }
            },
            setActiveModule(courseModule) {
                this.activeModule = courseModule;

                this.course.modules.forEach(iModule => {
                    if (iModule.name === courseModule.name) {
                        this.$set(iModule, 'isActive', true);
                    } else {
                        this.$set(iModule, 'isActive', false);
                    }
                });

                const courseModuleIndex = this.course.modules.indexOf(courseModule);
                            
                this.modulesInView = [courseModuleIndex];
            },
            getLessonModule(lesson) {
                return this.course.modules.find(courseModule => {
                    return courseModule.lessons.includes(lesson);
                });
            },
            answerQuestion() {
                this.pauseTimer('questionTimer');

                this.isShowingAnswersWithExplanation = true;
            },
            computeCourseModuleDurationInSeconds(courseModule) {
                const durationInSeconds = (courseModule.lessons.reduce((total, currentModule) => {
                                            return total + currentModule.durationInSeconds;
                                        }, 0));

                return durationInSeconds;
            },
            stopCourse() {
                this.clearTimer('lessonTimer');
                this.clearTimer('questionTimer');
            },
            setTimer(timerId, durationInSeconds, callbackFunction = null) {
                this.clearTimer(timerId);

                let timer = this[timerId];

                timer.callbackFunction = callbackFunction;

                timer.secondsRemaining = durationInSeconds;

                timer.id = setInterval(() => {
                    if (timer.secondsRemaining > 0) {
                        timer.secondsRemaining--;
                    } else {
                        clearInterval(timer.id);

                        if (callbackFunction) {
                            callbackFunction();
                        }
                    }
                }, 1000);
            },
            pauseTimer(timerId) {
                let timer = this[timerId];

                if (timer.id) {
                    clearInterval(timer.id);
                    timer.id = null;
                }
            },
            resumeTimer(timerId) {
                let timer = this[timerId];

                if ((timer.id === null) && (timer.secondsRemaining > 0)) {
                    timer.id = setInterval(() => {
                        if (timer.secondsRemaining > 0) {
                            timer.secondsRemaining--;
                        } else {
                            clearInterval(timer.id);

                            if (timer.callbackFunction) {
                                timer.callbackFunction();
                            }
                        }
                    }, 1000);
                }
            },
            clearTimer(timerId) {
                let timer = this[timerId];

                if (timer.id) {
                    clearInterval(timer.id);
                }

                timer = cloneDeep(init.timer);
            },
            configureVideoPlayer() {
                const video = this.$refs.video;

                video.addEventListener('playing', () => {
                    if (this.activeLesson.contentType === 'video') {
                        this.resumeTimer('lessonTimer');
                    }
                });

                video.addEventListener('stalled', () => {
                    if (this.activeLesson.contentType === 'video') {
                        this.pauseTimer('lessonTimer');
                    }
                });

                video.addEventListener('pause', () => {
                    if (this.activeLesson.contentType === 'video') {
                        this.pauseTimer('lessonTimer');
                    }
                });

                video.addEventListener('ended', () => {
                    if (this.activeLesson.contentType === 'video') {
                        if ((this.lessonTimer.secondsRemaining === 0) || this.activeLesson.isCompleted) {
                            this.advance();
                        }
                        else {
                            this.isShowingMustWatchVideoPrompt = true;
                        }
                    }
                });
            },
            ensureLessonsAreTaken() {
                let hidden, visibilityChange;

                if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                    hidden = "hidden";
                    visibilityChange = "visibilitychange";
                } 
                else if (typeof document.msHidden !== "undefined") {
                    hidden = "msHidden";
                    visibilityChange = "msvisibilitychange";
                } 
                else if (typeof document.webkitHidden !== "undefined") {
                    hidden = "webkitHidden";
                    visibilityChange = "webkitvisibilitychange";
                }

                const isVisibleHandler = () => {
                    if (this.courseIsSet) {
                        this.resumeActiveLesson();
                    }
                };

                const isHiddenHandler = () => {
                    this.pauseActiveLesson();
                };

                document.addEventListener(visibilityChange, () => {
                    if (document[hidden]) {
                        isHiddenHandler();
                    }
                    else {
                        isVisibleHandler();
                    }
                }, false);

                document.addEventListener('focus', () => {
                    isVisibleHandler();
                }, false);

                document.addEventListener('blur', () => {
                    isHiddenHandler();
                }, false);
            },
            pauseActiveLesson() {
                if (this.activeLessonIsSet) {
                    if (this.activeLesson.contentType === 'video') {
                        const video = this.$refs.video;

                        if (video) {
                            video.pause();
                        }
                    }

                    if (this.activeLesson.contentType === 'html') {
                        this.pauseTimer('lessonTimer');
                    }
                }
            },
            resumeActiveLesson() {
                if (this.activeLessonIsSet && !this.aDialogIsOpen) {
                    if (this.activeLesson.contentType === 'html') {
                        this.resumeTimer('lessonTimer');
                    }
                }
            },
            canTakeLesson(lesson) {
                if (lesson.isCompleted) {
                    return true;
                }

                const lessonModule = this.getLessonModule(lesson);

                const lessonIndex = lessonModule.lessons.indexOf(lesson);

                const previousLesson = lessonModule.lessons[lessonIndex - 1];

                if (previousLesson && previousLesson.isCompleted) {
                    return true;
                }

                return false;
            },
            async askAQuestion() {
                if (!this.$refs.askAQuestionForm.validate()) {
                    return;
                }

                this.isAskingAQuestion = true;

                const askedQuestionData = {
                    body: this.askedQuestion.body,
                    referencedLesson: this.askedQuestion.referencesActiveLesson 
                        ? `${this.activeLesson.title} | ${this.activeModule.name} ! ${this.course.name}`
                        : null,
                };
                
                try {
                    const addEmployeeAskedQuestion = firebase.functions()
                                                    .httpsCallable('addEmployeeAskedQuestion');

                    await addEmployeeAskedQuestion({ askedQuestionData });

                    const notification = {
                        message: 'Question submission successful',
                        context: 'success',
                    };

                    this.$store.commit('push_notification', { notification });
                    
                    this.askedQuestion = cloneDeep(init.askedQuestion);
                    this.$refs.askAQuestionForm.resetValidation();
                    this.isShowingAskAQuestionDialog = false;
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }

                this.isAskingAQuestion = false;
            }
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
        mounted() {
            const courseId = this.$route.params.courseId;

            this.$bind('course', firebase.firestore().doc(`courses/${courseId}`), { wait: true })
                .then(() => {
                    const activeLesson = this.course.modules[0]?.lessons[0];

                    if (activeLesson && (typeof activeLesson.content !== 'string')) {
                        const activeModule = this.getLessonModule(activeLesson);

                        this.setActiveModule(activeModule);
                        this.setActiveLesson(activeLesson);
                    }
                    
                    this.ensureLessonsAreTaken();
                });

            const unwatch = this.$watch('initialized', initialized => {
                if (initialized) {
                    this.setLearningHistory();

                    unwatch();
                }
            });
        },
        beforeRouteLeave(to, from, next) {
            this.stopCourse();

            next();
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
    }
</script>

<style lang="scss">
    .curriculum-wrapper>.v-expansion-panel-content__wrap {
        padding: 0 !important;
    }
</style>

<style scoped>
    .v-list {
        padding: 0;
    }
</style>
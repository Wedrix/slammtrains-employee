<template>
    <v-app>
        <v-app-bar app flat color="white" style="border-bottom: thin solid rgba(0, 0, 0, 0.12) !important">
            <v-btn 
                icon 
                to="/"
                class="mx-4"
                color="secondary">
                    <v-icon size="30">mdi-home-variant</v-icon>
            </v-btn>
            <div class="text-h5 primary--text">{{ activeLesson.title }}</div>
            <v-spacer/>
            <v-progress-circular v-if="activeLesson && (activeLesson.contentType === 'html')" 
                color="secondary"
                class="mx-4"
                :size="50"
                :rotate="-90"
                :value="(lessonTimer.secondsRemaining / activeLesson.durationInSeconds * 100)">
                    <div class="text-caption primary--text">
                        {{ lessonTimer.secondsRemaining | toTimer }}
                    </div>
            </v-progress-circular>
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

                            <template 
                                v-if="activeLesson.contentType === 'questions'">
                                    <v-progress-linear
                                        color="secondary"
                                        :height="6"
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
                    </v-sheet>
            </v-container>

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
        </v-main>

        <v-navigation-drawer
            app
            right
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
                                                        color="secondary">
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
                                                                color="secondary"
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
                                                                                    :color="!lesson.isCompleted ? 'grey' : 'secondary'"
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
    </v-app>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

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
            secondsRemainingTimerId: null,
        },
        playingVideo: {
            currentTime: 0,
            watchedTime: 0,
            lastUpdated: 'currentTime',
        }
    };

    export default {
        name: 'Course',
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
            courseIsSet() {
                return (this.course && (JSON.stringify(this.course) !== JSON.stringify(init.course)));
            },
            year() {
                return new Date().getFullYear();
            }
        },
        watch: {
            employee: {
                deep: true,
                handler() {
                    this.setLearningHistory();
                },
            },
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
            advance() {
                const markActiveLessonCompleted = () => {
                    const activeModuleIndex = this.course.modules.indexOf(this.activeModule);
                    const activeLessonIndex = this.course.modules[activeModuleIndex].lessons.indexOf(this.activeLesson);
                    
                    const lesson = this.course.modules[activeModuleIndex].lessons[activeLessonIndex];

                    this.$set(lesson, 'isCompleted', true);

                    this.addEmployeeCompletedLesson(this.activeLesson);
                };

                const advanceToNextLesson = () => {
                    markActiveLessonCompleted();

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
                
                this.activeLesson = lesson;

                if (lesson.contentType === 'html') {
                    this.setTimer(
                        'lessonTimer',
                        lesson.durationInSeconds,
                        this.advance
                    );
                }

                if (lesson.contentType === 'video') {
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

                timer.secondsRemaining = durationInSeconds;

                timer.secondsRemainingTimerId = setInterval(() => {
                    if (timer.secondsRemaining > 0) {
                        timer.secondsRemaining--;
                    } else {
                        clearInterval(timer.secondsRemainingTimerId);
                    }
                }, 1000);

                if (callbackFunction) {
                    timer.callbackFunction = callbackFunction;

                    timer.id = setTimeout(() => {
                        timer.callbackFunction();
                    }, (durationInSeconds * 1000));
                }
            },
            pauseTimer(timerId) {
                let timer = this[timerId];

                if (timer.id) {
                    clearTimeout(timer.id);
                    timer.id = null;
                    
                    clearInterval(timer.secondsRemainingTimerId);
                    timer.secondsRemainingTimerId = null;
                }
            },
            resumeTimer(timerId) {
                let timer = this[timerId];

                if ((timer.id === null) && (timer.secondsRemaining > 0)) {
                    timer.secondsRemainingTimerId = setInterval(() => {
                        if (timer.secondsRemaining > 0) {
                            timer.secondsRemaining--;
                        } else {
                            clearInterval(timer.secondsRemainingTimerId);
                        }
                    }, 1000);

                    if (timer.callbackFunction) {
                        timer.id = setTimeout(() => {
                            timer.callbackFunction();
                        }, (timer.secondsRemaining * 1000));
                    }
                }
            },
            clearTimer(timerId) {
                let timer = this[timerId];

                if (timer.id) {
                    clearTimeout(timer.id);
                }

                if (timer.secondsRemainingTimerId) {
                    clearInterval(timer.secondsRemainingTimerId);
                }

                timer = cloneDeep(init.timer);
            },
            configureVideoPlayer() {
                this.playingVideo = cloneDeep(init.playingVideo);

                const video = this.$refs.video;

                video.addEventListener('timeupdate', () => {
                    if (!video.seeking) {
                        if (video.currentTime > this.playingVideo.watchedTime) {
                            this.playingVideo.watchedTime = video.currentTime;
                            this.playingVideo.lastUpdated = 'watchedTime';
                        }
                        else {
                            this.playingVideo.currentTime = video.currentTime;
                            this.playingVideo.lastUpdated = 'currentTime';
                        }
                    }
                });

                video.addEventListener('seeking', () => {
                    const delta = video.currentTime - this.playingVideo[this.playingVideo.lastUpdated];

                    if (delta > 0) {
                        video.pause();

                        video.currentTime = this.playingVideo[this.playingVideo.lastUpdated];
                        
                        video.play();
                    }
                });

                video.addEventListener('ended', () => {
                    this.playingVideo = cloneDeep(init.playingVideo);

                    this.advance();
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
                        if (this.activeLesson.contentType === 'html') {
                            this.resumeTimer('lessonTimer');
                        }
                    }
                };

                const isHiddenHandler = () => {
                    if (this.activeLesson.contentType === 'video') {
                        const video = this.$refs.video;

                        if (video) {
                            video.pause();
                        }
                    }

                    if (this.activeLesson.contentType === 'html') {
                        this.pauseTimer('lessonTimer');
                    }
                };

                document.addEventListener(visibilityChange, () => {
                    if (document[hidden]) {
                        isHiddenHandler();
                    }
                    else {
                        isVisibleHandler();
                    }
                }, false);

                window.addEventListener('focus', () => {
                    isVisibleHandler();
                }, false);

                window.addEventListener('blur', () => {
                    isHiddenHandler();
                }, false);
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
        },
        mounted() {
            const unwatch = this.$watch('course', course => {
                const activeLesson = course.modules[0]?.lessons[0];

                if (activeLesson && (typeof activeLesson.content !== 'string')) {
                    this.setLearningHistory();

                    const activeModule = this.getLessonModule(activeLesson);

                    this.setActiveModule(activeModule);
                    this.setActiveLesson(activeLesson);

                    unwatch();
                }
                
                this.ensureLessonsAreTaken();

            }, { deep: true, immediate: true });

            const courseId = this.$route.params.courseId;

            this.$bind('course', firebase.firestore().doc(`courses/${courseId}`), { wait: true });
        },
        created() {
            this.$store.dispatch('initializeSettings');
        },
        beforeRouteLeave(to, from, next) {
            this.stopCourse();

            next();
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
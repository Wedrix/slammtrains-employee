<template>
    <v-app>
        <v-app-bar app flat dark color="background" class="textured-background" style="border-bottom: thin solid rgba(0, 0, 0, 0.12) !important">
            <div class="text-h5">
                <span v-if="test">{{ `Test: ${activeModule.name}` }}</span>
                <span v-if="activeLesson">{{ activeLesson.title }}</span>
            </div>
            <v-spacer/>
            <v-progress-circular v-if="activeLesson && (activeLesson.contentType === 'html')" 
                color="amber darken-1"
                :size="50"
                :rotate="-90"
                :value="(lessonTimer.secondsRemaining / computeLessonDurationInSeconds(activeLesson) * 100)">
                    <div class="text-caption white--text">
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
                            <template v-if="test">
                                <v-progress-linear
                                    color="secondary"
                                    :height="6"
                                    :value="testProgress"/>

                                <div class="py-6 px-12">
                                    <template v-if="activeQuestion">
                                        <v-row>
                                            <v-col cols="12" md="9">
                                                <v-form ref="questionForm" @submit.prevent="answerQuestion()">
                                                    <v-row>
                                                        <v-col cols="12">
                                                            <div class="text-h4 secondary--text">
                                                                <span>(Qn.{{ test.questions.indexOf(activeQuestion) + 1 }})</span>
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
                                                                class="mr-4" 
                                                                color="primary" 
                                                                outlined 
                                                                x-large 
                                                                @click="testResult.skippedCount++; advance()">
                                                                    Skip
                                                            </v-btn>
                                                            
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

                                    <template v-if="testIsCompleted">
                                        <v-row>
                                            <v-col cols="12">
                                                <div class="text-h3 primary--text">Test Results</div>
                                            </v-col>
                                            <v-col cols="12" md="6"
                                                class="d-flex" 
                                                style="justify-content:center;align-items:center;">
                                                    <v-progress-circular 
                                                        :color="
                                                            (testScore > 30 && testScore <= 70) 
                                                                ? 'accent2' 
                                                                : ((testScore > 70 && testScore <= 100) 
                                                                    ? 'secondary' 
                                                                    : 'accent')" 
                                                        :size="450" 
                                                        :width="10"
                                                        :rotate="-90"
                                                        :value="testScore">
                                                            <div class="text-h3">
                                                                {{ testScore }}%
                                                            </div>
                                                    </v-progress-circular>
                                            </v-col>
                                            <v-col cols="12" md="5">
                                                <v-row align="center">
                                                    <v-col cols="12" md="6">
                                                        <v-sheet 
                                                            class="pa-12" 
                                                            style="display:flex;flex-direction:column;justify-content:center;align-items:center;" 
                                                            color="green darken-2" 
                                                            rounded>
                                                                <div class="white--text text-h3">{{ testResult.correctCount }}</div>
                                                                <div class="white--text text-h5">Correct</div>
                                                        </v-sheet>
                                                    </v-col>
                                                    <v-col cols="12" md="6">
                                                        <v-sheet 
                                                            class="pa-12" 
                                                            style="display:flex;flex-direction:column;justify-content:center;align-items:center;" 
                                                            color="blue darken-2" 
                                                            rounded>
                                                                <div class="white--text text-h3">{{ testResult.skippedCount }}</div>
                                                                <div class="white--text text-h5">Skipped</div>
                                                        </v-sheet>
                                                    </v-col>
                                                    <v-col cols="12" md="6">
                                                        <v-sheet 
                                                            class="pa-12" 
                                                            style="display:flex;flex-direction:column;justify-content:center;align-items:center;" 
                                                            color="red darken-2" 
                                                            rounded>
                                                                <div class="white--text text-h3">{{ testResult.incorrectCount }}</div>
                                                                <div class="white--text text-h5">Incorrect</div>
                                                        </v-sheet>
                                                    </v-col>
                                                    <v-col cols="12" md="6">
                                                        <v-sheet 
                                                            class="pa-12" 
                                                            style="display:flex;flex-direction:column;justify-content:center;align-items:center;" 
                                                            color="purple darken-2" 
                                                            rounded>
                                                                <div class="white--text text-h3">{{ testResult.missedCount }}</div>
                                                                <div class="white--text text-h5">Missed</div>
                                                        </v-sheet>
                                                    </v-col>
                                                    <v-col cols="12" class="pt-4">
                                                        <v-btn 
                                                            @click="advance()" 
                                                            color="primary"
                                                            class="mb-4"
                                                            block
                                                            x-large>
                                                                Next Module
                                                        </v-btn>
                                                        <v-btn 
                                                            @click="retakeTest()"
                                                            color="primary"
                                                            outlined
                                                            block
                                                            x-large>
                                                                <v-icon class="mr-2">mdi-redo</v-icon>
                                                                Retake
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                    </template>
                                </div>
                            </template>

                            <template v-if="activeLesson">
                                <div 
                                    v-if="activeLesson.contentType === 'html'" 
                                    class="pa-6 text-h4 primary--text" 
                                    style="line-height:3rem;"
                                    v-html="activeLesson.html"/>

                                <video 
                                    v-if="activeLesson.contentType === 'video'" 
                                    controls 
                                    :src="activeLesson.video.src" 
                                    width="100%" 
                                    height="100%"
                                    style="background-color:black"
                                    ref="video"/>
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
                v-model="isShowingMustCompleteModuleDialog"
                max-width="600">
                    <v-sheet color="white" class="pa-12" rounded>
                        <div class="secondary--text text-center">
                            <div class="text-h5">Kindly complete the lessons in the module to take the test.</div>
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
                                                        color="amber darken-1">
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
                                                                color="amber darken-1"
                                                                style="cursor: pointer;"
                                                                :key="`lesson-${index}`"
                                                                :input-value="!test && activeLesson && (activeLesson.title === lesson.title)"
                                                                @click="setActiveLesson(lesson)"
                                                                inactive>
                                                                    <v-row 
                                                                        align="center" 
                                                                        class="text-caption">
                                                                            <v-col cols="1">
                                                                                <v-icon
                                                                                    :color="!lesson.isCompleted ? 'grey' : 'amber darken-1'"
                                                                                    small>mdi-check-circle</v-icon>
                                                                            </v-col>
                                                                            <v-col cols="1">
                                                                                <v-icon 
                                                                                    v-if="lesson.contentType === 'video'"
                                                                                    small>
                                                                                        mdi-video
                                                                                </v-icon>
                                                                                <v-icon 
                                                                                    v-if="lesson.contentType === 'html'" 
                                                                                    small>
                                                                                        mdi-file-document
                                                                                </v-icon>
                                                                            </v-col>
                                                                            <v-col cols="7">
                                                                                <div>{{ lesson.title }}</div>
                                                                            </v-col>
                                                                            <v-col cols="3">
                                                                                <div class="text-right">{{ computeLessonDurationInSeconds(lesson) | toTimer }}</div>
                                                                            </v-col>
                                                                    </v-row>
                                                            </v-list-item>
                                                            <v-divider :key="`section-divider-${index}`"/>
                                                    </template>
                                                    <v-list-item 
                                                        color="amber darken-1"
                                                        style="cursor: pointer;"
                                                        :input-value="test && activeModule && (activeModule.name === courseModule.name)"
                                                        @click="setTest(courseModule.test)"
                                                        inactive>
                                                            <v-row 
                                                                align="center" 
                                                                class="text-caption">
                                                                    <v-col cols="1">
                                                                        <v-icon
                                                                            :color="!courseModule.test.isTaken ? 'grey' : 'amber darken-1'"
                                                                            small>mdi-check-circle</v-icon>
                                                                    </v-col>
                                                                    <v-col cols="1">
                                                                        <v-icon small>mdi-help-circle</v-icon>
                                                                    </v-col>
                                                                    <v-col cols="7">
                                                                        <div>Test: {{ courseModule.name }}</div>
                                                                    </v-col>
                                                                    <v-col cols="3">
                                                                        <div class="text-right">{{ computeTestDurationInSeconds(courseModule.test) | toTimer }}</div>
                                                                    </v-col>
                                                            </v-row>
                                                    </v-list-item>
                                            </v-list>
                                </v-expansion-panel-content>
                        </v-expansion-panel>
                </v-expansion-panels>
        </v-navigation-drawer>

        <v-footer app inset dark color="background" class="textured-background" style="border-top: thin solid rgba(0, 0, 0, 0.12) !important;">
            <div class="text-caption">&#169;2020 Slamm Technologies</div>
        </v-footer>
    </v-app>
</template>

<script>
    import firebase from '@/firebase';
    import 'firebase/functions';

    import { mapState, mapGetters } from 'vuex';

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
            durationInMinutes: null,
            canBePreviewed: null,
            contentType: '',
            video: null,
            html: '',
        },
        module: {
            name: '',
            lessons: [],
            test: {
                questions: [],
            },
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
        testResult: {
            correctCount: 0,
            incorrectCount: 0,
            skippedCount: 0,
            missedCount: 0,
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
                course: cloneDeep(init.course),
                activeModule: cloneDeep(init.module),
                activeLesson: cloneDeep(init.lesson),
                activeQuestion: cloneDeep(init.question),
                test: null,
                answers: [],
                isShowingAnswersWithExplanation: false,
                testResult: cloneDeep(init.testResult),
                testIsCompleted: false,
                isShowingCourseCompleteDialog: false,
                modulesInView: [0],
                lessonTimer: cloneDeep(init.timer),
                questionTimer: cloneDeep(init.timer),
                isShowingMustCompleteModuleDialog: false,
                playingVideo: cloneDeep(init.playingVideo),
            };
        },
        computed: {
            ...mapState([
                'company',
                'employee'
            ]),
            answersAreCorrect() {
                if (this.activeQuestion?.answers && this.answers) {
                    return Array.equalElements(this.activeQuestion.answers, this.answers);
                }

                return null;
            },
            testProgress() {
                if (this.activeQuestion) {
                    return ((this.test.questions.indexOf(this.activeQuestion) + 1) / this.test.questions.length) * 100;
                }

                if (this.testIsCompleted) {
                    return 100;
                }

                return 0;
            },
            testScore() {
                return (this.testResult.correctCount / this.test.questions.length * 100);
            },
        },
        watch: {
            course: {
                immediate: true,
                handler(course) {
                    this.setActiveLesson(course.modules[0]?.lessons[0]);
                    this.setLearningHistory();
                },
            },
            employee: {
                deep: true,
                handler(employee) {
                    this.setLearningHistory();
                }
            },
        },
        methods: {
            setLearningHistory() {
                const hasTakenTest = test => {
                    let taken = false;

                    const enrolledCourse = this.employee.enrolledCourses[this.course.id];

                    if (enrolledCourse) {
                        const courseModule = this.findTestModule(test);

                        const moduleTaken = enrolledCourse[courseModule.name];

                        if (moduleTaken) {
                            taken = moduleTaken.testScoreHistory.length > 0;
                        }
                    }

                    return taken;
                };

                const hasCompletedLesson = lesson => {
                    let completed = false;

                    const enrolledCourse = this.employee.enrolledCourses[this.course.id];

                    if (enrolledCourse) {
                        const courseModule = this.findLessonModule(lesson);

                        const moduleTaken = enrolledCourse[courseModule.name];

                        if (moduleTaken) {
                            completed = moduleTaken.completedLessons.includes(lesson.title);
                        }
                    }

                    return completed;
                };

                const computeModuleCompletionPercentage = courseModule => {
                    let completedLessonsCount = courseModule.lessons.reduce((count, lesson) => {
                        if (lesson.isCompleted) {
                            return count + 1;
                        }

                        return count;
                    }, 0);

                    if (courseModule.test.isTaken) {
                        completedLessonsCount++;
                    }

                    return (completedLessonsCount / courseModule.lessons.length * 100);
                };

                this.course
                    .modules
                    .forEach(courseModule => {
                        if (!courseModule.test.isTaken) {
                            this.$set(courseModule.test, 'isTaken', hasTakenTest(courseModule.test));
                        }

                        courseModule.lessons.forEach(lesson => {
                            if (!lesson.isCompleted) {
                                this.$set(lesson, 'isCompleted', hasCompletedLesson(lesson));
                            }
                        });

                        this.$set(courseModule, 'percentageCompleted', computeModuleCompletionPercentage(courseModule));
                    });
            },
            advance() {
                if (this.activeLesson) {
                    this.markActiveLessonCompleted();

                    const activeLessonIndex = this.activeModule.lessons.indexOf(this.activeLesson);

                    if (activeLessonIndex < (this.activeModule.lessons.length - 1)) {
                        const lesson = this.activeModule.lessons[activeLessonIndex + 1];

                        this.setActiveLesson(lesson);

                        return;
                    }
                    
                    if (activeLessonIndex === (this.activeModule.lessons.length - 1)) {
                        this.setTest(this.activeModule.test);

                        return;
                    }
                }

                if (this.test) {
                    if (this.activeQuestion) {
                        const activeQuestionIndex = this.test.questions.indexOf(this.activeQuestion);

                        if (activeQuestionIndex < (this.test.questions.length - 1)) {
                            const question = this.test.questions[activeQuestionIndex + 1];

                            this.setActiveQuestion(question);

                            return;
                        }

                        if (activeQuestionIndex === (this.test.questions.length - 1)) {
                            if (!this.testIsCompleted) {
                                this.addTestScore();

                                this.setActiveQuestion(null);
                                this.testIsCompleted = true;

                                return;
                            }
                        }
                    } 
                    
                    if (this.testIsCompleted) {
                        const activeModuleIndex = this.course.modules.indexOf(this.activeModule);

                        if (activeModuleIndex < (this.course.modules.length - 1)) {
                            const courseModuleIndex = activeModuleIndex + 1;

                            const courseModule = this.course.modules[courseModuleIndex];
                            const lesson = courseModule.lessons[0];

                            this.setActiveLesson(lesson);

                            return;
                        }
                        
                        if (activeModuleIndex === (this.course.modules.length - 1)) {
                            this.isShowingCourseCompleteDialog = true;

                            return;
                        }
                    }
                }
            },
            async markActiveLessonCompleted() {
                const activeModuleIndex = this.course.modules.indexOf(this.activeModule);
                const activeLessonIndex = this.course.modules[activeModuleIndex].lessons.indexOf(this.activeLesson);
                
                const lesson = this.course.modules[activeModuleIndex].lessons[activeLessonIndex];

                this.$set(lesson, 'isCompleted', true);
                this.setLearningHistory();

                try {
                    const completedLesson = { 
                        courseId: this.course.id, 
                        moduleName: this.activeModule.name,
                        lessonTitle: this.activeLesson.title, 
                    };

                    const addEmployeeCompletedLesson = firebase.functions()
                                                                .httpsCallable('addEmployeeCompletedLesson');

                    await addEmployeeCompletedLesson({ completedLesson });
                } 
                catch (error) {
                    this.$set(lesson, 'isCompleted', false);
                    this.setLearningHistory();

                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }
            },
            async addTestScore() {
                try {
                    const testScore = { 
                        courseId: this.course.id, 
                        moduleName: this.activeModule.name,
                        testScore: this.testScore 
                    };

                    const addEmployeeTestScore = firebase.functions()
                                                            .httpsCallable('addEmployeeTestScore');

                    await addEmployeeTestScore({ testScore });
                } catch (error) {
                    const notification = {
                        message: error.message,
                        context: 'error',
                    };

                    this.$store.commit('push_notification', { notification });
                }
            },
            setTest(test) {
                if (test) {
                    const courseModule = this.findTestModule(test);

                    if (courseModule.percentageCompleted < 100) {
                        this.isShowingMustCompleteModuleDialog = true;

                        return;
                    }

                    this.test = test;
                    this.setActiveQuestion(test.questions[0]);
                    this.setActiveModule(this.findTestModule(test));
                    this.setActiveLesson(null);
                } 
                else {
                    this.test = test;
                    this.setActiveQuestion(null);
                    this.testResult = cloneDeep(init.testResult);
                    this.testIsCompleted = false;
                }
            },
            retakeTest() {
                const test = cloneDeep(this.test);

                const unwatch = this.$watch('test', () => {
                    unwatch();

                    this.setTest(test);
                });

                this.setTest(null);
            },
            setActiveQuestion(question) {
                this.activeQuestion = question;

                this.answers = [];
                this.isShowingAnswersWithExplanation = false;
                this.clearTimer('questionTimer');

                if (question) {
                    const advance = () => {
                        this.testResult.missedCount++;

                        this.advance();
                    };

                    this.setTimer(
                        'questionTimer',
                        question.durationInSeconds,
                        advance
                    );
                }
            },
            setActiveLesson(lesson) {
                this.activeLesson = lesson;

                this.clearTimer('lessonTimer');

                if (lesson) {
                    if (lesson.contentType === 'html') {
                        this.setTimer(
                            'lessonTimer',
                            this.computeLessonDurationInSeconds(lesson),
                            this.advance
                        );
                    }

                    if (lesson.contentType === 'video') {
                        this.$nextTick(this.configureVideoPlayer);
                    }

                    this.setActiveModule(this.findLessonModule(lesson));
                    this.setTest(null);
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
            findLessonModule(lesson) {
                return this.course.modules.find(courseModule => {
                    return courseModule.lessons.includes(lesson);
                });
            },
            findTestModule(test) {
                return this.course.modules.find(courseModule => {
                    return (JSON.stringify(courseModule.test) === JSON.stringify(test));
                });
            },
            answerQuestion() {
                this.pauseTimer('questionTimer');

                this.isShowingAnswersWithExplanation = true;

                if (this.answersAreCorrect) {
                    this.testResult.correctCount++;
                } else {
                    this.testResult.incorrectCount++;
                }
            },
            computeLessonDurationInSeconds(lesson) {
                const durationInSeconds = lesson.durationInMinutes * 60;

                return Math.ceil(durationInSeconds);
            },
            computeCourseModuleDurationInSeconds(courseModule) {
                const durationInSeconds = (courseModule.lessons.reduce((total, currentModule) => {
                                            return total + (currentModule.durationInMinutes * 60);
                                        }, 0))
                            + this.computeTestDurationInSeconds(courseModule.test);

                return Math.ceil(durationInSeconds);
            },
            computeTestDurationInSeconds(test) {
                const durationInSeconds = test.questions.reduce((total, currentQuestion) => {
                                            return total + currentQuestion.durationInSeconds;
                                        }, 0);

                return Math.ceil(durationInSeconds);
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
                }

                if (timer.secondsRemainingTimerId) {
                    clearInterval(timer.secondsRemainingTimerId);

                    timer.secondsRemainingTimerId = null;
                }
            },
            resumeTimer(timerId) {
                let timer = this[timerId];

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
            },
            clearTimer(timerId) {
                let timer = this[timerId];

                if (timer.id) {
                    clearTimeout(timer.id);

                    timer.id = null;
                }

                if (timer.secondsRemainingTimerId) {
                    clearInterval(timer.secondsRemainingTimerId);

                    timer.secondsRemainingTimerId = null;
                }

                timer = null;
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

                    if (!document.hasFocus()) {
                        video.pause();
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
            }
        },
        firestore() {
            const courseId = this.$route.params.courseId;

            return {
                course: firebase.firestore().doc(`courses/${courseId}`),
            };
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
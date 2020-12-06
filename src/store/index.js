import Vue from 'vue';
import Vuex from 'vuex';

import firebase from '@/firebase';
import 'firebase/functions';
import 'firebase/firestore';

import { vuexfireMutations, firestoreAction } from 'vuexfire';
import { firestoreOptions } from 'vuexfire';

firestoreOptions.serialize = snapshot => {
  return Object.defineProperty(snapshot.data(), 'id', 
      { 
          value: snapshot.id, 
          enumerable: true, 
          configurable: true, 
          writable: true 
      });
};

import { cloneDeep } from 'lodash';

Vue.use(Vuex);

const init = {
  notifications: [],
  notification: {
    message: '',
    context: '',
    timeout: 3000,
    tag: '',
  },
  company: {
    accessToCoursesBlockedAt: null,
    plan: {
      courses: [],
    },
    logo: {
      src: '',
    },
  },
  employee: {
    name: '',
    uid: '',
    email: '',
    enrolledCourses: {},
  },
  settings: {
    business: {
      name: '',
      supportEmail: '',
    },
    course: {
      daysToOld: null,
    },
  },
};

export default new Vuex.Store({
  state: cloneDeep(init),
  getters: {
    courses(state) {
      if (state.company?.plan?.courses) {
        const courses = state.company.plan.courses;

        if (courses.every(course => typeof course !== 'string')) {
          return Array.purify(courses);
        }
      } 

      return [];
    },
  },
  mutations: {
    ...vuexfireMutations,
    push_notification({ notifications }, { notification }) {
      notifications.splice(notifications.length, 1, Object.assign({}, init.notification, notification));
    },
    pop_notification({ notifications }) {
      notifications.splice(0, 1);
    },
    set_notification(state, { notification }) {
      state.notification = notification;
    },
    clear_state(state) {
      state = Object.assign(state, cloneDeep(init));
    }
  },
  actions: {
    initialize: firestoreAction(async ({ bindFirestoreRef }) => {
      const resolveEmployee = firebase.functions()
                                      .httpsCallable('resolveEmployee');

      const employee = (await resolveEmployee()).data.employee;

      const companyRef = await firebase.firestore()
                                      .doc(`companies/${employee.company.id}`);

      const employeeRef = firebase.firestore()
                                  .doc(`companies/${employee.company.id}/employees/${employee.id}`);
      
      const settingsRef = firebase.firestore()
                                  .doc(`settings/index`);

      await bindFirestoreRef('employee', employeeRef, { wait: true });
  
      await bindFirestoreRef('company', companyRef, { wait: true });

      await bindFirestoreRef('settings', settingsRef, { wait: true });
    }),
    clear({ commit }) {
      commit('clear_state');
    }
  },
  modules: {
  }
});

import Vue from 'vue';
import Vuex from 'vuex';

import firebase from '@/firebase';
import 'firebase/firestore';

import moment from 'moment';

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
    logo: {
      src: '',
    },
    name: '',
    plan: {
      id: '',
      name: '',
      courses: [],
      licensedNumberOfEmployees: null,
      description: '',
      billing: null,
    },
    subscription: null,
  },
  employee: {
    name: '',
    uid: '',
    email: '',
    enrolledCourses: {},
    company: null,
  }
};

export default new Vuex.Store({
  state: cloneDeep(init),
  getters: {
    subscriptionHasExpired(state) {
      if (state.company.plan?.billing) {
        if (state.company.subscription) {
          const subscriptionExpiresAt = moment(state.company.subscription.expiresAt);
  
          return subscriptionExpiresAt.isBefore();
        }
      }

      return false;
    },
    planNotSet(state) {
      if (!state.company.plan) {
        return true;
      }

      return false;
    },
    subscriptionShouldBeRenewed(state) {
      if (state.company.plan?.billing) {
        if (state.company.subscription) {
          const subscriptionExpiresAt = moment(state.company.subscription.expiresAt);
  
          return (subscriptionExpiresAt.diff(moment(), 'days') < 3);
        }
      }

      return false;
    },
    unsubscribed(state) {
      if (state.company.plan?.billing) {
        if (!state.company.subscription) {
          return true;
        }
      }

      return false;
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
    initialize: firestoreAction(async ({ bindFirestoreRef }, { user }) => {
      const employee = await firebase.firestore()
                                    .collectionGroup('employees')
                                    .where('uid', '==', user.uid)
                                    .get()
                                    .then(employeesSnapshot => {
                                      const employeeSnapshot = employeesSnapshot.docs[0];

                                      const employee = Object.assign(employeeSnapshot.data(), { id: employeeSnapshot.id });

                                      return employee;
                                    });

      const companyRef = employee.company;

      const company = await companyRef.get()
                                      .then(companySnapshot => {
                                        const company = Object.assign(companySnapshot.data(), { id: companySnapshot.id });

                                        return company;
                                      });

      const employeeRef = firebase.firestore()
                                  .doc(`companies/${company.id}/employees/${employee.id}`);

      await bindFirestoreRef('employee', employeeRef, { wait: true });
  
      await bindFirestoreRef('company', companyRef, { wait: true });
    }),
    clear({ commit }) {
      commit('clear_state');
    }
  },
  modules: {
  }
});

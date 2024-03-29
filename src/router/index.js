import Vue from 'vue';
import VueRouter from 'vue-router';

import PlainLayout from '@/views/layouts/Plain.vue';
import DashboardLayout from '@/views/layouts/Dashboard';

import firebase from '@/firebase';
import 'firebase/auth';
import 'firebase/firestore';

Vue.use(VueRouter);

const makeGuard = (guardType) => {
  return (to, from, next) => {
    firebase.auth().onAuthStateChanged(async user => {
      if (guardType === 'guest') {
        if (user) {
          next('/');
        }
        else {
          next();
        }
      }

      if (guardType === 'authenticated') {
        if (user) {
          next();
        }
        else {
          next('/auth');
        }
      }

      if (guardType === 'authenticatedEmployee') {
        if (user) {
          const idToken = await user.getIdTokenResult();

          const accessLevel = idToken.claims.accessLevel;

          if (accessLevel === 'employee') {
            next();
          }
          else {
            next('/auth/unauthorized');
          }
        } 
        else {
          next('/auth');
        }
      }
    });
  };
};

const verifyCourseExists = async (to) => {
  const courseId = to.params.courseId;

  const courseDocumentSnapshot = await firebase.firestore()
                                              .doc(`courses/${courseId}`)
                                              .get();
  return !!courseDocumentSnapshot.data();
};

const routes = [
  {
    path: '/auth',
    component: PlainLayout,
    children: [
      {
        path: '/',
        name: 'Auth',
        component: () => import('@/views/pages/Auth.vue'),
        beforeEnter: makeGuard('guest'),
      },
      {
        path: 'unauthorized',
        name: 'Unauthorized',
        component: () => import('@/views/pages/Unauthorized.vue'),
        beforeEnter: makeGuard('authenticated'),
      },
    ],
  },
  {
    path: '/error',
    component: PlainLayout,
    children: [
      {
        path: '404',
        name: '404',
        component: () => import('@/views/pages/404.vue'),
      },
    ],
  },
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/pages/Home.vue'),
      }
    ],
    beforeEnter: makeGuard('authenticatedEmployee'),
  },
  {
    path: '/courses/:courseId',
    name: 'Course',
    component: () => import('@/views/pages/Course.vue'),
    beforeEnter: async (to, from, next) => {
      const courseExists = await verifyCourseExists(to);

      if (courseExists) {
        const authGuard = makeGuard('authenticatedEmployee');

        authGuard(to, from, next);
      }
      else {
        next('/error/404');
      }
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;

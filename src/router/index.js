import Vue from 'vue';
import VueRouter from 'vue-router';

import PlainLayout from '@/views/layouts/Plain.vue';
import DashboardLayout from '@/views/layouts/Dashboard';

import firebase from '@/firebase';
import 'firebase/auth';
import 'firebase/firestore';

Vue.use(VueRouter);

const authorize = (to, from, next) => {
  const redirect = () => {
    if (firebase.auth().isSignInWithEmailLink(location.href)) {
      next({ path: '/auth', query: to.query });
    } else {
      next('/auth/unauthorized');
    }
  };

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdTokenResult().then(result => {
        if (result.claims.accessLevel === 'employee') {
          next();
        } else {
          redirect();
        }
      });
    } else {
      redirect();
    }
  });
};

const authorizeGuest = (to, from, next) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdTokenResult().then(result => {
        if (result.claims.accessLevel === 'employee') {
          next('/');
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });
};

const verifyCourseExists = (to, from, next) => {
  const courseId = to.params.courseId;

  firebase.firestore()
          .doc(`courses/${courseId}`)
          .get()
          .then(courseDocumentSnapshot => {
            if (!courseDocumentSnapshot.data()) {
              next('/error/404');
            } else {
              next();
            }
          });
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
      },
      {
        path: 'unauthorized',
        name: 'Unauthorized',
        component: () => import('@/views/pages/Unauthorized.vue'),
      },
    ],
    beforeEnter: authorizeGuest,
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
      },
      {
        path: '/courses/:courseId',
        name: 'Course',
        component: () => import('@/views/pages/Course.vue'),
        beforeEnter: verifyCourseExists,
      },
    ],
    beforeEnter: authorize,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;

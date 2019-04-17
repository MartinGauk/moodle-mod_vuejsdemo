import Vue from 'vue';
import VueRouter from 'vue-router';
import { store } from './store';
import notFound from './components/not-found';
import roomsEdit from './components/rooms-edit'
const exampleLazyLoading = () => import('./components/example-lazy-loading');

function init(coursemoduleid, contextid) {
    // We need to overwrite the variable for lazy loading.
    __webpack_public_path__ = M.cfg.wwwroot + '/mod/vuejsdemo/amd/build/';

    Vue.use(VueRouter);

    store.commit('setCourseModuleID', coursemoduleid);
    store.commit('setContextID', contextid);
    store.dispatch('loadComponentStrings');

    // You have to use child routes if you use the same component. Otherwise the component's beforeRouteUpdate
    // will not be called.
    const routes = [
        { path: '/', redirect: { name: 'rooms-edit-overview' }},
        { path: '/rooms/edit', component: roomsEdit, name: 'rooms-edit-overview', meta: { title: 'rooms_edit_site_name' },
            children: [
                { path: '/rooms/edit/:roomId(\\d+)', component: roomsEdit, name: 'room-edit', meta: { title: 'room_form_title_edit' }},
                { path: '/rooms/edit/new', component: roomsEdit, name: 'room-new', meta: { title: 'room_form_title_add' }},
            ],
        },
        { path: '/lazy-loading', component: exampleLazyLoading},
        { path: '*', component: notFound, meta: { title: 'route_not_found' } },
    ];

    // base URL is /mod/vuejsdemo/view.php/[course module id]/
    const currenturl = window.location.pathname;
    const base = currenturl.substr(0, currenturl.indexOf('.php')) + '.php/' + coursemoduleid + '/';

    const router = new VueRouter({
        mode: 'history',
        routes,
        base
    });

    router.beforeEach((to, from, next) => {
        // Find a translation for the title.
        if (to.hasOwnProperty('meta') && to.meta.hasOwnProperty('title')) {
            if (store.state.strings.hasOwnProperty(to.meta.title)) {
                document.title = store.state.strings[to.meta.title];
            }
        }
        next()
    });

    new Vue({
        el: '#mod-vuejsdemo-app',
        store,
        router,
    });
}

export { init };

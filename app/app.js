import Vue from "nativescript-vue";

import Home from "./components/Home";
// import CustomAppDelegate from "./components/delegate";

// application.ios.delegate = CustomAppDelegate;

new Vue({
    render: h => h('frame', [h(Home)]),
}).$start();

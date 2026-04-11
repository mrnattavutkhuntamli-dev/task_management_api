import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // 👈 ต้องรันบรรทัดนี้ก่อน mount
app.use(router);
app.mount("#app");

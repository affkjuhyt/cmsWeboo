import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";

// 公共路由
export const constantRoutes = [
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)",
        component: (resolve) => require(["@/views/redirect"], resolve)
      }
    ]
  },
  {
    path: "/login",
    component: (resolve) => require(["@/views/login"], resolve),
    hidden: true
  },
  {
    path: "/404",
    component: (resolve) => require(["@/views/error/404"], resolve),
    hidden: true
  },
  {
    path: "/401",
    component: (resolve) => require(["@/views/error/401"], resolve),
    hidden: true
  },
  {
    path: "",
    component: Layout,
    redirect: "/index",
    children: [
    ]
  },
  {
    path: "/user",
    component: Layout,
    hidden: true,
    redirect: "noredirect",
    children: [
      {
        path: "profile",
        component: (resolve) => require(["@/views/vadmin/permission/user/profile/index"], resolve),
        name: "Profile",
        meta: { title: "Cá nhân", icon: "user" }
      },
      {
        path: "msg",
        component: (resolve) => require(["@/views/vadmin/book/message/Mymessage"], resolve),
        name: "msg",
        meta: { title: "Thông báo", icon: "user" }
      },
      {
        path: "recommender",
        component: (resolve) => require(["@/views/vadmin/recommender/data"], resolve),
        name: "recommender",
        meta: { title: "Đề xuất", icon: "" }
      }
    ]
  },
  {
    path: "/dict",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "type/data/:dictId(\\d+)",
        component: (resolve) => require(["@/views/vadmin/book/dict/data"], resolve),
        name: "Data",
        meta: { title: "Dữ liệu từ điển", icon: "" }
      }
    ]
  },
  {
    path: "/book",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "chapter/data/:bookId(\\d+)",
        component: (resolve) => require(["@/views/vadmin/book/manga/data"], resolve),
        name: "Data",
        meta: { title: "Dữ liệu chương", icon: "" }
      }
    ]
  }
];

export default new Router({
  mode: "history",
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
});

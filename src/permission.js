import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken } from "@/utils/auth";

NProgress.configure({ showSpinner: false });

const whiteList = ["/login", "/auth-redirect", "/bind", "/register"];

router.beforeEach((to, from, next) => {
  NProgress.start();
  if (getToken()) {
    /* has token*/
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else {
      if (store.getters.roles.length === 0) {
        // Xác định xem người dùng hiện tại có lấy thông tin user_info không
        store.dispatch("GetInfo").then(res => {
          const roles = res.roles;
          store.dispatch("GenerateRoutes", { roles }).then(accessRoutes => {
            // Tao bang dinh tuyen
            router.addRoutes(accessRoutes); // Tu dong them bang dinh tuyen
            next({ ...to, replace: true }); // phương pháp hack để đảm bảo addRoutes đã hoàn tất
          });
        }).catch(err => {
          store.dispatch("LogOut").then(() => {
            Message.error(err);
            next({ path: "/" });
          });
        });
      } else {
        next();
      }
    }
  } else {
    // Token
    if (whiteList.indexOf(to.path) !== -1) {
      // Trong danh sách trắng của đăng nhập miễn phí, hãy nhập trực tiếp
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`); // Nếu cập nhật thành công, tất cả sẽ được chuyển đến trang đăng nhập
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

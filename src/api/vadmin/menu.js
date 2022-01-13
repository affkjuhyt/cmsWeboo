import request from "@/utils/request";

export const getRouters = () => {
  return request({
    url: "/admin/getRouters/",
    method: "get"
  });
};

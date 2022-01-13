import request from "@/utils/request";

export function listSaveFile(query) {
  return request({
    url: "/admin/system/savefile/",
    method: "get",
    params: query
  });
}

export function addSaveFile(data) {
  return request({
    url: "/admin/system/savefile/",
    method: "post",
    data: data
  });
}

export function delSaveFile(menuId) {
  return request({
    url: "/admin/system/savefile/" + menuId + "/",
    method: "delete"
  });
}

export function clearSaveFile() {
  return request({
    url: "/admin/system/clearsavefile/",
    method: "post"
  });
}

import request from "@/utils/request";

export function listImageFile(query) {
  return request({
    url: "/admin/system/image/",
    method: "get",
    params: query
  });
}

export function listImageFileFilter(query) {
  return request({
    url: "/admin/system/image/filter",
    method: "get",
    params: query
  });
}

export function addImageFile(data) {
  return request({
    url: "/admin/system/image/",
    method: "post",
    data: data
  });
}

export function delImageFile(menuId) {
  return request({
    url: "/admin/system/image/" + menuId + "/",
    method: "delete"
  });
}

export function clearImageFile() {
  return request({
    url: "/admin/system/clearimagefile/",
    method: "post"
  });
}

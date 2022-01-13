import request from "@/utils/request";

export function listPost(query) {
  return request({
    url: "/admin/permission/post/",
    method: "get",
    params: query
  });
}

export function getPost(postId) {
  return request({
    url: "/admin/permission/post/" + postId + "/",
    method: "get"
  });
}

export function addPost(data) {
  return request({
    url: "/admin/permission/post/",
    method: "post",
    data: data
  });
}

export function updatePost(data) {
  return request({
    url: "/admin/permission/post/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delPost(postId) {
  return request({
    url: "/admin/permission/post/" + postId + "/",
    method: "delete"
  });
}

export function exportPost(query) {
  return request({
    url: "/admin/permission/post/export/",
    method: "get",
    params: query
  });
}

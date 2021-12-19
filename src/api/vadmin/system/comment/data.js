import request from "@/utils/request";

export function listComment(query) {
  return request({
    url: "/admin/system/comment/",
    method: "get",
    params: query
  });
}

export function getComment(commentId) {
  return request({
    url: "/admin/system/comment/" + commentId + "/",
    method: "get"
  });
}

// export function listImageFileFilter(query) {
//   return request({
//     url: "/admin/system/image/filter",
//     method: "get",
//     params: query
//   });
// }

export function getLineChart() {
  return request({
    url: "/admin/system/comment/weekday/",
    method: "get"
  });
}

export function updateComment(data) {
  return request({
    url: "/admin/system/comment/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function addComment(data) {
  return request({
    url: "/admin/system/comment/",
    method: "post",
    data: data
  });
}

export function delComment(commentId) {
  return request({
    url: "/admin/system/comment/" + commentId + "/",
    method: "delete"
  });
}

// Export data
export function exportComment(query) {
  return request({
    url: "/admin/system/comment/export/",
    method: "get",
    params: query
  });
}

// Clear cache
export function clearCache() {
  return request({
    url: "/admin/system/comment/clearCache/",
    method: "delete"
  });
}

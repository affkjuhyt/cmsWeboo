import request from "@/utils/request";

// listChapter
export function listChapter(query) {
  return request({
    url: "/admin/system/book/chapter/",
    method: "get",
    params: query
  });
}

// getChapter
export function getChapter(bookId) {
  return request({
    url: "/admin/system/book/chapter/" + bookId + "/",
    method: "get"
  });
}

// // gets
// export function getDicts(dictType) {
//   return request({
//     url: "/admin/system/dict/get/type/" + dictType + "/?status=1",
//     method: "get"
//   });
// }

// GetChapter
export function getChapters(query) {
  return request({
    url: "/admin/system/book/chapter/book_chapter" + "/",
    method: "get",
    params: query
  });
}

// addChapter
export function addChapter(data) {
  return request({
    url: "/admin/system/book/chapter/chapter_update/",
    method: "post",
    contentType: false,
    data: data
  });
}

// updateChapter
export function updateChapter(data) {
  return request({
    url: "/admin/system/book/chapter/update/",
    method: "put",
    data: data
  });
}

// delChapter
export function delChapter(chapterId) {
  return request({
    url: "/admin/system/book/chapter/" + chapterId + "/",
    method: "delete"
  });
}

// exportChapter
export function exportChapter(query) {
  return request({
    url: "/admin/system/book/chapter/export/",
    method: "get",
    params: query
  });
}

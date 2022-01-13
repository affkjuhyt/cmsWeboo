import request from "@/utils/request";

export function listMessage(query) {
  return request({
    url: "/admin/system/message/",
    method: "get",
    params: query
  });
}

export function getMessage(messageId) {
  return request({
    url: "/admin/system/message/" + messageId + "/",
    method: "get"
  });
}

export function addMessage(data) {
  return request({
    url: "/admin/system/message/",
    method: "post",
    data: data
  });
}

export function updateMessage(data) {
  return request({
    url: "/admin/system/message/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delMessage(messageId) {
  return request({
    url: "/admin/system/message/" + messageId + "/",
    method: "delete"
  });
}

export function exportMessage(query) {
  return request({
    url: "/admin/system/message/export/",
    method: "get",
    params: query
  });
}

export function userMessage(query) {
  return request({
    url: "/admin/system/message/user_messages/",
    method: "get",
    params: query
  });
}

export function updateIsRead(data) {
  return request({
    url: "/admin/system/message/is_read/" + data.id + "/",
    method: "put"
  });
}

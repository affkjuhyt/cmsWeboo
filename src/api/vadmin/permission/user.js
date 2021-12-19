import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/ruoyi";

export function listUser(query) {
  return request({
    url: "/admin/permission/user/",
    method: "get",
    params: query
  });
}

export function getUser(userId) {
  return request({
    url: "/admin/permission/user/details/?userId=" + praseStrEmpty(userId),
    method: "get"
  });
}

export function addUser(data) {
  return request({
    url: "/admin/permission/user/",
    method: "post",
    data: data
  });
}

export function updateUser(data) {
  return request({
    url: "/admin/permission/user/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delUser(userId) {
  return request({
    url: "/admin/permission/user/" + userId + "/",
    method: "delete"
  });
}

export function exportUser(query) {
  return request({
    url: "/admin/permission/user/export/",
    method: "get",
    params: query
  });
}

export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  };
  return request({
    url: "/admin/permission/user/resetPwd/",
    method: "put",
    data: data
  });
}

export function getPercentUserVip() {
  return request({
    url: "/admin/system/percentUser/",
    method: "get"
  });
}

export function getRegisterUser() {
  return request({
    url: "/admin/system/registerUser/",
    method: "get"
  });
}

export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  };
  return request({
    url: "/admin/permission/user/changeStatus/",
    method: "put",
    data: data
  });
}

export function getUserProfile() {
  return request({
    url: "/admin/permission/user/profile/",
    method: "get"
  });
}

export function updateUserProfile(data) {
  return request({
    url: "/admin/permission/user/profile/",
    method: "put",
    data: data
  });
}

export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  };
  return request({
    url: "/admin/permission/user/profile/updatePwd/",
    method: "put",
    data: data
  });
}

export function uploadAvatar(data) {
  return request({
    url: "/admin/permission/user/profile/avatar/",
    method: "put",
    data: data
  });
}

export function importTemplate() {
  return request({
    url: "/admin/permission/user/importTemplate/",
    method: "get"
  });
}

export function importsUser(data) {
  return request({
    url: "/admin/permission/user/importTemplate/",
    method: "post",
    data: data
  });
}

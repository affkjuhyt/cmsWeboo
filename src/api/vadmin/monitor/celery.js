import request from "@/utils/request";

export const sync_data_prefix = "/admin/celery";

export function getIntervalschedulea(id) {
  return request({
    url: `${sync_data_prefix}/intervalschedule/${id}/`,
    method: "get"
  });
}

export function listIntervalschedule(params) {
  return request({
    url: `${sync_data_prefix}/intervalschedule/`,
    method: "get",
    params
  });
}

export function updateIntervalschedule(data) {
  return request({
    url: `${sync_data_prefix}/intervalschedule/${data.id}/`,
    method: "put",
    data
  });
}
export function createIntervalschedule(data) {
  return request({
    url: `${sync_data_prefix}/intervalschedule/`,
    method: "post",
    data
  });
}

export function deleteIntervalschedule(id) {
  return request({
    url: `${sync_data_prefix}/intervalschedule/${id}/`,
    method: "delete"
  });
}

export function getCrontabSchedule(id) {
  return request({
    url: `${sync_data_prefix}/crontabschedule/${id}/`,
    method: "get"
  });
}

export function listCrontabSchedule(params) {
  return request({
    url: `${sync_data_prefix}/crontabschedule/`,
    method: "get",
    params
  });
}

export function updateCrontabSchedule(data) {
  return request({
    url: `${sync_data_prefix}/crontabschedule/${data.id}/`,
    method: "put",
    data
  });
}

export function createCrontabSchedule(data) {
  return request({
    url: `${sync_data_prefix}/crontabschedule/`,
    method: "post",
    data
  });
}

export function deleteCrontabSchedule(id) {
  return request({
    url: `${sync_data_prefix}/crontabschedule/${id}/`,
    method: "delete"
  });
}

export function getPeriodicTask(id) {
  return request({
    url: `${sync_data_prefix}/periodictask/${id}/`,
    method: "get"
  });
}

export function listPeriodicTask(params) {
  return request({
    url: `${sync_data_prefix}/periodictask/`,
    method: "get",
    params
  });
}

export function TasksAsChoices(params) {
  return request({
    url: `${sync_data_prefix}/tasks_as_choices/`,
    method: "get",
    params
  });
}

export function updatePeriodicTask(data) {
  return request({
    url: `${sync_data_prefix}/periodictask/${data.id}/`,
    method: "put",
    data
  });
}

export function createPeriodicTask(data) {
  return request({
    url: `${sync_data_prefix}/periodictask/`,
    method: "post",
    data
  });
}

export function deletePeriodicTask(id) {
  return request({
    url: `${sync_data_prefix}/periodictask/${id}/`,
    method: "delete"
  });
}

export function operatesyncdata(data) {
  return request({
    url: `${sync_data_prefix}/operate_celery/`,
    method: "post",
    data
  });
}

export function list(query) {
  return request({
    url: "/admin/system/celery_log/",
    method: "get",
    params: query
  });
}

export function delCeleryLog(infoId) {
  return request({
    url: `/admin/system/celery_log/${infoId}/`,
    method: "delete"
  });
}

export function cleanCeleryLog() {
  return request({
    url: "/admin/system/celery_log/clean",
    method: "delete"
  });
}

export function exportCeleryLog(query) {
  return request({
    url: "/admin/system/celery_log/export",
    method: "get",
    params: query
  });
}


import request from '../utils/request';

// 可发起的流程
export function getFlowList() {
  return request('/api/list');
}
// 获取发起流程
export function getStartFlow(id) {
  return request(`/api/start/${id}`);
}

// 上传图片
export function fileUpload(data) {
  return request('http://192.168.20.16:8009/api/files', {
    method: 'POST',
    body: data,
  });
}
// 审批列表
export function getStartList(data) {
  return request('/api/sponsor', {
    method: 'POST',
    body: data,
  });
}

// 预提交
export function preSet(data) {
  return request(`/api/preset/${data.id}`, {
    method: 'POST',
    body: data.data,
  });
}

export function stepStart(data) {
  return request(`/api/start/${data.id}`, {
    method: 'POST',
    body: data.data,
  });
}

// 发起详情
export function startDetail(id) {
  return request(`/api/sponsor/${id}`);
}

export function doWithdraw(data) {
  return request('/api/withdraw', {
    method: 'PATCH',
    body: data,
  });
}

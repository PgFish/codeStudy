import { peek, pop, push } from "./minheap"

/*
 * @Date: 2023-03-21 09:07:37
 * @Description: 
 */
const taskQueue =[]
let taskIdCounter = 1

export function scheduleCallback(callback) {
  const currentTime = getCurrentTime()
  const timeout = -1
  const expirationTime = currentTime - timeout
  const newTask = {
    id: taskIdCounter++,
    callback,
    expirationTime,
    sortIndex: expirationTime
  }

  push(taskQueue, newTask)
  // 请求调度
  requestHostCallback()
}


function requestHostCallback() {
  // 创建宏任务
  port.postMessage(null);
}

const channel =  new MessageChannel()
const port = channel.port2;

channel.port1.onmessage = function() {
  workLoop()
}

function workLoop() {
  let currentTask = peek(taskQueue)
  while(currentTask) {
    const callback = currentTask.callback
    currentTask.callback = null
    callback()
    pop(taskQueue)
    currentTask = peek(taskQueue)
  }
}


function getCurrentTime() {
  return performance.now()
}
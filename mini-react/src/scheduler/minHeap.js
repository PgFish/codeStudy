/*
 * @Date: 2023-03-21 09:07:49
 * @Description: 
 */
// 返回最小堆对应元素
export function peek(heap) {
  return heap.length === 0 ? null : heap[0]
}

// 往最小堆中插入元素
// 1. 把node插入数组尾部
// 2. 往上调整最小堆
export function push(heap, node) {
  let index = heap.length
  heap.push(node)
  shiftUp(heap, node,index)
}

function shiftUp(heap, node,i) {
  let index = i
  // 越界
  while(index >0) {
    const parentIndex = (index - 1) >> 1;
    const parent = heap[parentIndex]
    if (compare(parent, node) > 0) {
      // parent > node,不符合最小堆条件, 交换位置
      heap[parentIndex] = node
      heap[index] = parent
      index = parentIndex
    } else {
      return
    }
  }
}

// 删除顶元素
// 1. 最后一个元素覆盖堆顶
// 2. 向下调整
export function pop (heap) {
  if (heap.length === 0) {
    return
  }
  const first = heap[0]
  const last = heap.pop()
  if (first !== last) {
    heap[0] = last
    shiftDown(heap, last, 0)
  }

  return first
}

// 向下调整
function shiftDown(heap, last, i) {
  let index = i;
  const len = heap.length;
  const halfLen = len >>> 1;

  while (index < halfLen) {
    let leftIndex = (index + 1) * 2 - 1;
    let left = heap[leftIndex];
    let rightIndex = leftIndex + 1;
    let right = heap[rightIndex];
    // todo 比较parent与left与right的大小
    // 如果parent不是最小的，那就比较left和right谁最小，然后把最小的和parent交换位置
    // 如果parent是最小的，那就停止
    if (compare(left, node) < 0) {
      // left < parent
      // 为了保证根节点最小，比较left和right
      if (rightIndex < len && compare(right, left) < 0) {
        // right<left, right是最小的，交换parent和right
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // right>left, left是最小的，交换parent和left
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < len && compare(right, node) < 0) {
      // left > parent
      //   检查right, right<parent
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // parnent最小
      return;
    }
  }
}

function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}
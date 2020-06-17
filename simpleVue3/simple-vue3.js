// 原始=> 响应式
let toProxy = new WeakMap()
// 响应式=》 原始
let toRaw = new WeakMap()

function reactive(target) {
  // 查询缓存
  let observed = toProxy.get(target)
  if (observed) {
    return observed
  }
  if (toRaw.get(target)) {
    return target
  }

  // Proxy 
      // 可以拦截所以的操作 不需要$set
      // 支持全部的数据格式， Map
      // 懒收集
      // 自带能力
  // defineProperty
    //   初始化的时候，全部递归完毕
    //   数组需要单独拦截
    //   对象新增和删除属性，不能拦截，所以需要 $set
  observed = new Proxy(target, baseHandler)
  // 设置双向缓存
  toProxy.set(target, observed)
  toRaw.set(observed, target)
  return observed
}

const baseHandler = {
  get(target, key) {
    const res = Reflect.get(target, key);
    console.log('get res', res);
    // 收集依赖
    track(target, key);
    return typeof(res) === 'object' ? reactive(res) : res;
  },
  set(target, key, val) {
    const info = {
      oldValue: target[key],
      newValue: val
    }
    const res = Reflect.set(target, key, val)
    console.log('set res', res);
    // 响应式去通知更新,触发effect
    triger(target, key, info);
  }
}

// 存储effect
let effectStack = [];
// 没有垃圾回收机制影响,存储数据
let targetMap = new WeakMap();
function track(target, key) {
  // 获取最新的依赖
  const effect = effectStack[effectStack.length - 1];
  if (effect) {
    // targetMap,key为对象target,寻找对应value,depMap中的dep对应的值
    // 怎么收集依赖，用一个巨大的map来收集
    // {
    //   target1:{
    //     age,name
    //     key: [包装之后的effect依赖的函数1，依赖的函数2]
    //   }
    //   target2:{
    //     key2: [包装之后的effect依赖的函数1，依赖的函数2]
    //   }
    // }
    let depMap = targetMap.get(target);
    if (depMap === undefined) {
      depMap = new Map();
      targetMap.set(target, depMap);
    }
    let dep = depMap.get(key);
    if (dep === undefined) {
      dep = new Set();
      depMap.set(key, dep);
    }
    // 容错
    if (!dep.has(effect)) {
      // 新增依赖
      // 双向存储,方便查找优化
      dep.add(effect);
      effect.deps.push(dep);
    }
  }

}

function triger(target, key, info) {
  // 数据变化后，通知更新 执行effect
  // 1. 找到依赖
  let depMap = targetMap.get(target);
  if (depMap === undefined) {
    return;
  }
  // 2. 分开执行computed依赖和effect依赖
  const effects = new Set();
  const computedRunners = new Set();

  if (key) {
    let deps = depMap.get(key);
    deps.forEach(dep => {
      if (dep.computed) {
        computedRunners.add(dep);
      } else {
        effects.add(dep);
      }
    })
    // 先执行effect依赖,因为computed依赖可能依赖于effect
    effects.forEach(effect => effect());
    computedRunners.forEach(computed => computed());
  }
}

function effect(fn, options={}) {
  const e = createReactiveEffect(fn, options);
  // 懒加载
  if (!e.lazy) {
    e();
  }
  return e;
}

function computed(fn) {
  // 特殊的effect
  const runner = effect(fn, { computed: true, lazy: true })
  return {
    effect: runner,
    get value() {
      return runner()
    }
  }
}

function createReactiveEffect(fn, options) {
  // 构造固定格式的effect
  const effect = function effect(...args) {
    return run(effect, fn, args);
  }
  // effect的配置
  effect.deps = [];
  effect.computed = options.computed;
  effect.lazy = options.lazy;
  return effect;
}

function run (effect, fn, args) {
  // 防止多次触发依赖
  if (effectStack.indexOf(effect) === -1) {
    try {
      effectStack.push(effect);
      return fn(...args);
    } finally {
      effectStack.pop();
    }
  }
}
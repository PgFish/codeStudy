class YVue {
  constructor(option) {
    this.$option = option;
    this.$data = option.data;

    this.observe(this.$data);

    // test
    // new Watcher(this, 'name')
    // this.name
    // Dep.target = null;

    // new Watcher(this, 'foo.bar')
    // this.foo.bar
    // Dep.target = null;
    new Compile(option.el, this);

    if (option.created) {
      option.created.call(this);
    }
  }
  observe(value) {
    if (!value || typeof(value) !== 'object') {
      return;
    }
    Object.keys(value).forEach(key => {
      this.defineReactive(value, key, value[key]);
      this.proxy(key);
    })
  }
  defineReactive(obj, key, val) {
    this.observe(val);
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      get: function() {
        Dep.target && dep.addDep(Dep.target);
        return val;
      },
      set: function(newVal) {
        console.log('newVal', newVal)
        if (newVal === val) {
          return;
        }
        val = newVal;
        console.log('set newVal', newVal);
        dep.notify();
      }
    })
  }
  // 代理对Vue实例本身做监听
  proxy(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      }
    })
  }
}

class Dep {
  constructor() {
    this.watchers = [];
  }
  addDep(watcher) {
    this.watchers.push(watcher);
  }
  notify() {
    console.log(this.watchers)
    this.watchers.forEach(watcher => watcher.update());
  }
};

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    
    Dep.target = this;
    this.vm[this.key]; // 读取触发依赖收集
    Dep.target = null;
  }
  update() {
    console.log('update', this.key);
    this.cb.call(this.vm, this.vm[this.key]);
  }
}

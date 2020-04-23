class YVue {
  constructor(option) {
    this.$option = option;
    this.$data = option.data;

    this.observe(this.$data);

    // test
    new Watcher(this, 'name')
    this.name
    Dep.target = null;

    new Watcher(this, 'foo.bar')
    this.foo.bar
    Dep.target = null;
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
  constructor(vm, key) {
    this.vm = vm;
    this.key = key;
    
    Dep.target = this;
  }
  update() {
    console.log('update', this.key);
  }
}

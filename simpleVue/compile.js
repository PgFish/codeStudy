class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    // 将dom全部移入fragment中
    this.$fragment = this.node2Fragment(this.$el);
    // 执行编译
    this.compile(this.$fragment);
    // 追加到dom中
    this.$el.appendChild(this.$fragment);
  }

  node2Fragment(el) {
    // dom移动操作
    const fragment = document.createDocumentFragment();
    console.log(fragment)
    let child;
    while(child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (node.nodeType === 1) {
        this.complieElement(node);
      } else if (this.isInerText(node)) {
        this.compileText(node);
      }

      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    })
  }
  isInerText(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }

  complieElement(node) {
    const nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach(attr => {
      // v-text = 'name'
      const attrName = attr.name; // v-text
      const key = attr.value; // name
      if(attrName.indexOf('v-') === 0) {
        const dir = attrName.substring(2);
        this[dir] && this[dir](node, key);
      } else if (attrName.indexOf('@') === 0) {
        const directive = attrName.substring(1);
        const fn = this.$vm.$options.methods && this.$vm.$options.methods[key];
        if (directive && fn) node.addEventListener(directive, fn.bind(this.$vm));
      }
    });
  }

  compileText(node) {
    const value = RegExp.$1;
    this.update(node, value, 'text');
  }
  
  update(node, key, dir) {
    const updator = this[dir + 'Updator'];
    // 初始化
    updator && updator(node, this.$vm[key]);
    new Watcher(this.$vm, key, function(value) {
      updator && updator(node, value);
    })
  }

  text(node, key) {
    this.update(node, key, 'text');
  }

  textUpdator(node, val) {
    node.textContent = val;
  }

  html(node, key) {
    this.update(node, key, 'html');
  }

  htmlUpdator(node, val) {
    node.innerHTML = val;
  }

  model(node, key) {
    this.update(node, key, 'model');

    node.addEventListener('input', e => {
      this.$vm[key] = e.target.value;
    });
  }

  modelUpdator(node, val) {
    node.value = val;
  }
}
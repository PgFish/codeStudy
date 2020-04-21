let UserFactory = ((role) => {
  function SuperAdmin() {
    this.name = '超级管理员';
    this.viewPage = ['首页', '系统管理', '订单管理', '菜单管理'];
  }
  function Admin() {
    this.name = '管理员';
    this.viewPage = ['首页', '菜单管理', '订单管理'];
  }
  function User() {
    this.name = '普通用户';
    this.viewPage = ['首页', '订单管理'];
  }
  switch (role) {
    case 'superAdmin':
      return new SuperAdmin();
      break;
    case 'admin':
      return new Admin();
      break;
    case 'user':
      return new User();
      break;   
    default: 
      throw new Error('参数错误, 可选参数:superAdmin、admin、user');  
  }
});

// too much Object is hard to defined
console.log(Object.prototype.toString.call(UserFactory('superAdmin')));
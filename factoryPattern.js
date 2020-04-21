let UserFactory = function (role) {
  if (this instanceof UserFactory) {
    var s = new this[role]();
    return s;
  } else {
    return new UserFactory(role);
  }
}
//工厂方法函数的原型中设置所有对象的构造函数 
UserFactory.prototype = {
  SuperAdmin: function () {
    this.name = "超级管理员";
    this.viewPage = ['首页', '用户管理', '订单管理', '应用管理', '权限管理']
  },
  Admin: function () {
    this.name = "管理员";
    this.viewPage = ['首页', '订单管理', '应用管理']
  },
  NormalUser: function () {
    this.name = '普通用户';
    this.viewPage = ['首页', '订单管理']
  }
}
//调用 
let superAdmin = UserFactory('SuperAdmin');
console.log(superAdmin)
let admin = UserFactory('Admin')
let normalUser = UserFactory('NormalUser')
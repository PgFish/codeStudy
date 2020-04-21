var single = function () {
  var uni;
  function getInstance() {
    if (uni === undefined) {
      uni = new Construct();
    }
    return uni;
  }
  function Construct() {
    this.name = 'haha';
    this.count = 0;
    this.count++
  }
  return {
    instance: getInstance
  }
}


single()
single()
single()
console.log(single().instance())
import { observable } from 'mobx';

class GlobalsStore {
  @observable globals = null;

  // Use init pattern instead of constructor because
  // constructors can't be async
  async init() {
    const res = await fetch('/globals');
    const data = await res.json();
    this.globals = data;
  }
}

export default GlobalsStore;
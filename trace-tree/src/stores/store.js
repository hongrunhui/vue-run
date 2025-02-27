import { makeAutoObservable } from 'mobx';

class TraceStore {
  rootNode = null;

  constructor() {
    makeAutoObservable(this);
  }

  setRootNode(node) {
    this.rootNode = node;
  }
}

const traceStore = new TraceStore();
export default traceStore; 
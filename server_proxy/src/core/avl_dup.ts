import AVL from 'avl';
import { KeyObject } from 'crypto';
export default class DupAVL<Key, Value> extends AVL<
  Key,
  AVL<Value, undefined>
> {
  insertDup(key: Key, value: Value) {
    const node = this.find(key);
    if (node) {
      node.data?.insert(value);
    } else {
      const nodeKeyValue = new AVL<Value, undefined>();
      nodeKeyValue.insert(value);
      this.insert(key, nodeKeyValue);
    }
  }

  removeDup(key: Key, value: Value) {
    const node = this.find(key);
    if (node) {
      node.data?.remove(value);
      if (node.data?.isEmpty()) {
        this.remove(key);
      }
    }
  }
}

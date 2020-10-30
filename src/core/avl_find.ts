import avl from 'avl';
import { IKeyPair } from '../interface/IKeyPair';

class AVLFind<T> {
  private _avls: IKeyPair<avl<string, number>>;
  private _datas: T[];
  private _dataRmIndex: number[];

  constructor() {
    this._avls = {};
    this._datas = [];
    this._dataRmIndex = [];
  }

  addSearchKeyGroups(...keys: string[]) {
    console.log(keys);
  }

  insert(data: T) {
    const index = this.push(data);
  }

  find(data: T) {}

  private push(data: T): number {
    let index = this._dataRmIndex.shift();
    if (index) {
      this._datas[index] = data;
    } else {
      index = this._datas.length;
      this._datas.push(data);
    }
    return index;
  }
}

const test = new AVLFind<IKeyPair<unknown>>();

test.insert({
  a: 1,
  b: 2,
  c: 3
});

test.insert({
  a: 2,
  b: 2,
  c: 1
});

test.addSearchKeyGroups('a', 'c');

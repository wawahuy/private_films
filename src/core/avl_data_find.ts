import AVLTree, * as AVL from 'avl';
import { IKeyPair } from '../interface/IKeyPair';
import DupAVL from './avl_dup';

export enum TypeCompare {
  LESS,
  EQUAL,
  BIGGER
}

export type Compare = (valueA: unknown, valueB: unknown) => TypeCompare;

export interface Data {
  [key: string]: unknown;
}

export class DataResult<T extends Data> {
  private _datas: T[];

  constructor(datas: T[]) {
    this._datas = datas;
  }

  get data() {
    return this._datas;
  }

  get nextAvl() {
    const avl = new AvlDataFind<T>();
    this._datas.map((data) => {
      avl.insert(data);
    });
    return avl;
  }
}

export class AvlDataFind<T extends Data> {
  private _datas: (T | undefined)[];
  private _indexDataNull: number[];
  private _avls: IKeyPair<DupAVL<unknown, number>>;
  private _size: number;
  private _exceptFields: string[];

  constructor() {
    this._datas = [];
    this._indexDataNull = [];
    this._avls = {};
    this._exceptFields = [];
    this._size = 0;
  }

  get size() {
    return this._size;
  }

  get datas() {
    return this._datas;
  }

  insert(data: T) {
    const fields = this.getFieldOfData(data);
    const index = this.insertData(data);
    fields.map((field) => {
      if (this._exceptFields.indexOf(field) > -1) {
        return;
      }
      const avl = this.getAVL(field);
      const key = data[field];
      avl.insertDup(key, index);
    });
    this._size++;
  }

  remove(data: T) {
    const index = this._datas.indexOf(data);
    if (index > -1) {
      const avlFields = this.getFieldOfData(this._avls);
      avlFields.map((field) => {
        const avl = this._avls[field];
        avl.removeDup(data[field], index);
      });
      this._datas[index] = undefined;
      this._indexDataNull.push(index);
      this._size--;
    }
  }

  query(callback: (data: T) => void) {
    this._datas.map((data) => {
      if (data) {
        callback(data);
      }
    });
  }

  find(key: string, value: unknown) {
    return this.findDataOnKey(key, (avl) => [avl.find(value)]);
  }

  min(key: string) {
    return this.findDataOnKey(key, (avl) => [avl.minNode()]);
  }

  max(key: string) {
    return this.findDataOnKey(key, (avl) => [avl.maxNode()]);
  }

  minOfNumberValue(key: string) {
    return this.findNumberValueOnKey(key, (current, ret) => current < ret);
  }

  maxOfNumberValue(key: string) {
    return this.findNumberValueOnKey(key, (current, ret) => current > ret);
  }

  exceptFields(keys: string[]) {
    this._exceptFields = keys;
  }

  private findNumberValueOnKey(
    key: string,
    compare: (current: number, ret: number) => boolean
  ) {
    return this.findDataOnKey(key, (avl) => {
      let nodeRet: AVL.Node<unknown, AVLTree<number, undefined>>[] = [
        avl.at(0)
      ];
      let sizeRet = nodeRet[0].data?.size || 0;
      avl.forEach((node) => {
        const sizeCurrent = node.data?.size || 0;
        if (compare(sizeCurrent, sizeRet)) {
          nodeRet = [node];
          sizeRet = sizeCurrent;
        } else if (sizeCurrent == sizeRet) {
          nodeRet.push(node);
        }
      });
      return nodeRet;
    });
  }

  private findDataOnKey(
    key: string,
    callback: (
      avl: DupAVL<unknown, number>
    ) => AVL.Node<unknown, AVLTree<number, undefined>>[]
  ) {
    const avl = this._avls[key];
    if (avl) {
      let dataValues: T[] = [];
      const nodes = callback(avl);
      nodes.map((node) => {
        const dataIndex = node?.data;
        const dataValue = dataIndex ? this.indexToValue(dataIndex) : [];
        dataValues = dataValues.concat(dataValue);
      });
      const dataResult = new DataResult(dataValues);
      return dataResult;
    }
    return null;
  }

  private getFieldOfData(data: Data) {
    return Object.keys(data);
  }

  private getAVL(key: string) {
    let avl = this._avls[key];
    if (!avl) {
      avl = new DupAVL<unknown, number>();
      this._avls[key] = avl;
    }
    return avl;
  }

  private insertData(data: T): number {
    let index = this._indexDataNull.shift();
    if (!index) {
      index = this._datas.length;
      this._datas.push(data);
    } else {
      this._datas[index] = data;
    }
    return index;
  }

  private indexToValue(index: AVLTree<number, undefined>) {
    const datas: T[] = [];
    index.forEach((node) => {
      const index = node?.key;
      if (index != undefined) {
        datas.push(this._datas[index] as T);
      }
    });
    return datas;
  }
}

// import { v4 as uuidv4 } from 'uuid';
// const avl = new AvlDataFind();
// function timer(name: string, callback: () => unknown) {
//   const t = new Date().getTime();
//   callback();
//   console.log(name, new Date().getTime() - t);
// }

// const datas: Data[] = [];
// timer('fake data', () => {
//   let filmId = '';
//   Array.from({ length: 100000 }).map((v, i) => {
//     if (i % 10000 == 0) {
//       filmId = uuidv4();
//     }
//     return datas.push({
//       count: Math.round(Math.random() * 100),
//       filmId
//     });
//   });
// });

// timer('inser full', () => {
//   datas.map((data) => avl.insert(data));
// });

// timer('remove', () => {
//   datas.map((data) => avl.remove(data));
// });

// console.log(avl);

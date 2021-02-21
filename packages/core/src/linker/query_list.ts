/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';

import {EventEmitter} from '../event_emitter';
import {flatten} from '../util/array_utils';
import {getSymbolIterator} from '../util/symbol';

function symbolIterator<T>(this: QueryList<T>): Iterator<T> {
  return ((this as any as{_results: Array<T>})._results as any)[getSymbolIterator()]();
}

/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * 一个不可修改的条目列表，当应用状态变化时，Angular 会保证它是最新的。
 *
 * The type of object that {@link ViewChildren}, {@link ContentChildren}, and {@link QueryList}
 * provide.
 *
 * {@link ViewChildren}, {@link ContentChildren} 和 {@link QueryList} 所提供对象的类型。
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `*ngFor="let i of myList"`.
 *
 * 实现一个可迭代接口，因此它可以用于 ES6 JavaScript 的 `for (var i of items)` 循环，和 Angular 模板中的 `*ngFor="let i of myList"`。
 *
 * Changes can be observed by subscribing to the changes `Observable`.
 *
 * 可以通过订阅 `changes` 这个 `Observable` 来监听这些变化。
 *
 * NOTE: In the future this class will implement an `Observable` interface.
 *
 * 注意：将来此类将会实现 `Observable` 接口。
 *
 * @usageNotes
 * ### Example
 *
 * ### 例子
 *
 * ```typescript
 * @Component({...})
 * class Container {
 *   @ViewChildren(Item) items:QueryList<Item>;
 * }
 * ```
 *
 * @publicApi
 */
export class QueryList<T>/* implements Iterable<T> */ {
  public readonly dirty = true;
  private _results: Array<T> = [];
  public readonly changes: Observable<any> = new EventEmitter();

  readonly length: number = 0;
  // TODO(issue/24571): remove '!'.
  readonly first !: T;
  // TODO(issue/24571): remove '!'.
  readonly last !: T;

  constructor() {
    // This function should be declared on the prototype, but doing so there will cause the class
    // declaration to have side-effects and become not tree-shakable. For this reason we do it in
    // the constructor.
    // [getSymbolIterator()](): Iterator<T> { ... }
    const symbol = getSymbolIterator();
    const proto = QueryList.prototype as any;
    if (!proto[symbol]) proto[symbol] = symbolIterator;
  }

  /**
   * See
   * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
   *
   * 参见 [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
   */
  map<U>(fn: (item: T, index: number, array: T[]) => U): U[] { return this._results.map(fn); }

  /**
   * See
   * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
   *
   * 参见 [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
   */
  filter(fn: (item: T, index: number, array: T[]) => boolean): T[] {
    return this._results.filter(fn);
  }

  /**
   * See
   * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
   *
   * 参见 [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
   */
  find(fn: (item: T, index: number, array: T[]) => boolean): T|undefined {
    return this._results.find(fn);
  }

  /**
   * See
   * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
   *
   * 参见 [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
   */
  reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U {
    return this._results.reduce(fn, init);
  }

  /**
   * See
   * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
   *
   * 参见 [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
   */
  forEach(fn: (item: T, index: number, array: T[]) => void): void { this._results.forEach(fn); }

  /**
   * See
   * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
   *
   * 参见 [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
   */
  some(fn: (value: T, index: number, array: T[]) => boolean): boolean {
    return this._results.some(fn);
  }

  /**
   * Returns a copy of the internal results list as an Array.
   */
  toArray(): T[] { return this._results.slice(); }

  toString(): string { return this._results.toString(); }

  /**
   * Updates the stored data of the query list, and resets the `dirty` flag to `false`, so that
   * on change detection, it will not notify of changes to the queries, unless a new change
   * occurs.
   *
   * @param resultsTree The results tree to store
   */
  reset(resultsTree: Array<T|any[]>): void {
    this._results = flatten(resultsTree);
    (this as{dirty: boolean}).dirty = false;
    (this as{length: number}).length = this._results.length;
    (this as{last: T}).last = this._results[this.length - 1];
    (this as{first: T}).first = this._results[0];
  }

  /**
   * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
   */
  notifyOnChanges(): void { (this.changes as EventEmitter<any>).emit(this); }

  /** internal */
  setDirty() { (this as{dirty: boolean}).dirty = true; }

  /** internal */
  destroy(): void {
    (this.changes as EventEmitter<any>).complete();
    (this.changes as EventEmitter<any>).unsubscribe();
  }
}

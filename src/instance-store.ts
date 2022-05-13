import { InstanceWrapper } from './instance-wrapper';
import { ContextId } from './interfaces';


export interface InstancePerContext<T> {
  instance?: T;
  isResolved: boolean;
  donePromise?: Promise<void>;
}

export interface Inquirer {
  wrapper: InstanceWrapper;
  keyOrIndex?: string | number | symbol;
}

type InquirerId = string;
type InquirerKeyOrIndex = string | symbol | number;
type InstanceValues<T> = WeakMap<ContextId, InstancePerContext<T>>;
type TransientValues<T> = Map<InquirerId | undefined, InstanceValues<T>>;
type KeyOrIndexMappedTransientValues<T> = Map<InquirerKeyOrIndex | undefined, TransientValues<T>>;


export class InstanceStore<T> {
  private readonly _values: InstanceValues<T> = new WeakMap();
  private readonly _transientValues?: TransientValues<T>;
  private readonly _keyOrIndexMappedTransientValues?: KeyOrIndexMappedTransientValues<T>;

  constructor(private readonly _wrapper: InstanceWrapper) {
    if (this._wrapper.isTransient) {
      if (this._wrapper.hasInquirerKeyOrIndexToken) {
        this._keyOrIndexMappedTransientValues = new Map();
      } else {
        this._transientValues = new Map();
      }
    }
  }

  getTransientInstance(contextId: ContextId, inquirer?: Inquirer): InstancePerContext<T> | undefined {
    if (!this._wrapper.hasInquirerKeyOrIndexToken) {
      return this.getInstanceByInquirerId(this._transientValues!, contextId, inquirer?.wrapper.id);
    } else {
      return this.getInstanceByInquirerKeyOrIndex(this._keyOrIndexMappedTransientValues!, contextId, inquirer);
    }
  }

  setTransientInstance(contextId: ContextId, value: InstancePerContext<T>, inquirer?: Inquirer): void {
    if (!this._wrapper.hasInquirerKeyOrIndexToken) {
      this.setInstanceByInquirerId(this._transientValues!, contextId, value, inquirer?.wrapper.id);
    } else {
      this.setInstanceByInquirerKeyOrIndex(this._keyOrIndexMappedTransientValues!, contextId, value, inquirer);
    }
  }

  getInstance(contextId: ContextId): InstancePerContext<T> | undefined {
    return this._values.get(contextId);
  }

  setInstance(contextId: ContextId, value: InstancePerContext<T>): void {
    this._values.set(contextId, value);
  }

  getAllTransientInstances(contextId: ContextId): InstancePerContext<T>[] {
    if (!this._wrapper.hasInquirerKeyOrIndexToken) {
      return [...this._transientValues!.values()]
        .map(it => it.get(contextId))
        .filter(it => it) as InstancePerContext<T>[];

    } else {
      return [...this._keyOrIndexMappedTransientValues!.values()]
        .map(it => [...it.values()])
        .reduce((maps, it) => maps.concat(...it), [])
        .map(it => it.get(contextId))
        .filter(it => it) as InstancePerContext<T>[];
    }
  }

  private getInstanceByInquirerId(
    inquirerMap: TransientValues<T>,
    contextId: ContextId,
    inquirerId?: InquirerId
  ): InstancePerContext<T> | undefined {
    let values = inquirerMap.get(inquirerId);
    if (!values) {
      values = new WeakMap();
      inquirerMap.set(inquirerId, values);
    }
    return values.get(contextId);
  }

  private setInstanceByInquirerId(
    inquirerMap: TransientValues<T>,
    contextId: ContextId,
    value: InstancePerContext<T>,
    inquirerId?: InquirerId
  ): void {
    let values = inquirerMap.get(inquirerId);
    if (!values) {
      values = new WeakMap();
      inquirerMap.set(inquirerId, values);
    }
    values.set(contextId, value);
  }

  private getInstanceByInquirerKeyOrIndex(
    inquirerKeyOrIndexMap: KeyOrIndexMappedTransientValues<T>,
    contextId: ContextId,
    inquirer?: Inquirer
  ): InstancePerContext<T> | undefined {
    let inquirerMap = inquirerKeyOrIndexMap.get(inquirer?.keyOrIndex);
    if (!inquirerMap) {
      inquirerMap = new Map();
      inquirerKeyOrIndexMap.set(inquirer?.keyOrIndex, inquirerMap);
    }
    return this.getInstanceByInquirerId(inquirerMap, contextId, inquirer?.wrapper.id);
  }

  private setInstanceByInquirerKeyOrIndex(
    inquirerKeyOrIndexMap: KeyOrIndexMappedTransientValues<T>,
    contextId: ContextId,
    value: InstancePerContext<T>,
    inquirer?: Inquirer
  ): void {
    let inquirerMap = inquirerKeyOrIndexMap.get(inquirer?.keyOrIndex);
    if (!inquirerMap) {
      inquirerMap = new Map();
      inquirerKeyOrIndexMap.set(inquirer?.keyOrIndex, inquirerMap);
    }
    this.setInstanceByInquirerId(inquirerMap, contextId, value, inquirer?.wrapper.id);
  }
}

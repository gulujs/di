import { InstanceWrapper } from '../instance-wrapper';

export function getTransientInstances(wrappers: InstanceWrapper[]): unknown[] {
  const instances: unknown[] = [];

  for (const wrapper of wrappers) {
    if (!wrapper.isDependencyTreeStatic()) {
      continue;
    }

    const instanceHosts = wrapper.getStaticTransientInstances();
    for (const { instance } of instanceHosts) {
      if (!instance) {
        continue;
      }

      instances.push(instance);
    }
  }

  return instances;
}

export function getNonTransientInstances(wrappers: InstanceWrapper[]): unknown[] {
  const instances: unknown[] = [];

  for (const wrapper of wrappers) {
    if (!wrapper.isDependencyTreeStatic() || wrapper.isTransient) {
      continue;
    }

    instances.push(wrapper.instance);
  }

  return instances;
}

import Bluebird from 'bluebird';

type ConditionFunc<T> = (value: T) => boolean;
type ActionFunc<T> = (value: T) => Promise<T>;

export default <T>(
  condition: ConditionFunc<T>,
  action: ActionFunc<T>,
  initialValue: T
): Promise<T> => {
  return Bluebird.method<T, ConditionFunc<T>, ActionFunc<T>, T>(
    async function fn(condition, action, initValue): Promise<T> {
      const value = await action(initValue);
      if (!condition(value)) return value;
      return fn(condition, action, value);
    }
  )(condition, action, initialValue);
};

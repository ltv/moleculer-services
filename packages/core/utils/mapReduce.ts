type ValueGetterFunc<T, R> = (item: T) => R;

const defaultValueGetter = (item: any) => true as any;

export const mapReduce = <
  T extends { [key in F]: any },
  F extends string,
  R = Boolean
>(
  data: T[],
  field: F,
  valueGetter: ValueGetterFunc<T, R> = defaultValueGetter
): { [key: string]: R } => {
  return data.reduce<{ [key: string]: R }>((all, item) => {
    const key = item[field].toString();
    all[key] = valueGetter(item);
    return all;
  }, {});
};

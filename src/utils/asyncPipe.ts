const asyncPipe = async <T, R = any>(...fns: ((arg: T) => T | Promise<T>)[]): Promise<(input: T) => Promise<R>> => {
  return async (input: any) => {
    let result = input;
    for (const fn of fns) {
      result = await fn(result); // 각 함수의 결과를 기다림
    }
    return result as R;
  };
};

export const execFuncOnly = async <T>(func: () => Promise<T> | T, dto?: any) => {
  await func();
  return dto;
};

export default asyncPipe;

const asyncPipe = async <T>(...fns: ((arg: T) => T | Promise<T>)[]) => {
  return async (input: any) => {
    let result = input;
    for (const fn of fns) {
      result = await fn(result); // 각 함수의 결과를 기다림
    }
    return result;
  };
};

export const execFuncOnly = async <T>(func: () => Promise<T> | T, dto?: any) => {
  await func();
  return dto;
};

export default asyncPipe;

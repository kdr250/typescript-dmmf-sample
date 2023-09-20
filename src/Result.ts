/* eslint-disable @typescript-eslint/no-namespace */
import { match } from 'ts-pattern';

/** 成功 */
export type Success<S> = { type: 'Success'; value: S };

/** 失敗 */
export type Failure<F> = { type: 'Failure'; value: F };

/** 結果 */
export type Result<S, F> = Success<S> | Failure<F>;

/** 非同期処理を伴う結果 */
export type AsyncResult<S, F> = Promise<Result<S, F>>;

/** 非同期処理を伴う結果かを判定する型ガード */
function isAsyncResult<S, F>(result: GeneralResult<S, F>): result is AsyncResult<S, F> {
  return result instanceof Promise;
}

/** 通常の結果または非同期処理を伴う結果のいずれか */
type GeneralResult<S, F> = Result<S, F> | AsyncResult<S, F>;

export namespace Result {
  export const bind =
    <S, F, SS>(nextAction: (successValue: S) => Result<SS, F>) =>
    (result: Result<S, F>): Result<SS, F> => {
      return match(result)
        .with({ type: 'Success' }, (success) => nextAction(success.value))
        .with({ type: 'Failure' }, (failure) => failure)
        .exhaustive();
    };
}

export namespace AsyncResult {
  export const bind =
    <S, F, SS>(nextAction: (successValue: S) => GeneralResult<SS, F>) =>
    async (result: GeneralResult<S, F>): AsyncResult<SS, F> => {
      const judgedResult: Result<S, F> = isAsyncResult(result) ? await result : result;
      return match(judgedResult)
        .with({ type: 'Success' }, async (success) => await nextAction(success.value))
        .with({ type: 'Failure' }, (failure) => failure)
        .exhaustive();
    };
}

export const success = <S>(value: S): Success<S> => ({ type: 'Success', value });

export const failure = <F>(value: F): Failure<F> => ({ type: 'Failure', value });

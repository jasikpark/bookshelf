// 🐨 instead of React Testing Library, you'll use React Hooks Testing Library
import {renderHook, act} from '@testing-library/react'
// 🐨 Here's the thing you'll be testing:
import {useAsync} from '../hooks'

// 💰 I'm going to give this to you. It's a way for you to create a promise
// which you can imperatively resolve or reject whenever you want.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

// Use it like this:
// const {promise, resolve} = deferred()
// promise.then(() => console.log('resolved'))
// do stuff/make assertions you want to before calling resolve
// resolve()
// await promise
// do stuff/make assertions you want to after the promise has resolved

// 🐨 flesh out these tests
test('calling run with a promise which resolves', async () => {
  // 🐨 get a promise and resolve function from the deferred utility
  const {promise, resolve} = deferred()
  // 🐨 use renderHook with useAsync to get the result
  const {result} = renderHook(() => useAsync())
  // 🐨 assert the result.current is the correct default state
  expect(result.current).toEqual({
    data: null,
    error: null,
    isError: false,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    reset: expect.any(Function),
    run: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    status: 'idle',
  })
  // 🐨 call `run`, passing the promise
  //    (💰 this updates state so it needs to be done in an `act` callback)
  let p
  act(() => {
    p = result.current.run(promise)
  })
  // 🐨 assert that result.current is the correct pending state
  expect(result.current).toEqual({
    data: null,
    error: null,
    isError: false,
    isIdle: false,
    isLoading: true,
    isSuccess: false,
    reset: expect.any(Function),
    run: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    status: 'pending',
  })
  // 🐨 call resolve and wait for the promise to be resolved
  //    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
  await act(async () => {
    resolve()
    await promise
  })
  // 🐨 assert the resolved state
  expect(result.current).toEqual({
    data: undefined,
    error: null,
    isError: false,
    isIdle: false,
    isLoading: false,
    isSuccess: true,
    reset: expect.any(Function),
    run: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    status: 'resolved',
  })
  // 🐨 call `reset` (💰 this will update state, so...)
  act(() => result.current.reset())
  // 🐨 assert the result.current has actually been reset
  expect(result.current).toEqual({
    data: null,
    error: null,
    isError: false,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    reset: expect.any(Function),
    run: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    status: 'idle',
  })
})

test.todo('calling run with a promise which rejects')
// 🐨 this will be very similar to the previous test, except you'll reject the
// promise instead and assert on the error state.
// 💰 to avoid the promise actually failing your test, you can catch
//    the promise returned from `run` with `.catch(() => {})`

test.todo('can specify an initial state')
// 💰 useAsync(customInitialState)

test.todo('can set the data')
// 💰 result.current.setData('whatever you want')

test.todo('can set the error')
// 💰 result.current.setError('whatever you want')

test.todo('No state updates happen if the component is unmounted while pending')
// 💰 const {result, unmount} = renderHook(...)
// 🐨 ensure that console.error is not called (React will call console.error if updates happen when unmounted)

test.todo('calling "run" without a promise results in an early error')

// 🐨 instead of React Testing Library, you'll use React Hooks Testing Library
import {renderHook, act} from '@testing-library/react'
// 🐨 Here's the thing you'll be testing:
import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})
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

function getAsyncState(overrides) {
  return {
    data: null,
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,

    error: null,
    status: 'idle',
    run: expect.any(Function),
    reset: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    ...overrides,
  }
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
  expect(result.current).toEqual(getAsyncState())
  // 🐨 call `run`, passing the promise
  //    (💰 this updates state so it needs to be done in an `act` callback)
  let p
  act(() => {
    p = result.current.run(promise)
  })
  // 🐨 assert that result.current is the correct pending state
  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    }),
  )
  // 🐨 call resolve and wait for the promise to be resolved
  //    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
  await act(async () => {
    resolve()
    await p
  })
  // 🐨 assert the resolved state
  expect(result.current).toEqual(
    getAsyncState({
      data: undefined,
      isIdle: false,
      isSuccess: true,
      status: 'resolved',
    }),
  )
  // 🐨 call `reset` (💰 this will update state, so...)
  act(() => result.current.reset())
  // 🐨 assert the result.current has actually been reset
  expect(result.current).toEqual(getAsyncState())
})

test('calling run with a promise which rejects', async () => {
  // 🐨 this will be very similar to the previous test, except you'll reject the
  // promise instead and assert on the error state.
  // 💰 to avoid the promise actually failing your test, you can catch
  //    the promise returned from `run` with `.catch(() => {})`

  // 🐨 get a promise and resolve function from the deferred utility
  const {promise, reject} = deferred()
  // 🐨 use renderHook with useAsync to get the result
  const {result} = renderHook(() => useAsync())
  // 🐨 assert the result.current is the correct default state
  expect(result.current).toEqual(getAsyncState())
  // 🐨 call `run`, passing the promise
  //    (💰 this updates state so it needs to be done in an `act` callback)
  let p
  act(() => {
    p = result.current.run(promise)
  })
  // 🐨 assert that result.current is the correct pending state
  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    }),
  )
  // 🐨 call resolve and wait for the promise to be resolved
  //    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
  await act(async () => {
    reject()
    await p.catch(() => {})
  })
  // 🐨 assert the resolved state
  expect(result.current).toEqual(
    getAsyncState({
      error: undefined,
      isError: true,
      isIdle: false,
      status: 'rejected',
    }),
  )
  // 🐨 call `reset` (💰 this will update state, so...)
  act(() => result.current.reset())
  // 🐨 assert the result.current has actually been reset
  expect(result.current).toEqual(getAsyncState())
})

test('can specify an initial state', async () => {
  // 💰 useAsync(customInitialState)
  const customInitialState = {
    data: 'hello world',
    error: {error: 'this is patrick'},
    status: 'rejected',
    isError: true,
    isIdle: false,
  }
  // 🐨 use renderHook with useAsync to get the result
  const {result} = renderHook(({initialState}) => useAsync(initialState), {
    initialProps: {initialState: customInitialState},
  })
  // 🐨 assert the result.current is the correct default state
  expect(result.current).toEqual(getAsyncState(customInitialState))
})

test('can set the data', async () => {
  // 💰 result.current.setData('whatever you want')
  const {result} = renderHook(() => useAsync())
  const customData = 'blarghffll'

  expect(result.current).toEqual(getAsyncState())

  act(() => result.current.setData(customData))

  expect(result.current).toEqual(
    getAsyncState({
      data: customData,
      isIdle: false,
      isSuccess: true,
      status: 'resolved',
    }),
  )
})

test('can set the error', async () => {
  // 💰 result.current.setError('whatever you want')
  const {result} = renderHook(() => useAsync())
  const customError = 'oh nooooo'

  expect(result.current).toEqual(getAsyncState())

  act(() => result.current.setError(customError))

  expect(result.current).toEqual(
    getAsyncState({
      error: customError,
      isIdle: false,
      isError: true,
      status: 'rejected',
    }),
  )
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {result, unmount} = renderHook(() => useAsync())
  const {promise, resolve} = deferred()
  let p
  act(() => {
    p = result.current.run(promise)
  })

  unmount()
  await act(async () => {
    resolve()
    await p
  })

  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())

  expect(() => result.current.run()).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})

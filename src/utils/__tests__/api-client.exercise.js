// 🐨 you'll need the test server
// 💰 the way that our tests are set up, you'll find this in `src/test/server/test-server.js`
import {server, rest} from 'test/server'
// 🐨 grab the client
import {client} from '../api-client'

const apiURL = process.env.REACT_APP_API_URL

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  // 🐨 add a server handler to handle a test request you'll be making
  // 💰 because this is the first one, I'll give you the code for how to do that.
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )
  //
  // 🐨 call the client (don't forget that it's asynchronous)
  const resp = await client(endpoint)

  // 🐨 assert that the resolved value from the client call is correct

  expect(resp).toStrictEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  // 🐨 create a fake token (it can be set to any string you want)
  const fakeToken = 'totally real and not fake token='
  const endpoint = 'test-endpoint'
  // 🐨 create a "request" variable with let
  let request
  // 🐨 create a server handler to handle a test request you'll be making
  // 🐨 inside the server handler, assign "request" to "req" so we can use that
  //     to assert things later.
  //     💰 so, something like...
  //       async (req, res, ctx) => {
  //         request = req
  //         ... etc...
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json([]))
    }),
  )
  // 🐨 call the client with the token (note that it's async)
  await client(endpoint, {token: fakeToken})

  // 🐨 verify that `request.headers.get('Authorization')` is correct (it should include the token)
  expect(request.headers.get('Authorization')).toContain(fakeToken)
})

test('allows for config overrides', async () => {
  // 🐨 do a very similar setup to the previous test
  // 🐨 create a custom config that specifies properties like "mode" of "cors" and a custom header
  // 🐨 call the client with the endpoint and the custom config
  // 🐨 verify the request had the correct properties

  // 🐨 create a fake token (it can be set to any string you want)
  const customConfig = {mode: 'cors', headers: {'X-FOO': 'bar'}}
  const endpoint = 'test-endpoint'
  // 🐨 create a "request" variable with let
  let request
  // 🐨 create a server handler to handle a test request you'll be making
  // 🐨 inside the server handler, assign "request" to "req" so we can use that
  //     to assert things later.
  //     💰 so, something like...
  //       async (req, res, ctx) => {
  //         request = req
  //         ... etc...
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json([]))
    }),
  )
  // 🐨 call the client with the token (note that it's async)
  await client(endpoint, customConfig)

  // 🐨 verify that `request.headers.get('Authorization')` is correct (it should include the token)
  expect(request.headers.get('X-FOO')).toContain(customConfig.headers['X-FOO'])
  expect(request.mode).toBe('cors')
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  // 🐨 create a mock data object
  // 🐨 create a server handler very similar to the previous ones to handle the post request
  //    💰 Use rest.post instead of rest.get like we've been doing so far
  // 🐨 call client with an endpoint and an object with the data
  //    💰 client(endpoint, {data})
  // 🐨 verify the request.body is equal to the mock data object you passed

  const fakeData = {hello: 'world'}
  const endpoint = 'test-endpoint'
  // 🐨 create a "request" variable with let
  let request
  // 🐨 create a server handler to handle a test request you'll be making
  // 🐨 inside the server handler, assign "request" to "req" so we can use that
  //     to assert things later.
  //     💰 so, something like...
  //       async (req, res, ctx) => {
  //         request = req
  //         ... etc...
  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json([]))
    }),
  )
  // 🐨 call the client with the token (note that it's async)
  await client(endpoint, {data: fakeData})

  // 🐨 verify that `request.headers.get('Authorization')` is correct (it should include the token)
  expect(request.body).toStrictEqual(fakeData)
})

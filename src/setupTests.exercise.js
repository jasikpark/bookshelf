import {server} from 'test/server' // via `server.resetHandlers()`
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

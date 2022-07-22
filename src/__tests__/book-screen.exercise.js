// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import {
  findByText,
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {queryCache} from 'react-query'
import {buildUser, buildBook} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {App} from 'app'
import {server} from 'test/server'

import * as usersDB from 'test/data/users'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'

const waitForLoadingToFinish = async () =>
  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])

const loginAsUser = async () => {
  const user = buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  // this is what our auth provider does to persist the user's
  // logged in state so it can give us a token without making a request
  // every provider will be different and you'll need to adjust this
  // to whatever they do (you may even have to mock more of their functions)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
}

const render = () => rtlRender(<App />, {wrapper: AppProviders})

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => {
  queryCache.clear()
  auth.logout()
})

test('renders all the book information', async () => {
  await loginAsUser()

  const book = await booksDB.create(buildBook())

  // 🐨 update the URL to `/book/${book.id}`
  //   💰 window.history.pushState({}, 'page title', route)
  //   📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)

  // 🐨 render the App component and set the wrapper to the AppProviders
  // (that way, all the same providers we have in the app will be available in our tests)
  render()
  // 🐨 use findBy to wait for the book title to appear
  // 📜 https://testing-library.com/docs/dom-testing-library/api-async#findby-queries
  await waitForLoadingToFinish()
  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()

  await usersDB.reset()
  await booksDB.reset()
  await listItemsDB.reset()
})

test('can create a list item for the book', async () => {
  await loginAsUser()

  const book = await booksDB.create(buildBook())

  // 🐨 update the URL to `/book/${book.id}`
  //   💰 window.history.pushState({}, 'page title', route)
  //   📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)

  // 🐨 render the App component and set the wrapper to the AppProviders
  // (that way, all the same providers we have in the app will be available in our tests)
  render()
  // 🐨 use findBy to wait for the book title to appear
  // 📜 https://testing-library.com/docs/dom-testing-library/api-async#findby-queries
  await waitForLoadingToFinish()
  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', {name: /add to list/i}))

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()

  await usersDB.reset()
  await booksDB.reset()
  await listItemsDB.reset()
})

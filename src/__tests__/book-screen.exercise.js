// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import {
  findByText,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {queryCache} from 'react-query'
import {buildUser, buildBook} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {App} from 'app'

// 🐨 after each test, clear the queryCache and auth.logout
afterEach(() => {
  queryCache.clear()
  auth.logout()
})

test('renders all the book information', async () => {
  // 🐨 "authenticate" the client by setting the auth.localStorageKey in localStorage to some string value (can be anything for now)
  window.localStorage.setItem(auth.localStorageKey, 'SOME_FAKE_TOKEN')
  // 🐨 create a user using `buildUser`
  const user = buildUser()
  // 🐨 create a book use `buildBook`
  const book = buildBook()
  // 🐨 update the URL to `/book/${book.id}`
  //   💰 window.history.pushState({}, 'page title', route)
  //   📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)
  // 🐨 reassign window.fetch to another function and handle the following requests:
  // - url ends with `/bootstrap`: respond with {user, listItems: []}
  // - url ends with `/list-items`: respond with {listItems: []}
  // - url ends with `/books/${book.id}`: respond with {book}
  // 💰 window.fetch = async (url, config) => { /* handle stuff here*/ }
  // 💰 return Promise.resolve({ok: true, json: async () => ({ /* response data here */ })})
  window.fetch = async (url, config) => {
    if (url.endsWith('/bootstrap')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user,
          listItems: [],
        }),
      })
    }
    if (url.endsWith('/list-items')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          listItems: [],
        }),
      })
    }
    if (url.endsWith(`/books/${book.id}`)) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          book,
        }),
      })
    }
    throw new Error('your test is weird')
  }
  // 🐨 render the App component and set the wrapper to the AppProviders
  // (that way, all the same providers we have in the app will be available in our tests)
  render(<App />, {wrapper: AppProviders})
  // 🐨 use findBy to wait for the book title to appear
  // 📜 https://testing-library.com/docs/dom-testing-library/api-async#findby-queries
  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
})

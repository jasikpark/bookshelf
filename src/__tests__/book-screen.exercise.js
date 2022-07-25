// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {buildBook} from 'test/generate'
import {render, waitForLoadingToFinish, loginAsUser} from 'test/app-test-utils'
import * as booksDB from 'test/data/books'
import {App} from 'app'

test('renders all the book information', async () => {
  await loginAsUser()
  const book = await booksDB.create(buildBook())
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)

  render(<App />)

  await waitForLoadingToFinish()
  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  await loginAsUser()
  const book = await booksDB.create(buildBook())
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)

  render(<App />)

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
})

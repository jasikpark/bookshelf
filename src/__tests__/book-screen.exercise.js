// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import {screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {buildBook} from 'test/generate'
import {render, waitForLoadingToFinish, loginAsUser} from 'test/app-test-utils'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {buildListItem} from 'test/generate'
import faker from 'faker'
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

test('can remove a list item for the book', async () => {
  // prepare
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  await listItemsDB.create(buildListItem({owner: user, book}))
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)
  // end prepare

  render(<App />)

  await waitForLoadingToFinish()

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', {name: /remove from list/i}))

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  // prepare
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  await listItemsDB.create(buildListItem({owner: user, book, finishDate: null}))
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)
  // end prepare

  render(<App />)

  await waitForLoadingToFinish()

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', {name: /mark as read/i}))

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
})

test('can edit a note', async () => {
  // prepare
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  const listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  window.history.pushState({}, 'Book Details', `/book/${book.id}`)
  const fakeNote = faker.lorem.paragraph()
  // end prepare

  render(<App />)

  await waitForLoadingToFinish()

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()

  const noteInput = screen.getByRole('textbox', {name: /notes/i})

  await userEvent.type(noteInput, fakeNote)
  expect(await screen.findByLabelText(/loading/i)).toBeInTheDocument()
  await waitForLoadingToFinish()

  expect(screen.getByRole('textbox', {name: /note/i})).toHaveTextContent(
    fakeNote,
  )

  expect((await listItemsDB.read(listItem.id)).notes).toBe(fakeNote)
})

import * as React from 'react'
import {
  render,
  screen,
  waitForLoadingToFinish,
  userEvent,
  loginAsUser,
} from 'test/app-test-utils'
import faker from 'faker'
import {buildBook, buildListItem} from 'test/generate'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {App} from 'app'

const fakeTimerUserEvent = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
})

test('renders all the book information', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`

  await render(<App />, {route})

  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  await render(<App />, {route})

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
  const route = `/book/${book.id}`
  await listItemsDB.create(buildListItem({owner: user, book}))
  await render(<App />, {route, user})

  // end prepare

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', {name: /remove from list/i}))

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  // prepare
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  await listItemsDB.create(buildListItem({owner: user, book, finishDate: null}))
  await render(<App />, {route, user})
  // end prepared

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', {name: /mark as read/i}))

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
})

test('can edit a note', async () => {
  // using fake timers to skip debounce time
  jest.useFakeTimers()
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  const listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  const route = `/book/${book.id}`

  await render(<App />, {route, user})

  //   expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()

  const newNotes = faker.lorem.words()
  const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

  await fakeTimerUserEvent.clear(notesTextarea)
  await fakeTimerUserEvent.type(notesTextarea, newNotes)

  // wait for the loading spinner to show up
  await screen.findByLabelText(/loading/i)
  // wait for the loading spinner to go away
  await waitForLoadingToFinish()

  expect(notesTextarea).toHaveValue(newNotes)

  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: newNotes,
  })
}, 5000)

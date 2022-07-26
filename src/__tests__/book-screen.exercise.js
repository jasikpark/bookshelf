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
import {server, rest} from 'test/server'

const fakeTimerUserEvent = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
})

async function renderBookScreen({user, book, listItem} = {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  book = typeof book === 'undefined' ? await booksDB.create(buildBook()) : book

  listItem =
    typeof listItem === 'undefined'
      ? await listItemsDB.create(buildListItem({owner: user, book}))
      : listItem
  const route = `/book/${book.id}`

  const result = await render(<App />, {route, user})

  return {
    book,
    listItem,
    ...result,
  }
}

test('renders all the book information', async () => {
  const {book} = await renderBookScreen({listItem: null})

  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  const {book} = await renderBookScreen({listItem: null})

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
  const {book} = await renderBookScreen()
  // end prepare

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', {name: /remove from list/i}))

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  const {book, listItem} = await renderBookScreen()
  await listItemsDB.update(listItem.id, {finishDate: null})

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
  const {listItem} = await renderBookScreen()

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

test('shows an error message when the book fails to load', async () => {
  const book = await booksDB.create(buildBook({id: 1234567890}))
  await renderBookScreen({book, listItem: null})
  expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
    `"There was an error: Book not found"`,
  )
})

test('note update failures are displayed', async () => {
  const apiURL = process.env.REACT_APP_API_URL

  const testErrorMessage = '__test_error_message__'
  server.use(
    rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({status: 400, message: testErrorMessage}),
      )
    }),
  )

  // using fake timers to skip debounce time
  jest.useFakeTimers()
  await renderBookScreen()

  const newNotes = faker.lorem.words()
  const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

  await fakeTimerUserEvent.clear(notesTextarea)
  await fakeTimerUserEvent.type(notesTextarea, newNotes)

  // wait for the loading spinner to show up
  await screen.findByLabelText(/loading/i)
  // wait for the loading spinner to go away
  await waitForLoadingToFinish()

  expect(screen.getByRole('alert')).toHaveTextContent(
    `There was an error: ${testErrorMessage}`,
  )
})

import * as React from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Modal, ModalOpenButton, ModalContents} from '../modal'

test('can be opened and closed', async () => {
  const label = 'Modal label'
  const title = 'Modal title'
  // 🐨 render the Modal, ModalOpenButton, and ModalContents
  render(
    <Modal>
      <ModalOpenButton>
        <button>Open</button>
      </ModalOpenButton>
      <ModalContents title={title} aria-label={label}>
        Hello World
      </ModalContents>
    </Modal>,
  )
  // 🐨 click the open button
  await userEvent.click(screen.getByRole('button', {name: /open/i}))
  // 🐨 verify the modal contains the modal contents, title, and label
  const modal = screen.getByRole('dialog', {name: label})
  const {getByRole, getByText} = within(modal)

  expect(getByRole('heading', {name: title})).toBeInTheDocument()
  expect(getByText('Hello World')).toBeInTheDocument()
  // 🐨 click the close button
  await userEvent.click(getByRole('button', {name: /close/i}))
  // 🐨 verify the modal is no longer rendered
  // 💰 (use `query*` rather than `get*` or `find*` queries to verify it is not rendered)
  // 💰 Remember all userEvent utils are async, so you need to await them.
  await expect(
    screen.queryByRole('dialog', {name: title}),
  ).not.toBeInTheDocument()
})

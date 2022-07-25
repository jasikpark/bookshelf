import * as React from 'react'
import {
  waitForElementToBeRemoved,
  screen,
  render as rtlRender,
} from '@testing-library/react'
import {buildUser} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'

import * as usersDB from 'test/data/users'

export const waitForLoadingToFinish = async () =>
  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])

export const loginAsUser = async () => {
  const user = buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  // this is what our auth provider does to persist the user's
  // logged in state so it can give us a token without making a request
  // every provider will be different and you'll need to adjust this
  // to whatever they do (you may even have to mock more of their functions)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
  return authUser
}

export const render = (ui, options) =>
  rtlRender(ui, {wrapper: AppProviders, ...options})

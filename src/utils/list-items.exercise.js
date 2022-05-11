import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from 'utils/api-client.exercise'
import invariant from 'tiny-invariant'

/**
 *
 * @typedef {{ token: string }} User
 */

/**
 *
 * @param {User} user
 * @param {string} bookId
 */
export function useListItem(user, bookId) {
  invariant(
    user && user.token,
    '`useListItem` requires a user token to auth with the backend',
  )
  invariant(bookId, '`bookId` is a required argument')
  const query = useListItems(user)
  const listItem = (query?.data?.listItems ?? []).filter(
    listItem => listItem.bookId === bookId,
  )[0]
  return {...query, data: {listItem}}
}

/**
 *
 * @param {User} user
 */
export function useListItems(user) {
  invariant(
    user && user.token,
    '`useListItems` requires a user token to auth with the backend',
  )
  return useQuery('list-items', async () =>
    client('list-items', {token: user.token}),
  )
}

/**
 *
 * @param {User} user
 * @param {Record<string, any> | undefined} options
 */
export function useUpdateListItem(user, options) {
  invariant(
    user && user.token,
    '`useUpdateListItem` requires a user token to auth with the backend',
  )
  invariant(
    typeof options === 'object' || typeof options === 'undefined',
    '`options` should be an object or undefined',
  )
  return useMutation(
    async updates => {
      invariant(updates?.id, '`updates.id` is a required argument')
      return client(`list-items/${updates.id}`, {
        token: user.token,
        method: 'PUT',
        data: updates,
      })
    },
    {onSettled: () => queryCache.invalidateQueries('list-items'), ...options},
  )
}

/**
 *
 * @param {User} user
 * @param {Record<string, any> | undefined} options
 */
export function useRemoveListItem(user, options) {
  invariant(
    user && user.token,
    '`useRemoveListItem` requires a user token to auth with the backend',
  )
  invariant(
    typeof options === 'object' || typeof options === 'undefined',
    '`options` should be an object or undefined',
  )
  return useMutation(
    async listItem => {
      invariant(listItem?.id, '`listItem.id` is a required argument')
      return client(`list-items/${listItem.id}`, {
        token: user.token,
        method: 'DELETE',
      })
    },
    {onSettled: () => queryCache.invalidateQueries('list-items'), ...options},
  )
}

/**
 *
 * @param {User} user
 * @param {Record<string, any> | undefined} options
 */
export function useCreateListItem(user, options) {
  invariant(
    user && user.token,
    '`useCreateListItem` requires a user token to auth with the backend',
  )
  invariant(
    typeof options === 'object' || typeof options === 'undefined',
    '`options` should be an object or undefined',
  )
  return useMutation(
    async ({bookId}) => {
      invariant(bookId, '`bookId` is a required argument')
      return client('list-items', {token: user.token, data: {bookId}})
    },
    {onSettled: () => queryCache.invalidateQueries('list-items'), ...options},
    {token: user.token},
  )
}

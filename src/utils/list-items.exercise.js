import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from 'utils/api-client.exercise'
import invariant from 'tiny-invariant'
import {setQueryDataForBook} from './books.exercise'

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
  return useQuery(
    'list-items',
    () => client('list-items', {token: user.token}),
    {
      onSuccess({listItems}) {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book)
        }
      },
    },
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
    updates => {
      invariant(updates?.id, '`updates.id` is a required argument')
      return client(`list-items/${updates.id}`, {
        token: user.token,
        method: 'PUT',
        data: updates,
      })
    },
    {
      onMutate: updates => {
        console.log('called useUpdateListItem/onMutate')
        const {listItems} = queryCache.getQueryData('list-items')
        if (!listItems) {
          return
        }

        const [originalListItem] = listItems.filter(
          listItem => listItem.id === updates.id,
        )

        const updatedListItem = {...originalListItem, ...updates}

        const updatedListItems = listItems.map(listItem => {
          if (listItem.id === updatedListItem.id) {
            return updatedListItem
          }
          return listItem
        })
        queryCache.setQueryData('list-items', updatedListItems)

        return originalListItem
      },
      onError: (err, updates, originalListItem) => {
        console.log('called useUpdateListItem/onError')
        const {listItems} = queryCache.getQueryData('list-items')
        const originalListItems = listItems.map(listItem => {
          if (listItem.id === originalListItem.id) {
            return originalListItem
          }
          return listItem
        })
        queryCache.setQueryData('list-items', originalListItems)
      },
      onSettled: () => queryCache.invalidateQueries('list-items'),
      ...options,
    },
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
    listItem => {
      invariant(listItem?.id, '`listItem.id` is a required argument')
      return client(`list-items/${listItem.id}`, {
        token: user.token,
        method: 'DELETE',
      })
    },
    {
      onMutate: listItemToDelete => {
        console.log('called useRemoveListItem/onMutate')
        const {listItems} = queryCache.getQueryData('list-items')
        if (!listItems) {
          return
        }

        const [originalListItem] = listItems.filter(
          listItem => listItem.id === listItemToDelete.id,
        )

        const updatedListItems = listItems.filter(
          listItem => listItem.id !== listItemToDelete.id,
        )

        queryCache.setQueryData('list-items', updatedListItems)

        return originalListItem
      },
      onError: (err, listItemToDelete, originalListItem) => {
        console.log('called useRemoveListItem/onError')
        const {listItems} = queryCache.getQueryData('list-items')
        const originalListItems = [...listItems, originalListItem]
        queryCache.setQueryData('list-items', originalListItems)
      },
      onSettled: () => queryCache.invalidateQueries('list-items'),
      ...options,
    },
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
    ({bookId}) => {
      invariant(bookId, '`bookId` is a required argument')
      return client('list-items', {token: user.token, data: {bookId}})
    },
    {
      onMutate: ({bookId} = {}) => {
        console.log('called useCreateListItem/onMutate')
        const {listItems} = queryCache.getQueryData('list-items') ?? {}
        const {book} = queryCache.getQueryData('book', {bookId}) ?? {}
        if (!listItems || !book) {
          return
        }

        const updatedListItems = [...listItems, book]
        console.log('added', book, 'creating', updatedListItems)
        queryCache.setQueryData('list-items', updatedListItems)
      },
      onError: (err, {bookId} = {}) => {
        const {listItems} = queryCache.getQueryData('list-items')
        const originalListItems = listItems.filter(
          listItem => listItem.bookId !== bookId,
        )
        queryCache.setQueryData('list-items', originalListItems)
      },
      onSettled: () => queryCache.invalidateQueries('list-items'),
      ...options,
    },
  )
}

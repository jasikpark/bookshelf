import invariant from 'tiny-invariant'
import {useQuery} from 'react-query'
import {client} from './api-client.exercise'

/**
 *
 * @typedef {{ token: string }} User
 */

/**
 *
 * @param {string} bookId
 * @param {User} user
 */
export function useBook(bookId, user) {
  invariant(user?.token, '`user.token` required for auth')
  invariant(bookId, '`bookId` is a required argument')
  return useQuery(['book', {bookId}], async () =>
    client(`books/${bookId}`, {token: user.token}),
  )
}

/**
 *
 * @param {string} query
 * @param {User} user
 */
export function useBookSearch(query, user) {
  invariant(user?.token, '`user.token` required for auth')
  invariant(query, '`query` is a required argument')
  return useQuery(['bookSearch', {query}], async () =>
    client(`books?query=${encodeURIComponent(query)}`, {
      token: user.token,
    }).then(data => data.books),
  )
}

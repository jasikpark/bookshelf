import invariant from 'tiny-invariant'
import {useQuery} from 'react-query'
import {client} from './api-client.exercise'
import {queryCache} from 'react-query/dist/react-query.development'

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
function bookSearchFetch(query, user) {
  invariant(user?.token, '`user.token` required for auth')
  invariant(typeof query === 'string', '`query` is a required argument')
  return client(`books?query=${encodeURIComponent(query)}`, {
    token: user.token,
  }).then(data => data.books)
}

export function setQueryDataForBook(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}

/**
 *
 * @param {string} query
 * @param {User} user
 */
export function useBookSearch(query, user) {
  invariant(user?.token, '`user.token` required for auth')
  invariant(typeof query === 'string', '`query` is a required argument')
  return useQuery(['bookSearch', {query}], () => bookSearchFetch(query, user), {
    onSuccess: books => {
      for (const book in books) {
        setQueryDataForBook(book)
      }
    },
  })
}

/**
 *
 * @param {string} query
 * @param {User} user
 */
export async function refetchBooksSearchQuery(query = '', user) {
  invariant(user?.token, '`user.token` required for auth')
  // invariant(typeof query === 'string', '`query` is a required argument')
  queryCache.removeQueries('bookSearch')
  await queryCache.prefetchQuery(
    ['bookSearch', {query}],
    () => bookSearchFetch(query, user),
    {
      onSuccess: books => {
        for (const book in books) {
          setQueryDataForBook(book)
        }
      },
    },
  )
}

// 🐨 we're going to use React hooks in here now so we'll need React
import * as React from 'react'
import {useQuery, queryCache} from 'react-query'
// 🐨 get AuthContext from context/auth-context
import {useAuthenticatedClient} from 'context/auth-context'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

// 🦉 note that this is *not* treated as a hook and is instead called by other hooks
// So we'll continue to accept the user here.
const getBookSearchConfig = (query, authenticatedClient) => ({
  queryKey: ['bookSearch', {query}],
  queryFn: () =>
    authenticatedClient(`books?query=${encodeURIComponent(query)}`).then(
      data => data.books,
    ),
  config: {
    onSuccess(books) {
      for (const book of books) {
        setQueryDataForBook(book)
      }
    },
  },
})

// 💣 remove the user argument here
function useBookSearch(query) {
  const authenticatedClient = useAuthenticatedClient()
  const result = useQuery(getBookSearchConfig(query, authenticatedClient))
  return {...result, books: result.data ?? loadingBooks}
}

// 💣 remove the user argument here
function useBook(bookId) {
  const authenticatedClient = useAuthenticatedClient()
  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      authenticatedClient(`books/${bookId}`).then(data => data.book),
  })
  return data ?? loadingBook
}

function useRefetchBookSearchQuery() {
  const authenticatedClient = useAuthenticatedClient()
  return React.useCallback(async () => {
    queryCache.removeQueries('bookSearch')
    await queryCache.prefetchQuery(getBookSearchConfig('', authenticatedClient))
  }, [authenticatedClient])
}

const bookQueryConfig = {
  staleTime: 1000 * 60 * 60,
  cacheTime: 1000 * 60 * 60,
}

function setQueryDataForBook(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book, bookQueryConfig)
}

export {useBook, useBookSearch, useRefetchBookSearchQuery, setQueryDataForBook}

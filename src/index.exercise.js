import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import {createRoot} from 'react-dom/client'
import {App} from './app'
import {ReactQueryConfigProvider} from 'react-query'

const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    useErrorBoundary: true,
    /**
     *
     * @param {number} failureCount
     * @param {unknown} error
     * @returns {boolean}
     */
    retry: (failureCount, error) => {
      if (failureCount > 2) {
        return false
      }
      if (error.status === 404) {
        return false
      }
      return true
    },
  },
}

// ignore the rootRef in this file. I'm just doing it here to make
// the tests I write to check your work easier.
export const rootRef = {}
loadDevTools(() => {
  const root = createRoot(document.getElementById('root'))
  root.render(
    <ReactQueryConfigProvider config={queryConfig}>
      <App />
    </ReactQueryConfigProvider>,
  )
  rootRef.current = root
})

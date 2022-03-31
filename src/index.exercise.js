// 🐨 you'll need to import React and ReactDOM up here
import * as React from 'react'
import * as ReactDOM from 'react-dom'
// 🐨 you'll also need to import the Logo component from './components/logo'
import {Logo} from './components/logo'
// 🐨 create an App component here and render the logo, the title ("Bookshelf"), a login button, and a register button.
// 🐨 for fun, you can add event handlers for both buttons to alert that the button was clicked

import {Dialog} from '@reach/dialog'
import '@reach/dialog/styles.css'

function LoginForm({onSubmit, buttonText = 'Login'}) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input name="email" type="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
      <button type="submit">{buttonText}</button>
    </form>
  )
}

function App() {
  const [modalState, setModalState] = React.useState('none')
  const close = () => setModalState('none')

  const handleSubmit = event => {
    event.preventDefault()
    console.log(event.target.elements.email.value)
  }
  return (
    <>
      <Logo />
      <h1>Bookshelf</h1>
      <button type="button" onClick={() => setModalState('login')}>
        Login
      </button>
      <Dialog aria-label="Login form" isOpen={modalState === 'login'}>
        <LoginForm onSubmit={handleSubmit} />
        <button className="close-button" aria-label="close" onClick={close}>
          <span aria-hidden>×</span>
        </button>
      </Dialog>
      <button type="button" onClick={() => setModalState('register')}>
        Register
      </button>
      <Dialog aria-label="Registration form" isOpen={modalState === 'register'}>
        <LoginForm onSubmit={handleSubmit} buttonText="Register" />
        <button className="close-button" aria-label="close" onClick={close}>
          <span aria-hidden>×</span>
        </button>
      </Dialog>
    </>
  )
}
// 🐨 use ReactDOM to render the <App /> to the root element
// 💰 find the root element with: document.getElementById('root')
ReactDOM.render(<App />, document.getElementById('root'))

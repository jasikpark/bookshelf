// 🐨 you'll want a fake user to register as:
import {buildUser, buildBook} from '../support/generate'
import faker from 'faker'

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    // 🐨 create a fake user
    const user = buildUser()
    // 🐨 visit '/' (📜 https://docs.cypress.io/api/commands/visit.html)
    cy.visit('/')
    // 🐨 find the button named "register" and click it
    cy.findByRole('button', {name: /register/i}).click()
    // 🐨 within the "dialog" find the username and password fields,
    //    type into them the values for your fake user, then click the register
    //    button to submit the form
    // 📜 https://docs.cypress.io/api/commands/within.html#Syntax
    // 📜 https://docs.cypress.io/api/commands/type.html#Syntax
    cy.findByRole('dialog').within($dialog => {
      cy.findByRole('textbox', {name: /username/i}).type(user.username)
      cy.findByLabelText(/password/i).type(user.password)
      cy.findByRole('button', {name: /register/i}).click()
    })
    // 🐨 within the "navigation", find the link named "discover" and click it
    cy.findByRole('navigation').within($navigation => {
      cy.findByRole('link', {name: /discover/i}).click()
    })
    // 🐨 within the "main", type in the "searchbox" the title of a book and hit enter
    //   💰 when using "type" you can make it hit the enter key with "{enter}"
    //   🐨 within the listitem with the name of your book, find the button
    //      named "add to list" and click it.
    cy.findByRole('main').within(() => {
      const bookTitle = 'How to Be an Antiracist'
      cy.findByRole('searchbox', {name: /search/i}).type(`${bookTitle}{enter}`)
      cy.findByRole('listitem', {name: new RegExp(bookTitle, 'i')}).within(
        () => {
          cy.findByRole('button', {name: /add to list/i}).click()
        },
      )
    })
    // 🐨 click the reading list link in the navigation
    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /reading list/i}).click()
    })
    // 🐨 ensure the "main" only has one element "listitem"
    //   💰 https://docs.cypress.io/api/commands/should.html (.should('have.length', 1))
    //   🐨 click the link with the name of the book you added to the list to go to the book's page
    cy.findByRole('main').within(() => {
      const bookTitle = 'How to Be an Antiracist'
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('listitem').within(() => {
        cy.findByRole('link', {name: new RegExp(bookTitle, 'i')}).click()
      })
    })
    // 🐨 type in the notes textbox
    // The textbox is debounced, so the loading spinner won't show up immediately
    // so to make sure this is working, we need to wait for the spinner to show up
    // and *then* wait for it to go away.
    // 🐨 wait for the loading spinner to show up (💰 .should('exist'))
    // 🐨 wait for the loading spinner to go away (💰 .should('not.exist'))
    cy.findByRole('main').within(() => {
      const fakeNote = faker.lorem.words()
      cy.findByRole('textbox', {name: /notes/i}).type(fakeNote)
      cy.findByLabelText(/loading/i).should('exist')
      cy.findByLabelText(/loading/i).should('not.exist')
      cy.findByRole('textbox', {name: /notes/i}).should('have.value', fakeNote)
    })
    // 🐨 mark the book as read
    cy.findByRole('main').within(() => {
      cy.findByRole('button', {name: /mark as read/i}).dblclick()
      cy.findByRole('button', {name: /mark as unread/i}).should('exist')
      cy.findByLabelText(/start and finish date/i).should('exist')
    })
    // the radio buttons are fancy and the inputs themselves are visually hidden
    // in favor of nice looking stars, so we have to the force option to click.
    // 📜 https://docs.cypress.io/api/commands/click.html#Arguments
    // 🐨 click the 5 star rating radio button
    cy.findByRole('main').within(() => {
      cy.findByRole('radio', {name: /5 stars/i}).click({force: true})
    })
    // 🐨 navigate to the finished books page
    //
    // 🐨 make sure there's only one listitem here (within "main")
    // 🐨 make sure the 5 star rating radio button is checked
    // 🐨 click the link for your book to go to the books page again
    //
    // 🐨 remove the book from the list
    // 🐨 ensure the notes textbox and the rating radio buttons are gone
    //
    // 🐨 navigate back to the finished books page
    //
    // 🐨 ensure there are no books in the list
  })
})

/// <reference types="cypress" />

// ***********************************************
// Custom commands for Lumosity Leaderboard tests
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via the UI
       * @example cy.login('test@example.com', 'password123')
       * @example cy.login('testuser', 'password123')
       */
      login(identifier: string, password: string): Chainable<void>
      
      /**
       * Custom command to register a new user via the UI
       * @example cy.register('testuser', 'test@example.com', 'password123')
       */
      register(username: string, email: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (identifier: string, password: string) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(identifier)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Register command
Cypress.Commands.add('register', (username: string, email: string, password: string) => {
  cy.visit('/register')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Logout command
Cypress.Commands.add('logout', () => {
  // Click on user menu to open dropdown
  cy.get('button').contains(/^[A-Z]{1,2}$/).click()
  // Click sign out
  cy.contains('Sign Out').click()
})

export {}

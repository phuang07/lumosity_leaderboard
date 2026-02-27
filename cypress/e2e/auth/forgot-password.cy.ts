/// <reference types="cypress" />

describe('Forgot Password', () => {
  const testUser = {
    username: `forgotpw_${Date.now()}`,
    email: `forgotpw_${Date.now()}@example.com`,
    password: 'testpassword123',
  }

  before(() => {
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.visit('/login')
  })

  describe('Forgot Password Link', () => {
    it('should have a link to forgot password page from login', () => {
      cy.contains('Forgot password?').click()
      cy.url().should('include', '/forgot-password')
    })

    it('should display forgot password form', () => {
      cy.visit('/forgot-password')
      cy.contains('Forgot password?').should('be.visible')
      cy.contains('Enter your email').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Send reset link')
    })
  })

  describe('Forgot Password Flow', () => {
    it('should show success message and reset link in dev mode after submitting email', () => {
      cy.visit('/forgot-password')
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('button[type="submit"]').click()

      cy.contains('Check your email').should('be.visible')
      // In development mode, the reset link is shown
      cy.contains('reset-password', { matchCase: false }).should('be.visible')
    })

    it('should allow resetting password via the reset link', () => {
      // First request a reset
      cy.visit('/forgot-password')
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('button[type="submit"]').click()

      // Get the reset link from the page (dev mode shows it)
      cy.get('a[href*="reset-password"]').invoke('attr', 'href').then((href) => {
        expect(href).to.include('/reset-password')
        expect(href).to.include('token=')

        // Visit the reset link
        cy.visit(href!)
        cy.contains('Reset password').should('be.visible')
        cy.get('input[name="password"]').type('newpassword456')
        cy.get('button[type="submit"]').click()

        cy.contains('Password reset').should('be.visible')
        cy.contains('Sign In').should('be.visible')
      })
    })

    it('should allow login with new password after reset', () => {
      // Request reset and complete it
      cy.visit('/forgot-password')
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('button[type="submit"]').click()

      cy.get('a[href*="reset-password"]').invoke('attr', 'href').then((href) => {
        cy.visit(href!)
        cy.get('input[name="password"]').type('newpassword456')
        cy.get('button[type="submit"]').click()

        // Wait for success and click Sign In
        cy.contains('Sign In').click()
        cy.url().should('include', '/login')

        // Login with new password
        cy.get('input[name="email"]').type(testUser.email)
        cy.get('input[name="password"]').type('newpassword456')
        cy.get('button[type="submit"]').click()

        cy.url().should('include', '/dashboard')
        cy.contains(testUser.username).should('be.visible')
      })
    })
  })

  describe('Reset Password Page', () => {
    it('should show invalid link message when token is missing', () => {
      cy.visit('/reset-password')
      cy.contains('Invalid reset link').should('be.visible')
      cy.contains('Request new link').should('be.visible')
    })

    it('should show invalid link message for invalid token', () => {
      cy.visit('/reset-password?token=invalid-token-12345')
      cy.get('input[name="password"]').type('newpassword123')
      cy.get('button[type="submit"]').click()
      cy.contains('Invalid or expired').should('be.visible')
    })
  })
})

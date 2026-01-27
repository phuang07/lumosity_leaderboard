/// <reference types="cypress" />

describe('User Login', () => {
  // Generate unique test user for each test run
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: 'testpassword123'
  }

  before(() => {
    // Register a test user before running login tests
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('button[type="submit"]').click()
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard')
    
    // Logout to prepare for login tests
    cy.clearCookies()
  })

  beforeEach(() => {
    // Start each test from the login page
    cy.visit('/login')
  })

  describe('Login Page UI', () => {
    it('should display the login form', () => {
      // Check page title/header
      cy.contains('Welcome Back').should('be.visible')
      cy.contains('Sign in to continue').should('be.visible')
      
      // Check form elements exist
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Sign In')
      
      // Check links
      cy.contains('Create Account').should('be.visible')
      cy.contains("Don't have an account?").should('be.visible')
    })

    it('should have a link to register page', () => {
      cy.contains('Create Account').click()
      cy.url().should('include', '/register')
    })
  })

  describe('Login Validation', () => {
    it('should show error for invalid email format', () => {
      cy.get('input[name="email"]').type('invalidemail')
      cy.get('input[name="password"]').type('somepassword')
      cy.get('button[type="submit"]').click()
      
      // Browser validation should prevent submission or show error
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should show error for empty password', () => {
      cy.get('input[name="email"]').type('test@example.com')
      // Don't fill password
      cy.get('button[type="submit"]').click()
      
      // Browser validation should prevent submission
      cy.get('input[name="password"]:invalid').should('exist')
    })

    it('should show error for incorrect credentials', () => {
      cy.get('input[name="email"]').type('nonexistent@example.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      // Should show error message
      cy.contains('Invalid email or password').should('be.visible')
      
      // Should stay on login page
      cy.url().should('include', '/login')
    })

    it('should show error for wrong password with existing email', () => {
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      // Should show error message
      cy.contains('Invalid email or password').should('be.visible')
    })
  })

  describe('Successful Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      
      // Should show the username in the header
      cy.contains(testUser.username).should('be.visible')
    })

    it('should show loading state during login', () => {
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      
      // Intercept the form action to add delay
      cy.intercept('POST', '**/*', (req) => {
        req.on('response', (res) => {
          res.setDelay(500)
        })
      })
      
      cy.get('button[type="submit"]').click()
      
      // Should show loading text
      cy.contains('Signing In...').should('be.visible')
    })

    it('should persist login session', () => {
      // Login first
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      
      // Wait for redirect
      cy.url().should('include', '/dashboard')
      
      // Reload the page
      cy.reload()
      
      // Should still be on dashboard (not redirected to login)
      cy.url().should('include', '/dashboard')
      cy.contains(testUser.username).should('be.visible')
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      // Login before testing logout
      cy.get('input[name="email"]').type(testUser.email)
      cy.get('input[name="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/dashboard')
    })

    it('should logout successfully', () => {
      // Open user menu dropdown by clicking on the username text
      cy.contains(testUser.username).click()
      
      // Click sign out
      cy.contains('Sign Out').click()
      
      // Should redirect to login page
      cy.url().should('include', '/login')
    })

    it('should not be able to access dashboard after logout', () => {
      // Logout by clicking on username
      cy.contains(testUser.username).click()
      cy.contains('Sign Out').click()
      
      // Try to visit dashboard directly
      cy.visit('/dashboard')
      
      // Should be redirected to login
      cy.url().should('include', '/login')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when accessing dashboard without auth', () => {
      cy.clearCookies()
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should redirect to login when accessing score-entry without auth', () => {
      cy.clearCookies()
      cy.visit('/score-entry')
      cy.url().should('include', '/login')
    })
  })
})

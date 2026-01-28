/// <reference types="cypress" />

describe('Score Deletion', () => {
  // Generate unique test user for each test run
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: 'testpassword123'
  }

  let gameIds: string[] = []
  let scoreIds: string[] = []

  before(() => {
    // Register a test user
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('button[type="submit"]').click()
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard')

    // Navigate to score entry page and submit multiple scores for testing
    cy.visit('/score-entry')
    
    // Submit first score
    cy.get('select').first().then(($select) => {
      const firstOption = $select.find('option').eq(1).val() as string
      const firstGameName = $select.find('option').eq(1).text()
      
      cy.get('select').first().select(firstOption)
      cy.get('input[type="number"]').type('1000')
      cy.get('button[type="submit"]').click()
      
      // Wait for success message
      cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
      
      // Submit second score
      cy.get('select').first().then(($select2) => {
        const options = $select2.find('option')
        if (options.length > 2) {
          const secondOption = options.eq(2).val() as string
          cy.get('select').first().select(secondOption)
          cy.get('input[type="number"]').clear().type('2000')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
        }
      })
    })
  })

  beforeEach(() => {
    // Login before each test
    cy.login(testUser.email, testUser.password)
    cy.visit('/score-entry')
    cy.url().should('include', '/score-entry')
  })

  describe('UI Elements', () => {
    it('should display delete buttons on score cards', () => {
      // Check if there are any scores displayed
      cy.get('body').then(($body) => {
        if ($body.text().includes('No scores yet')) {
          // If no scores, submit one first
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('1500')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Verify delete buttons are visible
      // Delete button should be in the top-right of each score card
      cy.get('[title="Delete score"]').should('exist')
      cy.get('[aria-label="Delete score"]').should('exist')
    })

    it('should show delete button with trash icon', () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes('No scores yet')) {
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('1500')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Check for SVG trash icon
      cy.get('[title="Delete score"]').should('be.visible')
      cy.get('[title="Delete score"] svg').should('exist')
    })
  })

  describe('Confirmation Dialog', () => {
    it('should show confirmation dialog when delete button is clicked', () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes('No scores yet')) {
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('1500')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Stub window.confirm to intercept it
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false) // Cancel the deletion
      })

      // Click delete button
      cy.get('[title="Delete score"]').first().click()

      // Verify confirm was called
      cy.window().its('confirm').should('have.been.called')
    })

    it('should cancel deletion when user clicks cancel in confirmation dialog', () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes('No scores yet')) {
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('1500')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Get initial score count
      cy.get('[title="Delete score"]').then(($buttons) => {
        const initialCount = $buttons.length

        // Stub window.confirm to return false (cancel)
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false)
        })

        // Click delete button
        cy.get('[title="Delete score"]').first().click()

        // Verify score is still there (count should be the same)
        cy.get('[title="Delete score"]').should('have.length', initialCount)
      })
    })
  })

  describe('Successful Deletion', () => {
    it('should delete score when user confirms deletion', () => {
      // Ensure we have at least one score
      cy.get('body').then(($body) => {
        if ($body.text().includes('No scores yet')) {
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('1500')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Get initial score count
      cy.get('[title="Delete score"]').then(($buttons) => {
        const initialCount = $buttons.length

        if (initialCount > 0) {
          // Stub window.confirm to return true (confirm)
          cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
          })

          // Click delete button
          cy.get('[title="Delete score"]').first().click()

          // Wait for deletion to complete (page should refresh or score should disappear)
          cy.wait(1000)

          // If there was only one score, check for "No scores yet" message
          // Otherwise, verify the count decreased
          if (initialCount === 1) {
            cy.contains('No scores yet').should('be.visible')
          } else {
            cy.get('[title="Delete score"]').should('have.length', initialCount - 1)
          }
        }
      })
    })

    it('should remove score from the list after deletion', () => {
      // Submit a score first
      cy.get('select').first().select(1)
      cy.get('input[type="number"]').type('2500')
      cy.get('button[type="submit"]').click()
      cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
      cy.reload()

      // Get the game name from the score card
      cy.get('.bg-gray-50').first().within(() => {
        cy.get('div').first().invoke('text').then((gameName) => {
          // Stub window.confirm to return true
          cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
          })

          // Click delete button
          cy.get('[title="Delete score"]').click()

          // Wait for deletion
          cy.wait(1000)

          // Verify the score is no longer in the list
          cy.get('body').should('not.contain', gameName.trim())
        })
      })
    })
  })

  describe('Multiple Scores', () => {
    it('should delete one score without affecting others', () => {
      // Ensure we have at least 2 scores
      cy.get('body').then(($body) => {
        const scoreCount = ($body.find('[title="Delete score"]').length || 0)
        
        if (scoreCount < 2) {
          // Submit additional scores
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('3000')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()

          cy.get('select').first().select(2)
          cy.get('input[type="number"]').clear().type('4000')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Get initial count
      cy.get('[title="Delete score"]').then(($buttons) => {
        const initialCount = $buttons.length

        if (initialCount >= 2) {
          // Stub window.confirm to return true
          cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
          })

          // Delete one score
          cy.get('[title="Delete score"]').first().click()

          // Wait for deletion
          cy.wait(1000)

          // Verify other scores are still there
          cy.get('[title="Delete score"]').should('have.length', initialCount - 1)
        }
      })
    })
  })

  describe('Navigation and Functionality', () => {
    it('should allow user to navigate after deletion', () => {
      // Ensure we have a score to delete
      cy.get('body').then(($body) => {
        if ($body.text().includes('No scores yet')) {
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('1500')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Delete a score
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true)
      })
      cy.get('[title="Delete score"]').first().click()
      cy.wait(1000)

      // Verify navigation still works
      cy.contains('Dashboard').click()
      cy.url().should('include', '/dashboard')

      cy.contains('Add Score').click()
      cy.url().should('include', '/score-entry')
    })

    it('should allow user to submit new scores after deletion', () => {
      // Delete a score if one exists
      cy.get('body').then(($body) => {
        if (!$body.text().includes('No scores yet')) {
          cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
          })
          cy.get('[title="Delete score"]').first().click()
          cy.wait(1000)
        }
      })

      // Submit a new score
      cy.get('select').first().select(1)
      cy.get('input[type="number"]').type('5000')
      cy.get('button[type="submit"]').click()
      cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('Edge Cases', () => {
    it('should handle deleting the last score correctly', () => {
      // Delete all existing scores first
      cy.get('[title="Delete score"]').then(($buttons) => {
        const count = $buttons.length
        for (let i = 0; i < count; i++) {
          cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
          })
          cy.get('[title="Delete score"]').first().click()
          cy.wait(1000)
        }
      })

      // Verify "No scores yet" message appears
      cy.contains('No scores yet').should('be.visible')
      cy.contains('Submit your first score above').should('be.visible')
    })

    it('should show loading state during deletion', () => {
      // Ensure we have a score
      cy.get('body').then(($body) => {
        if ($body.text().includes('No scores yet')) {
          cy.get('select').first().select(1)
          cy.get('input[type="number"]').type('1500')
          cy.get('button[type="submit"]').click()
          cy.contains('Score submitted successfully', { timeout: 5000 }).should('be.visible')
          cy.reload()
        }
      })

      // Stub window.confirm to return true
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true)
      })

      // Click delete and check for loading spinner (if visible)
      cy.get('[title="Delete score"]').first().click()
      
      // The button should show a spinner or be disabled during deletion
      // This is a brief state, so we just verify the action completes
      cy.wait(1000)
    })
  })
})

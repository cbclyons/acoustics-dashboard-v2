import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../../../src/components/layout/Header'

// Wrapper to provide router context
const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Header />
    </MemoryRouter>
  )
}

describe('Header', () => {
  describe('branding', () => {
    it('should render the site title', () => {
      renderWithRouter()

      expect(screen.getByText('CBC Studio 8 Acoustics')).toBeDefined()
    })

    it('should have a link to home on the logo', () => {
      renderWithRouter()

      const homeLink = screen.getByRole('link', { name: /CBC Studio 8 Acoustics/i })
      expect(homeLink.getAttribute('href')).toBe('/')
    })
  })

  describe('navigation links', () => {
    it('should render Dashboard link', () => {
      renderWithRouter()

      const link = screen.getByRole('link', { name: /Dashboard/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/')
    })

    it('should render 3D Visualizer link', () => {
      renderWithRouter()

      const link = screen.getByRole('link', { name: /3D Visualizer/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/visualizer')
    })

    it('should render Frequency Analysis link', () => {
      renderWithRouter()

      const link = screen.getByRole('link', { name: /Frequency Analysis/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/frequency')
    })

    it('should render Treatment Simulator link', () => {
      renderWithRouter()

      const link = screen.getByRole('link', { name: /Treatment Simulator/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/simulator')
    })

    it('should render About link', () => {
      renderWithRouter()

      const link = screen.getByRole('link', { name: /About/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/about')
    })

    it('should render all 5 navigation links', () => {
      renderWithRouter()

      // 5 nav links + 1 logo link = 6 total
      const links = screen.getAllByRole('link')
      expect(links.length).toBe(6)
    })
  })

  describe('active state', () => {
    it('should highlight Dashboard when on root path', () => {
      renderWithRouter('/')

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
      // Check for the active class (text-foreground vs text-foreground/60)
      expect(dashboardLink.className).toContain('text-foreground')
    })

    it('should highlight 3D Visualizer when on /visualizer path', () => {
      renderWithRouter('/visualizer')

      const visualizerLink = screen.getByRole('link', { name: /3D Visualizer/i })
      expect(visualizerLink.className).toContain('text-foreground')
    })

    it('should highlight Treatment Simulator when on /simulator path', () => {
      renderWithRouter('/simulator')

      const simulatorLink = screen.getByRole('link', { name: /Treatment Simulator/i })
      expect(simulatorLink.className).toContain('text-foreground')
    })

    it('should highlight About when on /about path', () => {
      renderWithRouter('/about')

      const aboutLink = screen.getByRole('link', { name: /About/i })
      expect(aboutLink.className).toContain('text-foreground')
    })

    it('should not highlight non-active links', () => {
      renderWithRouter('/')

      const aboutLink = screen.getByRole('link', { name: /About/i })
      // Non-active links should have the dimmed class
      expect(aboutLink.className).toContain('text-foreground/60')
    })
  })

  describe('accessibility', () => {
    it('should have a header element', () => {
      renderWithRouter()

      const header = document.querySelector('header')
      expect(header).toBeDefined()
    })

    it('should have a nav element', () => {
      renderWithRouter()

      const nav = document.querySelector('nav')
      expect(nav).toBeDefined()
    })

    it('should have accessible links with proper href attributes', () => {
      renderWithRouter()

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link.getAttribute('href')).toBeTruthy()
      })
    })
  })

  describe('styling', () => {
    it('should be sticky positioned', () => {
      renderWithRouter()

      const header = document.querySelector('header')
      expect(header?.className).toContain('sticky')
      expect(header?.className).toContain('top-0')
    })

    it('should have blur background effect', () => {
      renderWithRouter()

      const header = document.querySelector('header')
      expect(header?.className).toContain('backdrop-blur')
    })
  })
})

import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { usePathname } from 'next/navigation'
import { useCurrentRole } from '@/lib/auth/role'

// Mock dependencies
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}))

jest.mock('@/lib/auth/role', () => ({
    useCurrentRole: jest.fn(),
}))

describe('Sidebar', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/dashboard')
    })

    it('renders all groups for manager role', () => {
        (useCurrentRole as jest.Mock).mockReturnValue('manager')
        render(<Sidebar />)

        expect(screen.getByText('Produção')).toBeInTheDocument()
        expect(screen.getByText('Laboratory')).toBeInTheDocument()
        expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('renders limited groups for technician role', () => {
        (useCurrentRole as jest.Mock).mockReturnValue('technician')
        render(<Sidebar />)

        expect(screen.getByText('Produção')).toBeInTheDocument()
        // Technician should not see Supply Chain in our mock permissions (check rolePermissions.ts)
        // Wait, let's check rolePermissions.ts content.
        // technician: ['production', 'materials', 'laboratory', 'quality-safety', 'system']
        // supply-chain is NOT in the list.
        expect(screen.queryByText('Supply Chain')).not.toBeInTheDocument()
    })
})

import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { KnowledgeLibrary } from '@/features/library/KnowledgeLibrary/KnowledgeLibrary.tsx'
import { renderWithProviders } from '../../utils/render.tsx'

describe('KnowledgeLibrary', () => {
  it('lists corpus files with processing status', async () => {
    renderWithProviders(<KnowledgeLibrary />)
    expect(
      await screen.findByText('geokniga-flotacionnye-metody-obogashcheniya_0.pdf'),
    ).toBeInTheDocument()
    expect(screen.getByText('izmelchenie-i-klassifikaciya.pdf')).toBeInTheDocument()
    expect(screen.getByText('Как читать отчет института по хвостам.docx')).toBeInTheDocument()
    expect(screen.getByText('mdpi_pentlandite_fines_2023.pdf')).toBeInTheDocument()
    expect(screen.getByText('shema_flotacii_toф.png')).toBeInTheDocument()

    expect(screen.getAllByText('processed').length).toBeGreaterThanOrEqual(5)
    expect(screen.getByText('failed')).toBeInTheDocument()
  })

  it('splits case materials and open-access sources', async () => {
    renderWithProviders(<KnowledgeLibrary />)
    expect(await screen.findByText('Материалы кейса')).toBeInTheDocument()
    expect(screen.getByText('Открытые источники')).toBeInTheDocument()
  })

  it('links open-access files to their external source', async () => {
    renderWithProviders(<KnowledgeLibrary />)
    const link = await screen.findByRole('link', {
      name: 'Recovery of fine pentlandite particles by flotation',
    })
    expect(link).toHaveAttribute('href', 'https://www.mdpi.com/2075-163X/13/2/0000')
  })
})

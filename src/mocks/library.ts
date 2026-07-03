export type LibraryFileStatus = 'processed' | 'failed'

export type CorpusKind = 'case' | 'open'

export interface LibraryFile {
  name: string
  documentId: string | null
  status: LibraryFileStatus
  factsCount: number
  kind: CorpusKind
}

export interface LibraryMock {
  folder: string
  files: LibraryFile[]
  typeCounts: { label: string; count: number }[]
}

export const libraryMock: LibraryMock = {
  folder: 'norn-hack/Дополнительные материалы',
  files: [
    {
      name: 'geokniga-flotacionnye-metody-obogashcheniya_0.pdf',
      documentId: 'doc_flotation_methods',
      status: 'processed',
      factsCount: 6,
      kind: 'case',
    },
    {
      name: 'izmelchenie-i-klassifikaciya.pdf',
      documentId: 'doc_grinding_classification',
      status: 'processed',
      factsCount: 5,
      kind: 'case',
    },
    {
      name: 'Как читать отчет института по хвостам.docx',
      documentId: 'doc_tails_manual',
      status: 'processed',
      factsCount: 3,
      kind: 'case',
    },
    {
      name: 'mdpi_pentlandite_fines_2023.pdf',
      documentId: 'doc_mdpi_fines',
      status: 'processed',
      factsCount: 1,
      kind: 'open',
    },
    {
      name: 'mdpi_liberation_2022.pdf',
      documentId: 'doc_mdpi_liberation',
      status: 'processed',
      factsCount: 1,
      kind: 'open',
    },
    {
      name: 'shema_flotacii_toф.png',
      documentId: null,
      status: 'failed',
      factsCount: 0,
      kind: 'case',
    },
  ],
  typeCounts: [
    { label: 'PDF', count: 4 },
    { label: 'DOCX', count: 1 },
    { label: 'PNG', count: 1 },
  ],
}

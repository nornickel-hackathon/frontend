import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, createHttpClient } from '@/api.ts'
import type { BoardResponse } from '@/contracts.ts'
import boardFixture from '@/mocks/fixtures/board.json'

const board = boardFixture as unknown as BoardResponse

describe('fixture api client', () => {
  beforeEach(async () => {
    await api.resetRun('kgmk')
  })

  it('returns the kgmk board with six hypotheses', async () => {
    const board = await api.getBoard('kgmk')
    expect(board).not.toBeNull()
    expect(board?.hypotheses).toHaveLength(6)
  })

  it('has no board for factories other than kgmk', async () => {
    expect(await api.getBoard('tof')).toBeNull()
  })

  it('serves tof diagnostics including the pyrrhotite section', async () => {
    const diagnostics = await api.getDiagnostics('tof')
    expect(diagnostics.sections).toContain('pyrrhotite')
  })

  it('recomputes value ranges on rerun without changing the snapshot hash', async () => {
    const before = await api.getBoard('kgmk')
    const beforeHyp = before?.hypotheses.find((h) => h.id === 'hyp_001')
    expect(beforeHyp).toBeDefined()

    const next = await api.rerun('kgmk', {
      kind: 'change_price',
      payload: { element: 'element_28', usd_per_t: 33000 },
    })
    expect(next).not.toBeNull()
    const afterHyp = next?.hypotheses.find((h) => h.id === 'hyp_001')
    expect(afterHyp).toBeDefined()
    expect(afterHyp?.economic_effect.value_usd_range).not.toEqual(
      beforeHyp?.economic_effect.value_usd_range,
    )
    expect(next?.snapshot.hash).toBe(before?.snapshot.hash)
  })

  it('serves the expert hypothesis pack', async () => {
    const experts = await api.getExpertHypotheses()
    expect(experts).toHaveLength(27)
    expect(experts.some((e) => e.id === 'kgmk_h3')).toBe(true)
  })
})

function jsonResponse(body: unknown): Response {
  return { ok: true, json: () => Promise.resolve(body) } as unknown as Response
}

describe('http api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('runs a fresh board then reuses run_id on the next getBoard', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockImplementation((input, init) => {
      const url = String(input)
      if (init?.method === 'POST' && url.includes('/run')) {
        return Promise.resolve(jsonResponse({ run_id: 'r1', board }))
      }
      return Promise.resolve(jsonResponse(board))
    })

    const client = createHttpClient('http://x')
    const first = await client.getBoard('kgmk')
    expect(first?.hypotheses).toHaveLength(6)

    const second = await client.getBoard('kgmk')
    expect(second?.hypotheses).toHaveLength(6)

    const boardCall = fetchMock.mock.calls.find(([input]) => String(input).includes('/board'))
    expect(boardCall).toBeDefined()
    expect(String(boardCall?.[0])).toContain('run_id=r1')
  })

  it('falls back to fixture data and warns when the backend throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))

    const client = createHttpClient('http://x')
    const result = await client.getBoard('kgmk')

    expect(result).not.toBeNull()
    expect(result?.hypotheses).toHaveLength(6)
    expect(warnSpy).toHaveBeenCalled()
  })
})

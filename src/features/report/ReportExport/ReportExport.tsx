import { useQuery } from '@tanstack/react-query'
import type { GraphNode, Hypothesis } from '@/contracts.ts'
import { api } from '@/api.ts'
import { useFactory } from '@/app/factory.tsx'
import { Button } from '@/components/Button/Button.tsx'
import { Panel } from '@/components/Panel/Panel.tsx'
import { refetchAll } from '@/components/QueryBoundary/QueryBoundary.tsx'
import { ErrorState, LoadingState } from '@/components/QueryState/QueryState.tsx'
import { RunPendingState } from '@/components/RunPendingState/RunPendingState.tsx'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge.tsx'
import { useT } from '@/i18n/index.tsx'
import { capexClassOf } from '@/lib/capex.ts'
import { byRank } from '@/lib/domain.ts'
import { downloadCsv, downloadJson } from '@/lib/download.ts'
import { formatHypId, formatUsdRange } from '@/lib/format.ts'
import { safeHref } from '@/lib/url.ts'
import styles from './ReportExport.module.css'

function csvCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${guarded.replace(/"/g, '""')}"`
}

function buildCsv(columns: string[], hypotheses: Hypothesis[], entities: GraphNode[]): string {
  const header = columns.join(',')
  const rows = byRank(hypotheses).map((h) => {
    const [lo, hi] = h.economic_effect.value_usd_range
    const cells = [
      String(h.rank),
      csvCell(h.id),
      csvCell(h.title),
      csvCell(h.status),
      String(lo),
      String(hi),
      String(h.economic_effect.addressable_tons.element_28 ?? 0),
      String(capexClassOf(h, entities)),
      String(h.score_total),
      csvCell(h.expert_match?.expert_hypothesis_id ?? ''),
    ]
    return cells.join(',')
  })
  return [header, ...rows].join('\n')
}

export function ReportExport() {
  const t = useT()
  const { factory } = useFactory()
  const board = useQuery({ queryKey: ['board', factory], queryFn: () => api.getBoard(factory) })
  const extract = useQuery({ queryKey: ['extract'], queryFn: api.getExtract })

  if (board.isPending || extract.isPending) {
    return <LoadingState />
  }
  if (board.isError || extract.isError) {
    return <ErrorState onRetry={() => refetchAll([board, extract])} />
  }

  if (board.data === null) {
    return <RunPendingState />
  }

  const boardData = board.data
  const hypotheses = byRank(boardData.hypotheses)

  const handleExportJson = () => {
    downloadJson(`board_${factory}.json`, boardData)
  }
  const handleExportCsv = () => {
    downloadCsv(
      `board_${factory}.csv`,
      buildCsv(t.report.columns, boardData.hypotheses, extract.data.entities),
    )
  }

  return (
    <div className={styles.screen}>
      <div className={styles.columns}>
        <Panel bar className={styles.report}>
          <h2 className={styles.reportName}>{t.report.reportName}</h2>
          <ul className={styles.hypList}>
            {hypotheses.map((h) => (
              <li key={h.id} className={styles.hypRow}>
                <span className={styles.hypId}>{formatHypId(h.id)}</span>
                <span className={styles.hypTitle}>{h.title}</span>
                <span className={styles.hypValue}>
                  {formatUsdRange(h.economic_effect.value_usd_range, t.units)}
                </span>
                <StatusBadge status={h.status} />
              </li>
            ))}
          </ul>
          <div className={styles.sources}>
            <span className={styles.sourcesTitle}>{t.common.source}</span>
            <ul className={styles.sourceList}>
              {extract.data.documents.map((doc) => {
                const href = safeHref(doc.source_url)
                return (
                  <li key={doc.id}>
                    {href !== null ? (
                      <a href={href} target="_blank" rel="noreferrer">
                        {doc.title}
                      </a>
                    ) : (
                      `${doc.title} (${t.common.internalDocument})`
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </Panel>
        <div className={styles.aside}>
          <Button variant="primary" onClick={handleExportJson}>
            {t.report.exportJson}
          </Button>
          <Button onClick={handleExportCsv}>{t.report.exportCsv}</Button>
        </div>
      </div>
    </div>
  )
}

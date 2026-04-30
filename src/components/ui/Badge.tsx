import { badge } from '@/lib/utils'
export default function Badge({ status }: { status: string }) {
  return <span className={badge(status)}>{status.replace(/_/g, ' ')}</span>
}

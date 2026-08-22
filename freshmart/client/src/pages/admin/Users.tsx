import { useEffect, useState } from 'react'
import { Search, Users as UsersIcon, ShieldCheck, User } from 'lucide-react'
import { adminApi } from '@/services'
import type { AdminUser } from '@/types'
import { formatDate, classNames } from '@/utils/format'
import { Input } from '@/components/ui/Input'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = (query = q, p = page) => {
    setLoading(true)
    adminApi
      .users({ page: p, q: query || undefined })
      .then(({ data }) => {
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(q, page)
  }, [page])

  const toggleActive = async (u: AdminUser) => {
    setBusyId(u._id)
    try {
      await adminApi.updateUserStatus(u._id, !u.isActive)
      toastSuccess(u.isActive ? 'User suspended' : 'User activated')
      load()
    } catch (err) {
      toastError(err, 'Could not update user')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white">Customers</h1>
      <p className="mt-1 text-sm text-gray-400">Manage customer accounts.</p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search name, email or phone..."
          className="pl-10"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            clearTimeout((window as any).__usrT)
            ;(window as any).__usrT = setTimeout(() => load(e.target.value, 1), 350)
          }}
        />
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No customers" description="Users who sign up will appear here." />
      ) : (
        <div className="card mt-6 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Contact</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500/15 text-xs font-bold text-leaf-100">
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 font-semibold text-white">
                            {u.name}
                            {u.role === 'ADMIN' && <ShieldCheck className="h-3.5 w-3.5 text-leaf-500" />}
                          </p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{u.phone ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={classNames('rounded-full px-2.5 py-1 text-[10px] font-bold', u.role === 'ADMIN' ? 'bg-leaf-500/10 text-leaf-500' : 'bg-sky-500/10 text-sky-400')}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="h-3.5 w-3.5" /> Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={busyId === u._id}
                          className={classNames(
                            'rounded-full px-3 py-1 text-[10px] font-bold transition-colors disabled:opacity-40',
                            u.isActive
                              ? 'bg-leaf-500/10 text-leaf-500 hover:bg-leaf-500/20'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
                          )}
                        >
                          {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={classNames(
                'h-9 w-9 rounded-lg text-sm font-semibold transition-colors',
                page === i + 1 ? 'bg-leaf-500 text-leaf-950' : 'bg-white/5 text-gray-400 hover:text-white',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
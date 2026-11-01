import { fetchCloudDesigns, fetchSession, pushDesign } from './cloud'
import { loadDesigns, mergeRemoteDesigns } from './storage'

/**
 * Called once on boot: reads the session, pulls this account's designs into the
 * local workspace, then uploads any designs that only exist on this device.
 */
export async function bootstrapCloud(): Promise<void> {
  const user = await fetchSession()
  if (!user) return

  const remote = await fetchCloudDesigns()
  const remoteIds = new Set(remote.map((design) => design.id))
  mergeRemoteDesigns(remote)

  const localOnly = loadDesigns().filter((design) => !remoteIds.has(design.id))
  localOnly.forEach((design) => pushDesign(design))
}

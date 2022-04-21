import Dexie from 'dexie'
import { ProjectData } from './type.d'

const SCHEMA_VERSION = 1

const db = new class WebDAWDB extends Dexie {
  projects: Dexie.Table<ProjectData, string>

  constructor() {
    super("WebDAWDB")
    this.version(SCHEMA_VERSION).stores({
      projects: `&id, last_updated, name`
    })

    this.projects = this.table("projects")
  }
}()

export default db

export async function reset(): Promise<void> {
  db.close()
  await Dexie.delete('WebDAWDB')
  location.href = "/"
}

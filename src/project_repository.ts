import { v4 as uuidv4 } from 'uuid'
import { ProjectData } from './type.d'
import db from './db'

export async function isEmpty(): Promise<boolean> {
  return (await db.projects.count()) === 0
}

export async function getLRU(): Promise<ProjectData | undefined> {
  return db.projects
    .orderBy('last_updated')
    .reverse()
    .first()
}

export function create(): ProjectData {
  return {
    id           : uuidv4(),
    last_updated : undefined,
    thumbnail    : "",
    name         : "新規プロジェクト",
    rhythm       : [4, 4],
    bpm          : 120,
    metronome    : true,
    second_width : 40,
    current_time : 0,
    state        : undefined,
    scroll_width : 0,
    min_width    : 1000,
    tracks       : []
  }
}

export function get(id: string): Promise<ProjectData | undefined> {
  return db.projects.get(id)
}

export function save(project: ProjectData): Promise<string> {
  return db.projects.put(project)
}

export async function search(search_word: string): Promise<ProjectData[]> {
  return db.projects
    .filter(({ name }) => name.includes(search_word))
    .reverse()
    .sortBy('last_updated')
}

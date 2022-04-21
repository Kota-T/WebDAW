import * as repository from './project_repository'

switch(location.pathname) {
  case '/':
    location.href = (await repository.isEmpty()) ? '/new' : `/${(await repository.getLRU()).id}`
    break
  case '/new':
    break
  default:
    const project_id = location.pathname.slice(1)
    const project_data = await repository.get(project_id)
    if(!project_data)
      location.href = '/'
}

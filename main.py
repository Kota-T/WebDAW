import os, json
import tornado.ioloop
import tornado.web
import tornado.websocket

from model import Project

class Team:
    lastId = 0
    teams = []
    def __init__(self, projectData):
        self.id = self.lastId
        self.members = []
        self.project = Project(projectData)
        self.teams.append(self)
        self.lastId += 1

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("frontend/dist/index.html")

class WebDAWHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("opened")

    def on_message(self, msg):
        data = json.loads(msg)
        state = data['state']
        if state == 'shareProject':
            self.team = Team(data['project'])
            self.team.members.append(self)
            self.write_message({'type': "id", 'id': self.team.id})
            print("プロジェクトを共有")
        elif state == 'joinProject':
            try:
                self.team = [team for team in Team.teams if str(team.id) == data['id']][0]
                self.team.members.append(self)
                self.write_message({'type': 'project', 'project': self.team.project.getData()})
                print("プロジェクトに参加")
            except IndexError as e:
                print(e)
                self.write_message({'type': 'error', 'msg': 'invalid project id.'})

    def on_close(self):
        if not hasattr(self, "team"):
            print("self.team is None")
            return
        self.team.members.remove(self)
        if self.team.members == []:
            Team.teams.remove(self.team)

if __name__ == "__main__":
    application = tornado.web.Application([
        (r"/", IndexHandler),
        (r"/websocket", WebDAWHandler),
        (r"/_assets/(.*)", tornado.web.StaticFileHandler, {"path": "frontend/dist/_assets/"})
    ])
    application.listen(int(os.environ.get('PORT', 8888)))
    tornado.ioloop.IOLoop.current().start()

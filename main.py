import os, json
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler, StaticFileHandler
from tornado.websocket import WebSocketHandler

from model import Team


class IndexHandler(RequestHandler):
    def get(self):
        self.render("frontend/dist/index.html")

class WebDAWHandler(WebSocketHandler):
    def open(self):
        print("opened")

    def on_message(self, msg):
        data = json.loads(msg)
        state = data['state']
        if state == 'shareProject':
            self.shareProject(data['project'])
        elif state == 'joinProject':
            self.joinProject(data['id'])
        elif state == 'addTrack':
            self.addTrack(data.get('trackData') or dict())
        elif state == 'removeTrack':
            self.removeTrack(data['index'])
        elif state == 'shareAudio':
            self.shareAudio(data['audioDataArray'])

    def on_close(self):
        if not hasattr(self, "team"):
            print("self.team is None")
            return
        self.team.members.remove(self)
        print("グループから退出")
        if self.team.members == []:
            Team.teams.remove(self.team)
            print("グループを終了")

    def shareProject(self, projectData):
        self.team = Team(projectData)
        self.team.members.append(self)
        self.write_message({'type': "id", 'id': self.team.id})
        print("プロジェクトを共有")

    def joinProject(self, id):
        try:
            self.team = [team for team in Team.teams if str(team.id) == id][0]
            self.team.members.append(self)
            self.write_message({'type': 'project', 'project': self.team.project.getData()})
            print("プロジェクトに参加")
        except IndexError as e:
            print(e)
            self.write_message({'type': 'error', 'msg': 'invalid project id.'})

    def write_message_to_other_members(self, message):
        for member in self.team.members:
            if member != self:
                member.write_message(message)

    def addTrack(self, trackData):
        self.team.project.addTrack(trackData)
        self.write_message_to_other_members({'type': 'addTrack', 'trackData': trackData})
        print("トラックを追加")

    def removeTrack(self, index):
        self.team.project.removeTrack(index)
        self.write_message_to_other_members({'type': 'removeTrack', 'index': index})
        print("トラックを消去")

    def shareAudio(self, audioDataArray):
        self.team.project.addAudio(audioDataArray)
        self.write_message_to_other_members({'type': 'audio', 'audioDataArray': audioDataArray})
        print("オーディオを共有")


if __name__ == "__main__":
    application = Application([
        (r"/", IndexHandler),
        (r"/websocket", WebDAWHandler),
        (r"/(.*)", StaticFileHandler, {"path": "frontend/dist/"})
    ])
    application.listen(int(os.environ.get('PORT', 8888)))
    IOLoop.current().start()

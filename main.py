import os, json
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler, StaticFileHandler
from tornado.websocket import WebSocketHandler

from model import Audio, Track, Team


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
        elif state == 'shareAudio':
            self.shareAudio(data['audioDataArray'])

    def on_close(self):
        if not hasattr(self, "team"):
            print("self.team is None")
            return
        self.team.members.remove(self)
        if self.team.members == []:
            Team.teams.remove(self.team)

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

    def addTrack(self, trackData):
        self.team.project.tracks.append(Track(trackData))
        for member in self.team.members:
            if member != self:
                member.write_message({'type': 'track', 'trackData': trackData})
        print("トラックを追加")

    def shareAudio(self, audioDataArray):
        for audioData in audioDataArray:
            self.team.project.tracks[audioData['index']].audioStack.append(Audio(audioData['data']))
        for member in self.team.members:
            if member != self:
                member.write_message({'type': 'audio', 'audioDataArray': audioDataArray})
        print("オーディオを共有")


if __name__ == "__main__":
    application = Application([
        (r"/", IndexHandler),
        (r"/websocket", WebDAWHandler),
        (r"/(.*)", StaticFileHandler, {"path": "frontend/dist/"})
    ])
    application.listen(int(os.environ.get('PORT', 8888)))
    IOLoop.current().start()

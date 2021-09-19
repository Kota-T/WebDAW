import os, json
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler, StaticFileHandler
from tornado.websocket import WebSocketHandler


class Team:
    lastId = 0
    teams = []
    def __init__(self):
        self.id = Team.lastId
        self.members = []
        Team.teams.append(self)
        Team.lastId += 1

class IndexHandler(RequestHandler):
    def get(self):
        self.render("frontend/dist/index.html")

class DocsHandler(RequestHandler):
    def get(self, title):
        if title == '':
            self.redirect("/docs/explain-parts")
            return
        self.render(f"docs/templates/{title}.html")

class WebDAWHandler(WebSocketHandler):
    def open(self):
        print("接続")
        self.packetIds = {}

    def on_message(self, msg):
        data = json.loads(msg)
        type = data['type']
        if type == "ping":
            self.write_message({'type': 'pong'})
            return
        print("メッセージを受信")
        if type == 'packet':
            packetId = data['packetId']

            #ブラウザで作られたpacketIdが他の人が送信中のものと被っていないかを確かめ、
            #被っていた時はエラーメッセージを送信する
            for member in self.team.members:
                if member != self and member.packetIds.get(packetId) is not None:
                    self.write_message({'type': 'packet_id_overlapped_error'})
                    return

            #self.packetIdsにpacketIdをキーにし、送られてくるpacketの合計数をvalueとして保存し、
            #一つ送られてくるたびにカウントダウン
            if self.packetIds.get(packetId) is None:
                self.packetIds[packetId] = data['numOfPackets']
            else:
                self.packetIds[packetId] -= 1

            #packetにtargetが指定されている時はself.team.membersのtargetのインデックスのものにpacketを送信
            if data.get('target') is None:
                self.write_message_to_other_members(msg)
            else:
                self.team.members[int(data['target'])].write_message(msg)

        elif type == 'startProject':
            self.startProject()
        elif type == 'joinProject':
            self.joinProject(data['id'])
        else:
            if data.get('target') is None:
                self.write_message_to_other_members(msg)
            else:
                self.team.members[int(data['target'])].write_message(msg)

    def on_close(self):
        self.write_message_to_other_members({'type': 'closed', 'msg': 'メンバーが退出しました。'})
        if not hasattr(self, "team"):
            print("self.team is None")
            return
        self.team.members.remove(self)
        print("グループから退出")
        if self.team.members == []:
            Team.teams.remove(self.team)
            print("グループを終了")

    def write_message_to_other_members(self, message):
        for member in self.team.members:
            if member != self:
                member.write_message(message)

    def startProject(self):
        self.team = Team()
        self.team.members.append(self)
        self.write_message({'type': "id", 'id': self.team.id})
        print("プロジェクトを共有")

    def joinProject(self, id):
        try:
            self.team = [team for team in Team.teams if str(team.id) == id][0]
            self.team.members.append(self)
            target = self.team.members.index(self)
            self.team.members[0].write_message({'type': 'joinProject', 'target': target})
            print("プロジェクトに参加")
        except IndexError:
            self.write_message({'type': 'error', 'msg': f'無効なIDです。id: {id}'})
            print("プロジェクトに参加失敗")


if __name__ == "__main__":
    application = Application([
        (r"/", IndexHandler),
        (r"/websocket", WebDAWHandler),
        (r"/docs/static/(.*)", StaticFileHandler, {"path": "docs/static/"}),
        (r"/docs/(.*)", DocsHandler),
        (r"/(.*)", StaticFileHandler, {"path": "frontend/dist/"}),
    ])
    application.listen(int(os.environ.get('PORT', 8888)))
    IOLoop.current().start()

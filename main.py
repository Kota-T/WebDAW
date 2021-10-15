import tempfile, subprocess, base64, os, json, random
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler, StaticFileHandler
from tornado.websocket import WebSocketHandler


class Team:
    teams = {}
    def __init__(self, id):
        if id not in Team.teams:
            Team.teams[id] = self
            self.id = id
            self.members = []
        else:
            raise KeyError(f'Team.teams has id:{id} already.')


class IndexHandler(RequestHandler):
    def get(self):
        self.render("frontend/dist/index.html")

class DocsHandler(RequestHandler):
    def get(self, title):
        if title == '':
            self.redirect("/docs/explain-parts")
            return
        self.render(f"docs/templates/{title}.html")

class TranscodeVideoHandler(RequestHandler):
    def post(self):
        inputFile = tempfile.NamedTemporaryFile()
        outputDir = tempfile.TemporaryDirectory()
        outputFileName = os.path.join(outputDir.name, 'output.mp4')

        inputFile.write(self.request.body)
        inputFile.seek(0)

        subprocess.run(
            f"ffmpeg -i {inputFile.name} -c:v libx264 -vf yadif=0:-1:1 -profile:v baseline -level 3.0 {outputFileName}",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        with open(outputFileName, 'rb') as f:
            self.finish(f.read())

        inputFile.close()
        outputDir.cleanup()

class SplitVideoHandler(RequestHandler):
    def post(self):
        data = json.loads(self.request.body)
        splitTime = data['splitTime']
        videoData = base64.b64decode(data['base64'].encode())

        inputFile = tempfile.NamedTemporaryFile()
        outputDir = tempfile.TemporaryDirectory()
        formerFileName = os.path.join(outputDir.name, 'former.webm')
        latterFileName = os.path.join(outputDir.name, 'latter.webm')

        inputFile.write(videoData)
        inputFile.seek(0)

        subprocess.run(
            f"ffmpeg -i {inputFile.name} -t {splitTime} -c copy {formerFileName}",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        subprocess.run(
            f"ffmpeg -ss {splitTime} -i {inputFile.name} -c copy {latterFileName}",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        resDict = {}
        with open(formerFileName, 'rb') as f:
            resDict['former'] = base64.b64encode(f.read()).decode()
        with open(latterFileName, 'rb') as f:
            resDict['latter'] = base64.b64encode(f.read()).decode()

        self.finish(resDict)


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
        if type == 'startProject':
            self.startProject(data['id'])
            return
        elif type == 'packet':
            packetId = data['packetId']

            #ブラウザで作られたpacketIdが他の人が送信中のものと被っていないかを確かめ、
            #被っていた時はエラーメッセージを送信する
            for member in self.team.members:
                if member != self and member.packetIds.get(packetId) is not None:
                    self.write_message({'type': 'packet_id_overlapped_error'})
                    return

            #self.packetIdsにpacketIdをキーにし、送られてくるpacketの合計数をvalueとして保存し、
            if self.packetIds.get(packetId) is None:
                self.packetIds[packetId] = data['numOfPackets']

            #一つ送られてくるたびにカウントダウン
            self.packetIds[packetId] -= 1

            #カウントが0になった時self.packetIdsから削除
            if self.packetIds[packetId] == 0:
                del self.packetIds[packetId]

        if data.get('target') is None:
            self.write_message_to_other_members(msg)
        else:
            self.team.members[int(data['target'])].write_message(msg)

    def on_close(self):
        if not hasattr(self, "team"):
            return
        self.write_message_to_other_members({'type': 'msg', 'msg': 'メンバーが退出しました。'})
        self.team.members.remove(self)
        print("グループから退出")
        if self.team.members == []:
            del Team.teams[self.team.id]
            print("グループを終了")

    def write_message_to_other_members(self, message):
        for member in self.team.members:
            if member != self:
                member.write_message(message)

    def startProject(self, id):
        if id not in Team.teams:
            self.team = Team(id)
            self.team.members.append(self)
            self.write_message({'type': "startProject"})
            print("プロジェクトを共有")
        else:
            self.team = Team.teams[id]
            self.team.members.append(self)
            target = self.team.members.index(self)
            self.team.members[0].write_message({'type': 'joinProject', 'target': target})
            print("プロジェクトに参加")


if __name__ == "__main__":
    application = Application([
        (r"/", IndexHandler),
        (r"/websocket", WebDAWHandler),
        (r"/transcode-video", TranscodeVideoHandler),
        (r"/split-video", SplitVideoHandler),
        (r"/docs/static/(.*)", StaticFileHandler, {"path": "docs/static/"}),
        (r"/docs/(.*)", DocsHandler),
        (r"/(.*)", StaticFileHandler, {"path": "frontend/dist/"}),
    ])
    application.listen(int(os.environ.get('PORT', 8888)))
    IOLoop.current().start()

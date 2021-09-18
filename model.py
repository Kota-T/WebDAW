import io, math, random, zipfile
from tornado.websocket import WebSocketHandler


class Audio:
    def __init__(self, audioData):
        self.startPoint = audioData['startPoint']
        self.diminished = audioData['diminished']
        self.url        = audioData.get('url')
        self.file       = audioData.get('file')

    def __del__(self):
        if self.file is not None:
            self.file.close()

    def getData(self):
        return {
            'startPoint': self.startPoint,
            'diminished': self.diminished,
            'url'       : self.url,
            'file'      : self.file
        }


class Track:
    def __init__(self, trackData):
        self.name = trackData['name']
        self.gain = trackData['gain']
        self.pan  = trackData['pan']
        self.audioStack = [Audio(audioData) for audioData in trackData['audioStack']]

    def getData(self):
        return {
            'name': self.name,
            'gain': self.gain,
            'pan': self.pan,
            'audioStack': [audio.getData() for audio in self.audioStack]
        }

    def addAudio(self, audioData):
        self.audioStack.append(Audio(audioData))


class Project:
    def __init__(self, projectData):
        self.rhythm = projectData['rhythm']
        self.bpm = projectData['bpm']
        self.beat_interval = projectData['beat_interval']
        self.number_of_bars = projectData['number_of_bars']
        self.tracks = [Track(trackData) for trackData in projectData['tracks']]

    def getData(self):
        return {
            'rhythm': self.rhythm,
            'bpm'   : self.bpm,
            'beat_interval': self.beat_interval,
            'number_of_bars': self.number_of_bars,
            'tracks': [track.getData() for track in self.tracks]
        }

    def setRhythm(self, value):
        self.rhythm = value

    def setBpm(self, value):
        self.bpm = value

    def setBeatInterval(self, value):
        self.beat_interval = value

    def setNumberOfBars(self, value):
        self.number_of_bars = value

    def addTrack(self, trackData):
        self.tracks.append(Track(trackData))

    def removeTrack(self, index):
        self.tracks.pop(index)

    def addAudio(self, audioDataArray):
        for audioData in audioDataArray:
            self.tracks[audioData['index']].addAudio(audioData['data'])


class Team:
    lastId = 0
    teams = []
    def __init__(self, projectData):
        self.id = Team.lastId
        self.members = []
        self.project = Project(projectData)
        Team.teams.append(self)
        Team.lastId += 1

class DataTransferWSHandler(WebSocketHandler):
    def generatePacketId(self):
        ch_list = [chr(ord("a")+i) for i in range(26)] + [chr(ord("A")+i) for i in range(26)] + [str(n) for n in range(10)]
        packetId = ''.join([random.choice(ch_list) for i in range(8)])
        if self.buffer.get(packetId) is not None:
            return self.generatePacketId()
        return packetId

    def collectPackets(self, data):
        if data['type'] == 'packet':
            if self.buffer.get(data['packetId']) is None:
                self.buffer[data['packetId']] = [None for i in range(data['numOfPackets'])]
            self.buffer[data['packetId']][data['index']] = data;

            if all([packet is not None for packet in self.buffer[data['packetId']]]):
                result = ""
                for packet in self.buffer[data['packetId']]:
                    result += packet['body']
                del self.buffer[data['packetId']]

                return json.loads(result)

        return data

    def write_message(self, jsonDict):
        jsonStr = json.dumps(jsonDict)
        if len(jsonStr) > 10000000:
            packetId = self.generatePacketId()
            numOfPackets = math.ceil(len(jsonStr) / 10000000)
            for i in range(numOfPackets):
                start = i * 10000000;
                end = start + 10000000;
                if end > len(jsonStr):
                    end = len(jsonStr)

                super().write_message({
                    'type': 'packet',
                    'packetId': packetId,
                    'numOfPackets': numOfPackets,
                    'index': i,
                    'body': jsonStr[start:end]
                })
        else:
            super().write_message(jsonDict)

    def open(self):
        self.buffer = {}


class WebDAWHandler(DataTransferWSHandler):
    def open(self):
        super().open()
        print("接続")

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

    def on_message(self, msg):
        print("メッセージを受信")
        data = self.collectPackets(json.loads(msg))
        type = data['type']

        if type == 'shareProject':
            self.shareProject(data['project'])
        elif type == 'joinProject':
            self.joinProject(data['id'])
        elif type == 'addTrack':
            self.addTrack(data.get('trackData') or dict())
        elif type == 'removeTrack':
            self.removeTrack(data['index'])
        elif type == 'shareAudio':
            self.shareAudio(data['audioDataArray'])

    def readProjectZip(self, msg):
        data = {}
        with ZipFile(io.BytesIO(msg)) as zip:
            for info in zip.infolist():
                if info.filename == 'config.json':
                    with zip.open(info.filename) as jsonFile:
                        data['config.json'] = json.load(jsonFile)
                elif not info.is_dir():
                    lastDir = data;
                    dirs = info.filename.split('/');
                    filename = dirs.pop();
                    for dir in dirs:
                        if lastDir.get(dir) is None:
                            lastDir[dir] = {}
                        lastDir = lastDir[dir]
                    lastDir[filename] = zip.open(info.filename)
        return data

    def loadProject(self, data):
        projectData = data['config.json']
        for track in projectData['tracks']:
            for i, audio in enumerate(track['audioStack']):
                audio['file'] = data[track['name']][f'{str(i)}.wav']
        self.shareProject(projectData)

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
            self.write_message({'type': 'error', 'msg': f'無効なIDです。id: {id}'})
            print("プロジェクトに参加失敗")

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

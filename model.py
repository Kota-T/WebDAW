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

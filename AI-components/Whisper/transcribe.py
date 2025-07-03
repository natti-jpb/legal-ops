import whisper
from pyannote.audio import Pipeline



def transcribe_audio(audio_file_path: str) -> str:
    import whisper
    model = whisper.load_model("base")
    result = model.transcribe(audio_file_path, verbose=True)
    
    return result

transcribe_audio("/Users/misha/Desktop/Project files/Project/court-trial-transcription (4)/AI-components/Whisper/ytmp3free.cc_simple-trick-to-keep-a-conversation-going-youtubemp3free.org.mp3")
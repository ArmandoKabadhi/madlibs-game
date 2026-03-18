import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  @ViewChild('backgroundMusic') backgroundMusicRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('buttonSound') buttonSoundRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('scarySound') scarySoundRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('screamSound') screamSoundRef!: ElementRef<HTMLAudioElement>;

  noun = '';
  verb = '';
  adjective = '';
  place = '';

  result = 'Your funny story will appear here...';
  score = 0;

  isLoading = false;
  isTyping = false;
  scaryMode = false;
  showWarningPopup = false;

  calmMusicStarted = false;
  scaryLoopActive = false;

  allowOneLastStory = false;
  finalScarePending = false;
  jumpScareTriggered = false;
  showJumpScare = false;
  showGameOver = false;
  glitchActive = false;
  endingText = 'You should have listened.';

  private glitchTimer: ReturnType<typeof setTimeout> | null = null;
  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private distortionTimer: ReturnType<typeof setInterval> | null = null;
  private warningPopupTimer: ReturnType<typeof setTimeout> | null = null;
  private jumpScareTimer: ReturnType<typeof setTimeout> | null = null;
  private hideJumpScareTimer: ReturnType<typeof setTimeout> | null = null;
  private scaryStartTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient) {}

  generateStory() {
    if (this.finalScarePending && !this.jumpScareTriggered) {
      this.triggerFinalJumpScare();
      return;
    }

    if (this.isLoading || this.isTyping) return;

    this.startCalmMusicOnce();
    this.playButtonSound();

    const data = {
      noun: this.noun.trim(),
      verb: this.verb.trim(),
      adjective: this.adjective.trim(),
      place: this.place.trim()
    };

    this.isLoading = true;
    this.result = 'Generating story...';
    this.scaryMode = false;
    this.showWarningPopup = false;

    this.http.post('/api/story', data, { responseType: 'text' })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (story: string) => {
          let isEasterEgg = false;

          if (story.startsWith('[EASTER_EGG]')) {
            isEasterEgg = true;
            story = story.replace('[EASTER_EGG]', '').trim();
            this.scaryMode = true;
            this.distortCalmMusicIntoScary();
          }

          this.score++;
          this.startTypewriter(story, isEasterEgg ? 55 : 22, isEasterEgg);

          if (this.allowOneLastStory && !isEasterEgg) {
            this.allowOneLastStory = false;
            this.finalScarePending = true;
          }
        },
        error: (error) => {
          console.error('Request failed:', error);
          this.result = 'Something went wrong.';
          this.isTyping = false;
          this.scaryMode = false;
          this.showWarningPopup = false;
        }
      });
  }

  startTypewriter(text: string, baseSpeed: number, isEasterEgg: boolean) {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }

    if (this.warningPopupTimer) {
      clearTimeout(this.warningPopupTimer);
      this.warningPopupTimer = null;
    }

    this.result = '';
    this.isTyping = true;

    let i = 0;

    const typeNext = () => {
      if (i >= text.length) {
        this.isTyping = false;
        this.typingTimer = null;

        if (isEasterEgg) {
          this.warningPopupTimer = setTimeout(() => {
            this.showWarningPopup = true;
            this.warningPopupTimer = null;
          }, 400);
        }

        return;
      }

      const char = text.charAt(i);
      this.result += char;
      i++;

      let delay = baseSpeed;

      if (char === '.' || char === '!' || char === '?') {
        delay = baseSpeed + 450;
      } else if (char === ',') {
        delay = baseSpeed + 180;
      }

      this.typingTimer = setTimeout(typeNext, delay);
    };

    typeNext();
  }

 closeWarningPopup() {
  this.showWarningPopup = false;
  this.scaryMode = false;
  this.stopScaryLoop();
  this.resetCalmMusic();
  this.calmMusicStarted = true;
  this.allowOneLastStory = true;
}

  triggerFinalJumpScare() {
  this.stopScaryLoop();
  this.resetCalmMusic();
  this.jumpScareTriggered = true;
    this.jumpScareTriggered = true;
    this.finalScarePending = false;
    this.allowOneLastStory = false;
    this.showJumpScare = true;

    const scream = this.screamSoundRef?.nativeElement;
    if (scream) {
      scream.currentTime = 0;
      scream.volume = 1;
      scream.play().catch(() => {});
    }

    document.body.classList.add('shake-screen');

    if (this.jumpScareTimer) {
      clearTimeout(this.jumpScareTimer);
    }

    if (this.hideJumpScareTimer) {
      clearTimeout(this.hideJumpScareTimer);
    }

    this.jumpScareTimer = setTimeout(() => {
      document.body.classList.remove('shake-screen');
      this.jumpScareTimer = null;
    }, 600);
     this.hideJumpScareTimer = setTimeout(() => {
    this.showJumpScare = false;
    this.startGameOverSequence();
    this.hideJumpScareTimer = null;
  }, 1800);


    this.hideJumpScareTimer = setTimeout(() => {
  this.showJumpScare = false;
  setTimeout(() => {
    this.showGameOver = true;
  }, 300);

  this.hideJumpScareTimer = null;
}, 1800);
  }

  randomWords() {
    if (this.isLoading || this.isTyping) return;

    this.startCalmMusicOnce();
    this.playButtonSound();

    const nouns = ['dragon', 'robot', 'teacher', 'pirate', 'rabbit', 'monster'];
    const verbs = ['dance', 'run', 'sing', 'fight', 'crawl', 'whisper'];
    const adjectives = ['crazy', 'tiny', 'funny', 'angry', 'creepy', 'glowing'];
    const places = ['school', 'castle', 'forest', 'beach', 'basement', 'moon'];

    this.noun = nouns[Math.floor(Math.random() * nouns.length)];
    this.verb = verbs[Math.floor(Math.random() * verbs.length)];
    this.adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    this.place = places[Math.floor(Math.random() * places.length)];
  }

  resetGame() {
    this.playButtonSound();

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }

    if (this.warningPopupTimer) {
      clearTimeout(this.warningPopupTimer);
      this.warningPopupTimer = null;
    }

    if (this.distortionTimer) {
      clearInterval(this.distortionTimer);
      this.distortionTimer = null;
    }

    if (this.scaryStartTimer) {
      clearTimeout(this.scaryStartTimer);
      this.scaryStartTimer = null;
    }

    if (this.jumpScareTimer) {
      clearTimeout(this.jumpScareTimer);
      this.jumpScareTimer = null;
    }

    if (this.hideJumpScareTimer) {
      clearTimeout(this.hideJumpScareTimer);
      this.hideJumpScareTimer = null;
    }
    if (this.glitchTimer) {
  clearTimeout(this.glitchTimer);
  this.glitchTimer = null;
}

this.showGameOver = false;
this.glitchActive = false;

    this.noun = '';
    this.verb = '';
    this.adjective = '';
    this.place = '';
    this.result = 'Your funny story will appear here...';
    this.score = 0;
    this.isLoading = false;
    this.isTyping = false;
    this.scaryMode = false;
    this.showWarningPopup = false;

    this.allowOneLastStory = false;
    this.finalScarePending = false;
    this.jumpScareTriggered = false;
    this.showJumpScare = false;

    this.stopScaryLoop();
    this.resetCalmMusic();
    document.body.classList.remove('shake-screen');
  }

  startCalmMusicOnce() {
    if (this.calmMusicStarted || this.scaryLoopActive) return;

    const music = this.backgroundMusicRef?.nativeElement;
    if (!music) return;

    music.volume = 0.35;
    music.play()
      .then(() => {
        this.calmMusicStarted = true;
      })
      .catch(() => {});
  }

  playButtonSound() {
    if (this.scaryLoopActive) return;

    const sound = this.buttonSoundRef?.nativeElement;
    if (!sound) return;

    sound.currentTime = 0;
    sound.volume = 0.5;
    sound.play().catch(() => {});
  }

  distortCalmMusicIntoScary() {
    const calm = this.backgroundMusicRef?.nativeElement;
    const scary = this.scarySoundRef?.nativeElement;

    if (!calm || !scary) return;

    if (this.distortionTimer) {
      clearInterval(this.distortionTimer);
      this.distortionTimer = null;
    }

    if (this.scaryStartTimer) {
      clearTimeout(this.scaryStartTimer);
      this.scaryStartTimer = null;
    }

    this.distortionTimer = setInterval(() => {
      if (calm.playbackRate > 0.55) {
        calm.playbackRate -= 0.03;
        calm.volume = Math.max(0, calm.volume - 0.02);
        calm.currentTime += Math.random() * 0.04;
      } else {
        if (this.distortionTimer) {
          clearInterval(this.distortionTimer);
          this.distortionTimer = null;
        }

        this.scaryStartTimer = setTimeout(() => {
          calm.pause();
          calm.currentTime = 0;
          calm.playbackRate = 1;

          scary.volume = 0.6;
          scary.currentTime = 0;
          scary.play().catch(() => {});
          this.scaryLoopActive = true;
          this.scaryStartTimer = null;
        }, 900);
      }
    }, 120);
  }

  stopScaryLoop() {
    const scary = this.scarySoundRef?.nativeElement;
    if (!scary) return;

    scary.pause();
    scary.currentTime = 0;
    this.scaryLoopActive = false;
  }

  resetCalmMusic() {
    const calm = this.backgroundMusicRef?.nativeElement;
    if (!calm) return;

    calm.pause();
    calm.currentTime = 0;
    calm.playbackRate = 1;
    calm.volume = 0.35;
    this.calmMusicStarted = false;
  }
  
  startGameOverSequence() {
  this.showGameOver = true;
  this.startGlitchLoop();
}

startGlitchLoop() {
  if (this.glitchTimer) {
    clearTimeout(this.glitchTimer);
    this.glitchTimer = null;
  }

  const triggerGlitch = () => {
    if (!this.showGameOver) {
      this.glitchActive = false;
      this.glitchTimer = null;
      return;
    }

    this.glitchActive = true;

    setTimeout(() => {
      this.glitchActive = false;
    }, 120 + Math.random() * 120);

    this.glitchTimer = setTimeout(triggerGlitch, 700 + Math.random() * 1800);
  };

  this.glitchTimer = setTimeout(triggerGlitch, 900);
}

restartFromGameOver() {
  if (!this.showGameOver) return;

  this.showGameOver = false;
  this.glitchActive = false;

  if (this.glitchTimer) {
    clearTimeout(this.glitchTimer);
    this.glitchTimer = null;
  }

  this.resetGame();
}
canGenerateStory(): boolean {
  return !!(
    this.noun.trim() &&
    this.verb.trim() &&
    this.adjective.trim() &&
    this.place.trim()
  );
}
}
document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('background-music');
  
    // Check localStorage for saved settings
    const savedVolume = localStorage.getItem('backgroundVolume');
    const isMusicPlaying = localStorage.getItem('isMusicPlaying') !== 'false';
  
    if (backgroundMusic) {
      if (savedVolume !== null) {
        backgroundMusic.volume = savedVolume;
      }
  
      if (isMusicPlaying) {
        backgroundMusic.play().catch(error => {
          console.log('Autoplay failed:', error);
        });
      }
  
      window.addEventListener('beforeunload', () => {
        localStorage.setItem('isMusicPlaying', !backgroundMusic.paused);
      });
    }
  });
  
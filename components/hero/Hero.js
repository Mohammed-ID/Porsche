/**
 * Hero Component JavaScript
 * Handles video optimization and hero animations
 */
(function() {
  /**
   * Hero section video optimization
   */
  const optimizeHeroVideo = () => {
    const heroVideo = document.querySelector("#hero video");
    if (!heroVideo) return;

    // Add loaded class once video is ready
    heroVideo.addEventListener("loadeddata", () => {
      const hero = document.getElementById("hero");
      if (hero) {
        hero.classList.add("video-loaded");
      }
    });

    // Pause video when not in viewport to save resources
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heroVideo.play();
          } else {
            heroVideo.pause();
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    heroObserver.observe(heroVideo);
  };

  // Initialize when component is loaded
  optimizeHeroVideo();
})();
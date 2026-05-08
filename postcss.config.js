import { Howl } from 'howler';

export const playNotificationSound = () => {
  const sound = new Howl({
    src: ['https://www.soundsnap.com/streamers/play.php?id=1548750291.9876:cash-register-ka-ching.mp3'],
    html5: true,
    volume: 0.5,
  });

  sound.play();
};
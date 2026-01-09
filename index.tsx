import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types & Constants ---

const PHRASES = [
  "No 🙄",
  "Are you sure?",
  "Think again 😐",
  "Last chance 👀",
  "Don't do this...",
  "You're breaking my heart 💔",
  "I'm gonna cry...",
  "You have no choice now 😈" // The trigger for the Yeet
];

// Original YouTube IDs Restored
const TRACKS = [
  { title: "Can't Help Falling In Love", artist: "Foster (Cover)", id: "3B5M8TyYpeg" },
  { title: "Excalibur Song", artist: "Soul Eater", id: "K32-Mjjj8D8" },
  { title: "Harleys In Hawaii", artist: "Katy Perry", id: "sQAgC9p1Jd0" },
  { title: "Be My Baby", artist: "The Ronettes", id: "jRMwJ0801M8" },
  { title: "I Think They Call This Love", artist: "Elliot James Reay", id: "t-G3k1p5WjU" },
  { title: "Night Changes x Shape of You", artist: "Mashup", id: "syFZV_hT-T8" },
  { title: "Dusk Till Dawn", artist: "ZAYN ft. Sia", id: "tt2k8PGm-TI" },
  { title: "I Love You 3000", artist: "Stephanie Poetri", id: "cVeez3a9rM8" },
  { title: "Perfect Two", artist: "Auburn", id: "z29nI8RQV7U" },
  { title: "Lovers Rock", artist: "TV Girl", id: "RzV8lK7jRms" },
  { title: "I Wanna Be Yours", artist: "Arctic Monkeys", id: "nyuo9-MzLlo" },
  { title: "Can't Take My Eyes Off You", artist: "Frankie Valli", id: "L_jWHffIx5E" },
  { title: "ily (i love you baby)", artist: "Surf Mesa", id: "2jslO4J3E1s" },
  { title: "Thank You", artist: "Dido", id: "1TO48Cnl66w" },
  { title: "Coffee", artist: "beabadoobee", id: "9F-44j6W2SE" }
];

const REASONS = [
  "Your smile lights up my entire world 🌎",
  "You make even the boring days fun 🎉",
  "You give the best hugs 🤗",
  "I can be my complete weird self around you 🤪",
  "You're smarter than you know 🧠",
  "The way you laugh is my favorite sound 🎵",
  "You support my dreams 🚀",
  "You have the kindest heart ❤️",
  "Every moment with you is a memory I cherish 📸",
  "I love you more than pizza (and that's saying a lot) 🍕"
];

const COUPONS = [
  { id: 1, title: "Massage", icon: "💆‍♀️" },
  { id: 2, title: "Dinner Choice", icon: "🍝" },
  { id: 3, title: "Movie Night", icon: "🎬" },
  { id: 4, title: "Win Argument", icon: "🏆" },
  { id: 5, title: "Sweet Treat", icon: "🍦" },
  { id: 6, title: "Big Hug", icon: "🫂" },
];

// --- CSS-in-JS Styles (Scoped & Premium) ---

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative' as const,
    zIndex: 10,
    textAlign: 'center' as const,
    overflowX: 'hidden' as const,
    transition: 'background 0.5s ease',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '30px',
    padding: '50px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
    maxWidth: '600px',
    width: '100%',
    transition: 'all 0.5s ease',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '3rem',
    color: '#ff4d6d',
    marginBottom: '20px',
    lineHeight: 1.2,
    textShadow: '0 4px 10px rgba(255, 77, 109, 0.2)',
  },
  text: {
    fontSize: '1.25rem',
    marginBottom: '40px',
    color: '#641220',
    lineHeight: 1.6,
    fontWeight: 500,
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '20px',
    position: 'relative' as const,
    width: '100%',
    minHeight: '80px', 
  },
  btn: {
    padding: '16px 40px',
    fontSize: '1.2rem',
    borderRadius: '50px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    letterSpacing: '0.5px',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    position: 'relative' as const,
    zIndex: 2,
  },
  btnYes: {
    backgroundColor: '#ff4d6d',
    color: 'white',
    boxShadow: '0 10px 25px rgba(255, 77, 109, 0.4)',
    backgroundImage: 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)',
  },
  btnNo: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    color: '#ff4d6d',
    border: '2px solid rgba(255, 77, 109, 0.3)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
  },
  dashboard: {
    maxWidth: '700px',
    width: '100%',
    margin: '40px auto',
    paddingBottom: '100px',
  },
  section: {
    background: 'rgba(255, 255, 255, 0.65)',
    borderRadius: '24px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.6) inset',
    textAlign: 'left' as const,
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    color: '#ff4d6d',
    fontSize: '2rem',
    marginTop: 0,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  // New Vinyl Player Style
  vinylPlayer: {
    background: 'linear-gradient(145deg, #1e1e24, #2b2d42)',
    borderRadius: '24px',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    color: 'white',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  vinylDisc: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, #111 20%, #333 21%, #111 22%, #333 100%)',
    position: 'relative' as const,
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  vinylLabel: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: '#ff4d6d',
    border: '2px solid #fff',
  },
  aiContainer: {
    background: 'rgba(255, 255, 255, 0.8)',
    border: '2px dashed #ffb3c1',
    padding: '30px',
    borderRadius: '24px',
    marginTop: '30px',
    textAlign: 'center' as const,
  },
  reasonCard: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    textAlign: 'center' as const,
    minHeight: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    color: '#590d22',
    fontFamily: 'var(--font-heading)',
    marginBottom: '10px',
    cursor: 'pointer',
    userSelect: 'none' as const,
    boxShadow: '0 10px 30px rgba(255, 77, 109, 0.15)',
    transition: 'all 0.3s ease',
  },
  couponGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  coupon: {
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '16px',
    padding: '15px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
};

// --- Helper Components ---

const CursorTrail = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      createSparkle(e.clientX, e.clientY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      createSparkle(e.touches[0].clientX, e.touches[0].clientY);
    };

    const createSparkle = (x: number, y: number) => {
      const sparkle = document.createElement('div');
      sparkle.style.position = 'fixed';
      sparkle.style.left = x + 'px';
      sparkle.style.top = y + 'px';
      sparkle.style.width = Math.random() * 8 + 4 + 'px';
      sparkle.style.height = sparkle.style.width;
      sparkle.style.backgroundColor = `hsl(${Math.random() * 60 + 320}, 100%, 75%)`;
      sparkle.style.borderRadius = '50%';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.zIndex = '9999';
      sparkle.style.transform = 'translate(-50%, -50%)';
      sparkle.style.boxShadow = '0 0 10px rgba(255, 100, 150, 0.8)';
      
      document.body.appendChild(sparkle);

      const animation = sparkle.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(-50%, ${Math.random() * 50 + 20}px) scale(0)`, opacity: 0 }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0, .9, .57, 1)',
      });

      animation.onfinish = () => sparkle.remove();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return null;
};

const FloatingHearts = () => {
  useEffect(() => {
    const container = document.querySelector('.bg-hearts');
    if (!container) return;
    container.innerHTML = ''; 

    const createHeart = () => {
      const heart = document.createElement('div');
      heart.innerHTML = ['❤️', '💖', '💕', '💗', '💘', '💝'][Math.floor(Math.random() * 6)];
      heart.classList.add('heart-particle');
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.animationDuration = Math.random() * 5 + 8 + 's';
      heart.style.fontSize = Math.random() * 20 + 15 + 'px';
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 13000);
    };

    const interval = setInterval(createHeart, 600);
    return () => clearInterval(interval);
  }, []);

  return <div className="bg-hearts"></div>;
};

const Confetti = () => {
  useEffect(() => {
    const colors = ['#ff4d6d', '#ff8fa3', '#fff0f3', '#ffd700', '#ffb3c1'];
    for (let i = 0; i < 200; i++) {
      const conf = document.createElement('div');
      conf.classList.add('confetti');
      conf.style.left = Math.random() * 100 + 'vw';
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.animationDuration = Math.random() * 2 + 2 + 's';
      conf.style.animationDelay = Math.random() * 1 + 's';
      document.body.appendChild(conf);
    }
  }, []);
  return null;
};

const Mascot = ({ mood }: { mood: 'neutral' | 'happy' | 'sad' }) => {
  // Use high-reliability Giphy CDN links to prevent disappearing images
  const stickers = {
    neutral: "https://media.giphy.com/media/uM0QwRAwkD00dM4X6J/giphy.gif", // Waiting Bear
    happy: "https://media.giphy.com/media/10UeedrT5MIfPG/giphy.gif",      // Happy Panda
    sad: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",          // Crying Cat/Bear
  };

  // Fallback (in case Giphy fails, use standard reliable ones)
  const backups = {
    neutral: "https://media.tenor.com/t7aI0aq0A94AAAAi/bubu-dudu-panda.gif",
    happy: "https://media.tenor.com/Z6mG5dG6d9AAAAAi/bubu-dudu-happy.gif",
    sad: "https://media.tenor.com/19JKy6h4rAAAAAAi/bubu-dudu-cry.gif",
  };

  return (
    <div className="animate-float" style={{
      width: '200px', 
      height: '200px', 
      marginBottom: '-30px', 
      position: 'relative',
      zIndex: 100, 
      pointerEvents: 'none',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      // CRITICAL: Prevent collapse if image is loading
      minHeight: '200px',
      minWidth: '200px',
    }}>
      <img 
        src={stickers[mood]} 
        alt={`Mascot ${mood}`}
        style={{
          width: '100%', 
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.15))',
          display: 'block' 
        }}
        onError={(e) => {
             const target = e.target as HTMLImageElement;
             // Try backup if primary fails
             if (target.src !== backups[mood]) {
                target.src = backups[mood];
             }
        }}
      />
    </div>
  );
};

// Updated Music Player: Vinyl Style + Hidden Youtube
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true); 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    setCurrentTrackIndex(Math.floor(Math.random() * TRACKS.length));
  }, []);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="animate-slide-up delay-2" style={styles.section} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <h3 style={styles.sectionTitle}>🎶 Our Vibe</h3>
      <div style={styles.vinylPlayer}>
        
        {/* HIDDEN Video Player - No ugly error messages */}
        <div style={{
          position: 'absolute', 
          width: '0px',
          height: '0px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none'
        }}>
           {isPlaying && (
            <iframe
              width="100"
              height="100"
              src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&enablejsapi=1&loop=1&playlist=${currentTrack.id}&origin=${window.location.origin}`}
              title="YouTube"
              allow="autoplay; encrypted-media"
            ></iframe>
           )}
        </div>

        {/* Vinyl Animation */}
        <div style={{
          ...styles.vinylDisc,
          animation: isPlaying ? 'spin 3s linear infinite' : 'none',
        }}>
          <div style={styles.vinylLabel}></div>
        </div>

        <div style={{flex: 1, overflow: 'hidden', zIndex: 5}}>
          <div style={{fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px'}}>
            {currentTrack.title}
          </div>
          <div style={{fontSize: '0.9rem', opacity: 0.7, fontFamily: 'monospace'}}>
            {currentTrack.artist}
          </div>
        </div>

        <div style={{display: 'flex', gap: '10px', zIndex: 5}}>
           <button 
            onClick={togglePlay}
            className={isPlaying ? 'pulse-active' : ''}
            style={{
              background: isPlaying ? '#ff4d6d' : 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: 'white', 
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '1.4rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button 
            onClick={handleNext}
            style={{
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: 'white', 
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '1.4rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ⏭️
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      <div style={{fontSize: '0.8rem', marginTop: '10px', opacity: 0.6, fontStyle: 'italic'}}>
        (If music doesn't auto-start, click Play!)
      </div>
    </div>
  );
};

const ReasonsSwiper = () => {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  const nextReason = () => {
    setOpacity(0);
    setTimeout(() => {
        setIndex((prev) => (prev + 1) % REASONS.length);
        setOpacity(1);
    }, 300);
  };

  return (
    <div className="animate-slide-up delay-3" style={styles.section} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <h3 style={styles.sectionTitle}>💌 10 Reasons Why</h3>
      <div 
        style={{...styles.reasonCard, opacity: opacity, transform: `scale(${opacity === 0 ? 0.95 : 1})`}} 
        onClick={nextReason}
      >
        "{REASONS[index]}"
      </div>
      <div style={{textAlign: 'center', fontSize: '0.9rem', color: '#ff8fa3', marginTop: '10px', fontWeight: 600}}>
        Tap for next ({index + 1}/{REASONS.length})
      </div>
    </div>
  );
};

const CouponBank = () => {
  const [claimed, setClaimed] = useState<number[]>([]);

  const toggleClaim = (id: number) => {
    if (claimed.includes(id)) return;
    setClaimed([...claimed, id]);
  };

  return (
    <div className="animate-slide-up delay-4" style={styles.section} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <h3 style={styles.sectionTitle}>🎟️ Love Coupons</h3>
      <p style={{fontSize: '1rem', marginBottom: '20px', color: '#666'}}>Tap to redeem (No expiration!)</p>
      <div style={styles.couponGrid}>
        {COUPONS.map(coupon => {
          const isClaimed = claimed.includes(coupon.id);
          return (
            <div 
              key={coupon.id} 
              style={{
                ...styles.coupon, 
                background: isClaimed ? '#f0f0f0' : 'white',
                opacity: isClaimed ? 0.6 : 1,
                transform: isClaimed ? 'scale(0.95)' : 'scale(1)'
              }}
              onClick={() => toggleClaim(coupon.id)}
            >
              <div style={{fontSize: '2rem', marginBottom: '5px'}}>{coupon.icon}</div>
              <div style={{fontSize: '0.9rem', fontWeight: 700, color: '#590d22'}}>
                {isClaimed ? "Redeemed!" : coupon.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const AiComplimentGenerator = () => {
  const [compliment, setCompliment] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCompliment = async () => {
    if (!process.env.API_KEY) {
      setCompliment("You are beautiful! (API Key missing, so here is a manual one! ❤️)");
      return;
    }

    setLoading(true);
    setCompliment(""); 
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const traits = ["smile", "eyes", "intelligence", "laugh", "kindness", "style", "humor", "warmth", "energy"];
      const randomTrait = traits[Math.floor(Math.random() * traits.length)];
      
      const prompt = `Write a short, unique, and very romantic compliment for my girlfriend about her ${randomTrait}. Be creative, cute, and charming. Max 20 words.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setCompliment(response.text || "You leave me speechless!");
    } catch (e) {
      console.error(e);
      setCompliment("You are so amazing that I broke the AI! ❤️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up delay-5" style={styles.aiContainer}>
      <h3 style={{...styles.sectionTitle, justifyContent: 'center'}}>🤖 Cupid's Compliment Bot</h3>
      <p style={{marginBottom: '20px', color: '#641220'}}>Feeling down? Let me remind you how amazing you are.</p>
      
      {compliment && (
        <div className="animate-pop" style={{
          padding: '25px', 
          background: 'white', 
          borderRadius: '20px', 
          marginBottom: '20px',
          fontStyle: 'italic',
          fontSize: '1.25rem',
          color: '#d63384',
          boxShadow: '0 10px 25px rgba(255, 77, 109, 0.1)'
        }}>
          "{compliment}"
        </div>
      )}

      <button 
        style={{...styles.btn, ...styles.btnYes}}
        onClick={generateCompliment}
        disabled={loading}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {loading ? "Thinking..." : "Tell me something sweet 💕"}
      </button>
    </div>
  );
};

// --- Main Application ---

const App = () => {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mascotMood, setMascotMood] = useState<'neutral' | 'happy' | 'sad'>('neutral');
  
  // State for the "Runaway" button position
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
  const [isRunningAway, setIsRunningAway] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  
  // Easter Egg State
  const [eggCount, setEggCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);

  // Background Interaction
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let x, y;
      if ('touches' in e) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = (e as MouseEvent).clientX;
        y = (e as MouseEvent).clientY;
      }
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  const moveNoButton = () => {
    if (noCount < 2 || isYeeted) return;

    setIsRunningAway(true);
    const xRange = 150; 
    const yRange = 150;
    const randomX = (Math.random() - 0.5) * 2 * xRange;
    const randomY = (Math.random() - 0.5) * 2 * yRange;
    setNoBtnPos({ x: randomX, y: randomY });
  };

  const handleNoClick = () => {
    moveNoButton(); // FORCE move on click to prevent spamming without movement
    if (noCount >= PHRASES.length - 1) {
      setNoCount(prev => prev + 1);
      setTimeout(() => {
        setIsYeeted(true);
        setMascotMood('neutral'); // Calm down after yeet
      }, 500);
    } else {
      setNoCount(prev => prev + 1);
    }
  };

  const getNoText = () => {
    return PHRASES[Math.min(noCount, PHRASES.length - 1)];
  };

  const getYesSize = () => {
    return Math.min(1 + noCount * 0.15, 2.5); 
  };

  // Render: The "YES" Dashboard
  if (yesPressed) {
    return (
      <div style={styles.container}>
        <CursorTrail />
        <FloatingHearts />
        <Confetti />
        
        <div style={styles.dashboard}>
          <div className="animate-slide-up delay-1" style={{textAlign: 'center', marginBottom: '50px'}}>
             <h1 style={styles.title}>Wooohooo! 🎉</h1>
             <p style={{fontSize: '1.5rem', color: '#590d22', fontWeight: 700}}>
               You're officially my Valentine! 💖
             </p>
          </div>

          <div className="animate-slide-up delay-1" style={{display: 'flex', justifyContent: 'center', marginBottom: '40px'}}>
            <img 
              src="https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif" 
              alt="Celebration" 
              style={{
                maxWidth: '100%', 
                borderRadius: '30px', 
                boxShadow: '0 20px 50px rgba(255, 77, 109, 0.4)',
                border: '5px solid rgba(255,255,255,0.8)'
              }}
            />
          </div>

          <MusicPlayer />
          <ReasonsSwiper />
          <CouponBank />
          <AiComplimentGenerator />
          
          <div className="animate-slide-up delay-5" style={{marginTop: '60px', opacity: 0.6, fontSize: '0.9rem', color: '#590d22', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
            <div>Made with all my ❤️</div>
            
            {/* Easter Egg Button */}
            <button 
                onClick={() => {
                    const newCount = eggCount + 1;
                    setEggCount(newCount);
                    if (newCount === 10) {
                        setShowSecret(true);
                    }
                }}
                style={{
                    background: 'transparent',
                    border: '2px solid rgba(255, 77, 109, 0.3)',
                    color: '#ff4d6d',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    opacity: 0.8,
                    transition: 'all 0.2s',
                    transform: `scale(${1 + eggCount * 0.05})`
                }}
            >
                YES (Again!) {eggCount > 0 && eggCount < 10 ? `x${eggCount}` : ''} 💖
            </button>
          </div>
        </div>

        {/* Easter Egg Modal */}
        {showSecret && (
            <div className="animate-pop" style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                flexDirection: 'column',
                padding: '20px',
                textAlign: 'center'
            }} onClick={() => setShowSecret(false)}>
                <h1 style={{color: '#ff4d6d', fontFamily: 'var(--font-heading)', fontSize: '4rem', marginBottom: '20px'}}>
                    I LOVE YOU MORE! 
                </h1>
                <p style={{color: 'white', fontSize: '1.5rem', maxWidth: '600px'}}>
                    You clicked YES 10 times? You must really love me! 
                    <br/><br/>
                    (And yes, I knew you would do that 😉)
                </p>
                <div style={{fontSize: '5rem', marginTop: '20px'}}>🥰💍♾️</div>
                <div style={{color: '#aaa', marginTop: '40px', fontSize: '0.9rem'}}>(Tap anywhere to close)</div>
            </div>
        )}
      </div>
    );
  }

  // Render: The Proposal (Gatekeeper)
  // Dynamic Background Gradient based on mouse position + animation
  const bgX = (mousePos.x / window.innerWidth) * 100;
  const bgY = (mousePos.y / window.innerHeight) * 100;

  return (
    <div style={{
      ...styles.container,
      // Combining dynamic mouse gradient with css animation is tricky, defaulting to CSS animation dominant with mouse hint
      // or we can use the mouse pos to shift the center slightly
      background: `radial-gradient(circle at ${bgX}% ${bgY}%, rgba(255,255,255,0.2) 0%, rgba(255,0,0,0) 50%)`,
    }}>
      <CursorTrail />
      <FloatingHearts />
      
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Mascot mood={mascotMood} />
        
        <div className="animate-pop" style={styles.glassCard}>
          <h1 style={styles.title}>
             {noCount >= PHRASES.length - 1 ? "Pretty please? 🥺" : "Will you be my Valentine? 💖"}
          </h1>
          <p style={styles.text}>
            {noCount === 0 ? "I've been meaning to ask you something special..." : "Don't break my heart! (There's only one right answer 😉)"}
          </p>
          
          <div style={styles.buttonGroup}>
            <button
              className="animate-heartbeat"
              style={{
                ...styles.btn,
                ...styles.btnYes,
                transform: `scale(${getYesSize()})`,
                zIndex: 50, 
              }}
              onMouseEnter={(e) => {
                setMascotMood('happy');
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 77, 109, 0.6)';
              }}
              onMouseLeave={(e) => {
                setMascotMood('neutral');
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 77, 109, 0.4)';
              }}
              onClick={() => setYesPressed(true)}
            >
              {noCount >= PHRASES.length - 1 ? "YES (Finally!) 💖" : "YES 💘"}
            </button>

            {!isYeeted && (
              <button
                onMouseEnter={() => {
                  moveNoButton();
                  setMascotMood('sad');
                }}
                onMouseLeave={() => setMascotMood('neutral')} 
                onClick={handleNoClick} 
                className={isYeeted ? 'animate-yeet' : ''} 
                style={{
                  ...styles.btn,
                  ...styles.btnNo,
                  position: isRunningAway ? 'absolute' : 'relative',
                  top: isRunningAway ? `${noBtnPos.y}px` : 'auto',
                  left: isRunningAway ? `${noBtnPos.x}px` : 'auto',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', 
                  zIndex: 40,
                  ...(noCount > PHRASES.length ? { display: 'none' } : {})
                }}
              >
                {getNoText()}
              </button>
            )}

            {isYeeted && (
               <button
               className="animate-yeet"
               style={{
                 ...styles.btn,
                 ...styles.btnNo,
                 position: 'absolute',
                 zIndex: 40,
               }}
             >
               Bye Bye! 👋
             </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
  import { useEffect, useRef, useState } from 'react'
  import './App.css'
  import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
  import axios from 'axios';
  import ServerWakeupBanner from './components/ServerWakeupBanner';

  const EXTENSION_VIDEO_SRC = '/2026-09-17%2016-27-00.mp4';

  function App() {

    const [emailContent, setEmailContent] = useState('');
    const [tone, setTone] = useState('');
    const [generatedReply, setGeneratedReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [videoOpen, setVideoOpen] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const copyResetTimer = useRef(null);
    const videoRef = useRef(null);

    const openVideo = () => {
      setVideoReady(false);
      setVideoOpen(true);
    };

    useEffect(() => {
      return () => {
        if (copyResetTimer.current) {
          clearTimeout(copyResetTimer.current);
        }
      };
    }, []);

    useEffect(() => {
      document.documentElement.classList.toggle('dark-theme', darkMode);

      return () => {
        document.documentElement.classList.remove('dark-theme');
      };
    }, [darkMode]);

    useEffect(() => {
      document.body.classList.toggle('video-modal-open', videoOpen);

      if (!videoOpen && videoRef.current) {
        videoRef.current.pause();
      }

      return () => {
        document.body.classList.remove('video-modal-open');
      };
    }, [videoOpen]);

    useEffect(() => {
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          setVideoOpen(false);
        }
      };

      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSubmit = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/email/generate`, {
          emailContent,
          tone,
        });

        const rawReply = response.data;

        setGeneratedReply(
          typeof rawReply === 'string'
            ? rawReply.replace(/\\n/g, '\n')
            : JSON.stringify(rawReply)
        );

        setCopied(false);
      } catch (error) {
        setError('An error occurred while generating the reply. Please try again.');
        console.error(error);
      }
      finally {
        setLoading(false);
      }
    };

    const handleCopy = async () => {
      await navigator.clipboard.writeText(generatedReply);
      setCopied(true);
      clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => {
        setCopied(false);
      }, 3500);
    };

    return (
      <main className="app-shell">
        <ServerWakeupBanner onOpenVideo={openVideo} videoOpen={videoOpen} />
        <header className="topbar">
          <div className="brand-mark" aria-label="Reply Studio home"><span>Reply</span>Studio</div>
          <div className="topbar-note"><span className="status-dot" /> AI-assisted writing desk</div>
        </header>

        <section className="hero-strip">
          <div className="intro-block">
            <p className="eyebrow">Thoughtful replies, in your voice</p>
            <Typography variant="h1" component="h1">Write polished email replies in seconds.</Typography>
            <p className="intro-copy">Paste a message, choose the tone, and shape a clear response without wrestling with the blank page.</p>
          </div>
          <div className="hero-controls">
            <button
              className="watch-video-button"
              type="button"
              onClick={openVideo}
            >
              Watch Extension Video
            </button>
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setDarkMode((currentMode) => !currentMode)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <span className="theme-logo" aria-hidden="true"><span /></span>
            </button>
          </div>
        </section>

        <section className={`workspace ${generatedReply ? 'has-reply' : ''}`}>
          <div className="compose-panel panel">
            <div className="panel-heading">
              <div><span className="step-number">01</span><Typography variant="h2" component="h2">Original email</Typography></div>
              <span className="panel-label">Input</span>
            </div>
            <TextField
              className="email-field"
              fullWidth
              multiline
              minRows={7}
              placeholder="Paste the email you want to reply to..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              inputProps={{ 'aria-label': 'Original email content' }}
            />
            <div className="compose-footer">
              <span className="character-count">{emailContent.length} characters</span>
              <FormControl className="tone-select">
                <InputLabel id="tone-label">Tone</InputLabel>
                <Select labelId="tone-label" value={tone} label="Tone" onChange={(e) => setTone(e.target.value)}>
                  <MenuItem value="">Let it flow</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                </Select>
              </FormControl>
            </div>
            <Button className="generate-button" variant="contained" onClick={handleSubmit} disabled={!emailContent || loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : <><span>Generate reply</span><span className="button-arrow">-&gt;</span></>}
            </Button>
            {error && <Typography className="error-message">{error}</Typography>}
          </div>

          <div className={`reply-panel panel ${generatedReply ? 'is-ready' : ''}`}>
            <div className="panel-heading">
              <div><span className="step-number">02</span><Typography variant="h2" component="h2">Your reply</Typography></div>
              {generatedReply && <span className="ready-label">Ready to send</span>}
            </div>
            {generatedReply ? (
              <>
                <TextField className="email-field reply-field" fullWidth multiline minRows={7} value={generatedReply} InputProps={{ readOnly: true }} inputProps={{ 'aria-label': 'Generated reply' }} />
                <Button className="copy-button" variant="outlined" onClick={handleCopy}>{copied ? 'Copied to clipboard' : 'Copy reply'}</Button>
              </>
            ) : (
              <div className="empty-reply"><div className="empty-line" /><p>Your considered response<br />will appear here.</p></div>
            )}
          </div>
        </section>

        {videoOpen && (
          <div
            className="video-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Chrome extension demo video"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setVideoOpen(false);
              }
            }}
          >
            <button
              className="video-close-button"
              type="button"
              onClick={() => setVideoOpen(false)}
              aria-label="Close extension video"
            >
              Close
            </button>
            <div className={`video-stage ${videoReady ? 'is-ready' : ''}`}>
              {!videoReady && <span className="video-loading">Loading video...</span>}
              <video ref={videoRef} controls autoPlay onLoadedData={() => setVideoReady(true)}>
                <source src={EXTENSION_VIDEO_SRC} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </main>
    )
  }

  export default App

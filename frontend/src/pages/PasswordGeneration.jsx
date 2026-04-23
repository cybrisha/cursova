import { useState, useCallback } from 'react';
import {
  generateNoConsecutiveIdentical,
  generateWithMixedCaseAndDigits,
  generateWithMinimumLength,
} from '../utils/passwordGenerator';
import './PasswordGeneration.css';

const MODES = {
  noConsecutive: 'noConsecutive',
  mixed: 'mixed',
  minLength: 'minLength',
};

export default function PasswordGeneration() {
  const [mode, setMode] = useState(MODES.noConsecutive);
  const [minLengthInput, setMinLengthInput] = useState('12');
  const [generated, setGenerated] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [copyHint, setCopyHint] = useState('');

  const handleGenerate = useCallback(() => {
    setError('');
    setCopyHint('');
    setVisible(false);
    try {
      if (mode === MODES.noConsecutive) {
        setGenerated(generateNoConsecutiveIdentical(16));
        return;
      }
      if (mode === MODES.mixed) {
        setGenerated(generateWithMixedCaseAndDigits(16));
        return;
      }
      const min = parseInt(minLengthInput, 10);
      if (Number.isNaN(min) || min < 8) {
        setError('Minimum length must be at least 8 (policy).');
        setGenerated('');
        return;
      }
      if (min > 256) {
        setError('Maximum length is 256.');
        setGenerated('');
        return;
      }
      setGenerated(generateWithMinimumLength(min));
    } catch (e) {
      setError(e.message || 'Could not generate password.');
      setGenerated('');
    }
  }, [mode, minLengthInput]);

  const copyToClipboard = async () => {
    if (!generated) return;
    setCopyHint('');
    try {
      await navigator.clipboard.writeText(generated);
      setCopyHint('Copied to clipboard.');
      setTimeout(() => setCopyHint(''), 2500);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = generated;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopyHint('Copied to clipboard.');
        setTimeout(() => setCopyHint(''), 2500);
      } catch {
        setCopyHint('Copy failed. Select the password manually.');
      }
    }
  };

  return (
    <div className="password-generation">
      <h1>Password generation</h1>
      <p className="password-generation__intro">
        Generate a random password according to one of the rules below.
      </p>

      <div className="card password-generation__card">
        <fieldset className="password-generation__fieldset">
          <legend className="password-generation__legend">Criterion</legend>

          <label className="password-generation__radio-row">
            <input
              type="radio"
              name="criterion"
              checked={mode === MODES.noConsecutive}
              onChange={() => setMode(MODES.noConsecutive)}
            />
            <span>
              No consecutive identical characters (16 characters, mixed
              symbols)
            </span>
          </label>

          <label className="password-generation__radio-row">
            <input
              type="radio"
              name="criterion"
              checked={mode === MODES.mixed}
              onChange={() => setMode(MODES.mixed)}
            />
            <span>
              Contains lowercase and uppercase letters, and numbers (16
              characters)
            </span>
          </label>

          <label className="password-generation__radio-row">
            <input
              type="radio"
              name="criterion"
              checked={mode === MODES.minLength}
              onChange={() => setMode(MODES.minLength)}
            />
            <span>
              Length not less than a minimum you set (at least 8, up to 256)
            </span>
          </label>

          {mode === MODES.minLength && (
            <div className="password-generation__min-wrap">
              <label htmlFor="min-length" className="form-label">
                Minimum length
              </label>
              <input
                id="min-length"
                type="number"
                className="form-input password-generation__number"
                min={8}
                max={256}
                value={minLengthInput}
                onChange={(e) => setMinLengthInput(e.target.value)}
              />
            </div>
          )}
        </fieldset>

        {error && <div className="error-message">{error}</div>}

        <button
          type="button"
          className="btn btn-primary password-generation__generate"
          onClick={handleGenerate}
        >
          Generate password
        </button>

        {generated && (
          <div className="password-generation__result">
            <span className="password-generation__result-label">Password</span>
            <div className="password-generation__result-row">
              <code className="password-generation__value">
                {visible ? generated : '•'.repeat(generated.length)}
              </code>
              <div className="password-generation__actions">
                <button
                  type="button"
                  className="btn btn-secondary password-generation__icon-btn"
                  onClick={() => setVisible((v) => !v)}
                  title={visible ? 'Hide password' : 'Show password'}
                  aria-label={visible ? 'Hide password' : 'Show password'}
                >
                  {visible ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary password-generation__icon-btn"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                  aria-label="Copy to clipboard"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
            {copyHint && (
              <p className="password-generation__hint">{copyHint}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

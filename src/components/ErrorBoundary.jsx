import { Component } from 'react';

/**
 * The last thing between a broken page and a blank screen.
 *
 * Without it, one throw takes the whole document with it: React unmounts the
 * tree, `#root` is left empty, and the phone shows white paper with no
 * masthead and no way back but knowing to pull down and refresh. The admin
 * section is the one that gets hit, because it is the only part of the site
 * fetched on demand — tap "Add result" on a bad signal, or on a tab left open
 * across a deploy that renamed the chunk, and the import rejects.
 *
 * A reload is the honest fix for both of those: a fresh document re-asks for
 * `index.html` and gets whichever chunk names are current. So the failure
 * says that, rather than explaining itself.
 *
 * Keyed on the pathname by its caller, so a page that fails doesn't leave the
 * error sitting over every page navigated to afterwards.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: null };
  }

  static getDerivedStateFromError(error) {
    return { failed: error };
  }

  componentDidCatch(error) {
    // Nothing collects these, so the console is where an admin on a laptop can
    // still read what happened.
    console.error('Page failed to render:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="sheet">
        <h2>This page didn’t load</h2>
        <p className="muted">
          Usually the connection dropped mid-tap. Reloading picks it up again —
          nothing you’ve already saved is affected.
        </p>
        <div className="form-actions">
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}

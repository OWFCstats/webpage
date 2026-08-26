import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BadgeIcon from '../components/BadgeIcon';
import { ErrorNote, Spinner } from '../components/bits';
import CareerTiers from '../components/badge-detail/CareerTiers';
import EventHolders from '../components/badge-detail/EventHolders';
import TrophyYears from '../components/badge-detail/TrophyYears';
import { badgeDetail } from '../lib/awards';

/** What the hero wears: the best metal anyone in the club holds, so the page
 *  opens on where the badge has actually got to. Gold for the six that don't
 *  tier, and the drawing drained of its colour while nobody holds it at all. */
function heroMetal(view) {
  if (view.badge.class === 'trophy') return view.wins.length > 0 ? 'gold' : null;
  if (view.badge.class === 'event') return view.awarded > 0 ? 'gold' : null;
  const held = view.tiers.filter((t) => t.count > 0);
  return held.length > 0 ? held[held.length - 1].metal : null;
}

/**
 * One badge, every holder, and who is closest. A badge that can be linked into
 * the group chat is worth more than one that can only be looked at, and this
 * club's distribution is WhatsApp.
 */
export default function BadgeDetail() {
  const { badgeKey } = useParams();
  const { players, matches, appearances, seasonAwards, loading, error } = useData();

  const view = useMemo(
    () => (loading ? null : badgeDetail(badgeKey, players, matches, appearances, seasonAwards)),
    [loading, badgeKey, players, matches, appearances, seasonAwards],
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!view) {
    return (
      <div className="empty sheet">
        No badge by that name. <Link className="more" to="/records">Every badge →</Link>
      </div>
    );
  }

  const { badge } = view;

  return (
    <div>
      <div className="board badge-hero">
        <BadgeIcon badge={badge.key} metal={heroMetal(view)} size={72} />
        <div>
          <h1>{badge.label}</h1>
          <p className="badge-what">{badge.line}</p>
        </div>
      </div>

      <div className="section">
        {badge.class === 'career' && (
          <CareerTiers badge={badge} tiers={view.tiers} chasing={view.chasing} />
        )}
        {badge.class === 'event' && (
          <EventHolders badge={badge} awarded={view.awarded} holders={view.holders} more={view.more} />
        )}
        {badge.class === 'trophy' && <TrophyYears badge={badge} wins={view.wins} roll={view.roll} />}
      </div>

      <p className="muted card-foot">
        <Link className="more" to="/records">← Every badge in the club</Link>
      </p>
    </div>
  );
}

import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import { Spinner } from './components/bits';
import Home from './pages/Home';
import Matchday from './pages/Matchday';
import Season from './pages/Season';
import PlayersHub from './pages/PlayersHub';
import Records from './pages/Records';
import BadgeDetail from './pages/BadgeDetail';
import PlayerDetail from './pages/PlayerDetail';
import OpponentDetail from './pages/OpponentDetail';

// The admin section loads on demand — a public visitor never downloads it.
// (The season charts are split the same way inside the Season page.)
const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const PlayersAdmin = lazy(() => import('./pages/admin/PlayersAdmin'));
const TeamsAdmin = lazy(() => import('./pages/admin/TeamsAdmin'));
const LeagueAdmin = lazy(() => import('./pages/admin/LeagueAdmin'));
const AwardsAdmin = lazy(() => import('./pages/admin/AwardsAdmin'));
const MatchesAdmin = lazy(() => import('./pages/admin/MatchesAdmin'));
const MatchForm = lazy(() => import('./pages/admin/MatchForm'));
const Lineup = lazy(() => import('./pages/admin/Lineup'));
const ReportEditor = lazy(() => import('./pages/admin/ReportEditor'));
const AddResult = lazy(() => import('./pages/admin/AddResult'));

// Old match links carried the id under /matches/ — Matchday absorbed the
// per-match page, so the id just needs to move across.
function MatchRedirect() {
  const { matchId } = useParams();
  return <Navigate to={`/matchday/${matchId}`} replace />;
}

// HashRouter: GitHub Pages can't rewrite arbitrary paths to index.html, and
// hash routing also works unchanged on a custom domain later.
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="matchday" element={<Matchday />} />
                <Route path="matchday/:matchId" element={<Matchday />} />
                <Route path="season" element={<Season view="season" />} />
                <Route path="season/charts" element={<Season view="charts" />} />
                <Route path="players" element={<PlayersHub view="leaders" />} />
                <Route path="players/squad" element={<PlayersHub view="squad" />} />
                <Route path="players/:playerId" element={<PlayerDetail />} />
                <Route path="opponents/:name" element={<OpponentDetail />} />
                <Route path="records" element={<Records view="badges" />} />
                <Route path="records/honours" element={<Records view="honours" />} />
                <Route path="records/all-time" element={<Records view="all-time" />} />
                <Route path="records/badges/:badgeKey" element={<BadgeDetail />} />

                {/* Old addresses keep working — bookmarks and chat links land
                    on the page that absorbed them. */}
                <Route path="history" element={<Navigate to="/records" replace />} />
                <Route path="results" element={<Navigate to="/season" replace />} />
                <Route path="matches" element={<Navigate to="/season" replace />} />
                <Route path="matches/:matchId" element={<MatchRedirect />} />
                <Route path="trends" element={<Navigate to="/season" replace />} />
                <Route path="leaderboards" element={<Navigate to="/players" replace />} />
                <Route path="stats" element={<Navigate to="/players" replace />} />

                <Route path="admin/login" element={<Login />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminHome />} />
                  <Route path="new-result" element={<AddResult />} />
                  <Route path="players" element={<PlayersAdmin />} />
                  <Route path="teams" element={<TeamsAdmin />} />
                  <Route path="league" element={<LeagueAdmin />} />
                  <Route path="awards" element={<AwardsAdmin />} />
                  <Route path="matches" element={<MatchesAdmin />} />
                  <Route path="matches/new" element={<MatchForm />} />
                  <Route path="matches/:matchId" element={<MatchForm />} />
                  <Route path="matches/:matchId/lineup" element={<Lineup />} />
                  <Route path="matches/:matchId/report" element={<ReportEditor />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
}

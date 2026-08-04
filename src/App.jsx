import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import { Spinner } from './components/bits';
import Home from './pages/Home';
import Results from './pages/Results';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Leaderboards from './pages/Leaderboards';
import InDepth from './pages/InDepth';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';

// Trends pulls in Recharts (~400kB) and admin pulls in the whole editing UI —
// neither is needed by someone who lands on the home page, so both load on
// demand instead of riding along in the first download.
const Trends = lazy(() => import('./pages/Trends'));
const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const PlayersAdmin = lazy(() => import('./pages/admin/PlayersAdmin'));
const MatchesAdmin = lazy(() => import('./pages/admin/MatchesAdmin'));
const MatchForm = lazy(() => import('./pages/admin/MatchForm'));
const Lineup = lazy(() => import('./pages/admin/Lineup'));
const ReportEditor = lazy(() => import('./pages/admin/ReportEditor'));

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
                <Route path="results" element={<Results />} />
                <Route path="matches" element={<Matches />} />
                <Route path="matches/:matchId" element={<MatchDetail />} />
                <Route path="leaderboards" element={<Leaderboards />} />
                <Route path="stats" element={<InDepth />} />
                <Route path="players" element={<Players />} />
                <Route path="players/:playerId" element={<PlayerDetail />} />
                <Route path="trends" element={<Trends />} />
                <Route path="admin/login" element={<Login />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminHome />} />
                  <Route path="players" element={<PlayersAdmin />} />
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

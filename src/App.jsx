import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Results from './pages/Results';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Leaderboards from './pages/Leaderboards';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import Trends from './pages/Trends';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import PlayersAdmin from './pages/admin/PlayersAdmin';
import MatchesAdmin from './pages/admin/MatchesAdmin';
import MatchForm from './pages/admin/MatchForm';
import Lineup from './pages/admin/Lineup';
import ReportEditor from './pages/admin/ReportEditor';

// HashRouter: GitHub Pages can't rewrite arbitrary paths to index.html, and
// hash routing also works unchanged on a custom domain later.
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="results" element={<Results />} />
              <Route path="matches" element={<Matches />} />
              <Route path="matches/:matchId" element={<MatchDetail />} />
              <Route path="leaderboards" element={<Leaderboards />} />
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
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
}

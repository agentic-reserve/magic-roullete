'use client';

import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState } from 'react';

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState('stats');

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', wins: 3, losses: 1, earnings: 12.5 },
    { day: 'Tue', wins: 4, losses: 1, earnings: 18.3 },
    { day: 'Wed', wins: 2, losses: 2, earnings: 8.7 },
    { day: 'Thu', wins: 5, losses: 0, earnings: 22.4 },
    { day: 'Fri', wins: 4, losses: 1, earnings: 19.2 },
    { day: 'Sat', wins: 6, losses: 1, earnings: 28.5 },
    { day: 'Sun', wins: 3, losses: 2, earnings: 14.1 },
  ];

  const matchHistory = [
    {
      id: 1,
      opponent: 'OutlawWinston',
      type: '1v1',
      result: 'WIN',
      earnings: 5.25,
      date: '2 hours ago',
      duration: '3m 45s',
    },
    {
      id: 2,
      opponent: 'Team Blue',
      type: '2v2',
      result: 'WIN',
      earnings: 10.5,
      date: '5 hours ago',
      duration: '5m 12s',
    },
    {
      id: 3,
      opponent: 'RevolverRick',
      type: '1v1',
      result: 'LOSS',
      earnings: -2.5,
      date: '1 day ago',
      duration: '2m 18s',
    },
    {
      id: 4,
      opponent: 'Team Red',
      type: '2v2',
      result: 'WIN',
      earnings: 8.75,
      date: '2 days ago',
      duration: '4m 33s',
    },
    {
      id: 5,
      opponent: 'SaloonSally',
      type: '1v1',
      result: 'WIN',
      earnings: 4.75,
      date: '2 days ago',
      duration: '3m 22s',
    },
  ];

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-12 p-8 rounded-lg border border-border bg-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            {/* Profile Info */}
            <div className="flex items-center gap-6 flex-1">
              <div className="w-24 h-24 rounded-lg bg-primary/20 flex items-center justify-center text-5xl border-2 border-primary">
                🤠
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  SheriffSolana
                </h1>
                <p className="text-muted-foreground mt-1">
                  solana1a2b3c4d5e...
                </p>
                <div className="flex gap-3 mt-3">
                  <Badge type="sheriff" size="md" />
                  <Badge type="legend" size="md" />
                </div>
              </div>
            </div>

            {/* Wallet Actions */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-6 py-2 rounded bg-card border border-border hover:bg-muted transition-colors font-semibold">
                Edit Profile
              </button>
              <button className="flex-1 sm:flex-none px-6 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold">
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Total Earnings
            </p>
            <p className="text-3xl font-bold text-primary">524.3 SOL</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Win Rate
            </p>
            <p className="text-3xl font-bold text-accent">78%</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Current Streak
            </p>
            <p className="text-3xl font-bold text-primary">12 🔥</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Total Matches
            </p>
            <p className="text-3xl font-bold text-foreground">142</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-8">
            {/* Win/Loss Chart */}
            <div className="p-8 rounded-lg border border-border bg-card">
              <h2 className="text-2xl font-bold text-foreground mb-6">Weekly Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2218" />
                  <XAxis dataKey="day" stroke="#a89f94" />
                  <YAxis stroke="#a89f94" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1410',
                      border: '1px solid #2a2218',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f5f0ea' }}
                  />
                  <Legend />
                  <Bar dataKey="wins" fill="#d4853c" />
                  <Bar dataKey="losses" fill="#c41e3a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Earnings Trend */}
            <div className="p-8 rounded-lg border border-border bg-card">
              <h2 className="text-2xl font-bold text-foreground mb-6">Earnings Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2218" />
                  <XAxis dataKey="day" stroke="#a89f94" />
                  <YAxis stroke="#a89f94" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1410',
                      border: '1px solid #2a2218',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f5f0ea' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#d4853c"
                    dot={{ fill: '#d4853c' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">
                  Best Day
                </p>
                <p className="text-2xl font-bold text-primary mb-2">Saturday</p>
                <p className="text-sm text-muted-foreground">6 wins, 1 loss, 28.5 SOL</p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">
                  Favorite Mode
                </p>
                <p className="text-2xl font-bold text-primary mb-2">1v1 Duels</p>
                <p className="text-sm text-muted-foreground">68 matches, 82% win rate</p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">
                  Avg Earnings
                </p>
                <p className="text-2xl font-bold text-primary mb-2">3.69 SOL</p>
                <p className="text-sm text-muted-foreground">Per match average</p>
              </div>
            </div>
          </TabsContent>

          {/* Match History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Opponent
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Mode
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Result
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Earnings
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Duration
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matchHistory.map((match) => (
                    <tr key={match.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {match.opponent}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{match.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            match.result === 'WIN'
                              ? 'bg-green-950/50 text-green-400'
                              : 'bg-red-950/50 text-red-400'
                          }`}
                        >
                          {match.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-accent">
                        {match.earnings > 0 ? '+' : ''}{match.earnings} SOL
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {match.duration}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {match.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center pt-6">
              <button className="px-6 py-2 rounded border border-border hover:bg-muted transition-colors font-semibold">
                Load More
              </button>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { type: 'rookie', earned: true },
                { type: 'gunslinger', earned: true },
                { type: 'outlaw', earned: true },
                { type: 'sheriff', earned: true },
                { type: 'legend', earned: true },
              ].map((badge) => (
                <div key={badge.type} className="text-center p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                  <Badge type={badge.type as any} size="lg" />
                  {!badge.earned && (
                    <p className="text-xs text-muted-foreground mt-2 uppercase">Locked</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="p-8 rounded-lg border border-border bg-card space-y-6">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="SheriffSolana"
                  className="w-full px-4 py-2 rounded bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  Email Notifications
                </label>
                <div className="space-y-2">
                  {['Match Results', 'Daily Rewards', 'Leaderboard Changes'].map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  Two-Factor Authentication
                </label>
                <button className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary/10 transition-colors font-semibold">
                  Enable 2FA
                </button>
              </div>

              <div className="pt-6 border-t border-border">
                <button className="px-6 py-2 rounded bg-red-950 text-red-400 hover:bg-red-900 transition-colors font-semibold">
                  Delete Account
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 px-4 py-2 rounded border border-border hover:bg-muted transition-colors font-semibold">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold">
                  Save Changes
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

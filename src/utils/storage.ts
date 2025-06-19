
import { Game, AppSettings } from '@/types/speedrun';

const STORAGE_KEYS = {
  GAMES: 'speedrun_games',
  SETTINGS: 'speedrun_settings'
};

export const storage = {
  // Games
  getGames(): Game[] {
    const saved = localStorage.getItem(STORAGE_KEYS.GAMES);
    return saved ? JSON.parse(saved) : [];
  },

  saveGames(games: Game[]): void {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  },

  addGame(game: Game): void {
    const games = this.getGames();
    games.push(game);
    this.saveGames(games);
  },

  updateGame(gameId: string, updates: Partial<Game>): void {
    const games = this.getGames();
    const index = games.findIndex(g => g.id === gameId);
    if (index !== -1) {
      games[index] = { ...games[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveGames(games);
    }
  },

  deleteGame(gameId: string): void {
    const games = this.getGames();
    const filtered = games.filter(g => g.id !== gameId);
    this.saveGames(filtered);
  },

  // Settings
  getSettings(): AppSettings {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      defaultGameImage: '/placeholder.svg'
    };
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Export
  exportData(): string {
    return JSON.stringify({
      games: this.getGames(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.games) this.saveGames(data.games);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }
};

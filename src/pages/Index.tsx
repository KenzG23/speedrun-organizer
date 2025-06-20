import React, { useState, useEffect } from 'react';
import { Game, SectionType, AppSettings } from '@/types/speedrun';
import { storage } from '@/utils/storage';
import { GameCard } from '@/components/GameCard';
import { GameForm } from '@/components/GameForm';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { ImportDialog } from '@/components/ImportDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Download, Upload, Moon, Sun, Trophy, Zap, Users, Laugh } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermissions } from '@/utils/notifications';
import { Stats } from '@/components/Stats';
import { CloudSync } from '@/components/CloudSync';

const SECTIONS: SectionType[] = ['ILs', 'Full Runs', 'MultiRuns', 'Troll Runs'];

const getSectionIcon = (section: SectionType) => {
  switch (section) {
    case 'ILs': return Zap;
    case 'Full Runs': return Trophy;
    case 'MultiRuns': return Users;
    case 'Troll Runs': return Laugh;
    default: return Trophy;
  }
};

const Index = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [activeSection, setActiveSection] = useState<SectionType>('ILs');
  const [showGameForm, setShowGameForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'stats' | 'sync'>('games');
  const { toast } = useToast();

  useEffect(() => {
    // Load data on mount
    const savedGames = storage.getGames();
    const settings = storage.getSettings();
    setGames(savedGames);
    setDarkMode(settings.darkMode);
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Request notification permissions
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    // Update dark mode
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, darkMode });
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddGame = (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGame: Game = {
      ...gameData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storage.addGame(newGame);
    setGames([...games, newGame]);
    setShowGameForm(false);
    
    toast({
      title: "Game Added",
      description: `${newGame.title} has been added to ${newGame.section}`,
    });
  };

  const handleUpdateGame = (gameId: string, updates: Partial<Game>) => {
    storage.updateGame(gameId, updates);
    setGames(games.map(game => 
      game.id === gameId ? { ...game, ...updates, updatedAt: new Date().toISOString() } : game
    ));
  };

  const handleDeleteGame = (gameId: string) => {
    storage.deleteGame(gameId);
    setGames(games.filter(game => game.id !== gameId));
    
    toast({
      title: "Game Deleted",
      description: "Game has been removed from your collection",
    });
  };

  const handleExportData = () => {
    const exportData = storage.exportData();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedrun-organizer-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your speedrun data has been exported successfully",
    });
  };

  const handleImportData = (data: { games: Game[]; settings?: AppSettings }, mode: 'merge' | 'replace') => {
    try {
      if (mode === 'replace') {
        storage.saveGames(data.games);
        setGames(data.games);
      } else {
        // Merge mode - avoid duplicates by checking IDs
        const existingIds = new Set(games.map(g => g.id));
        const newGames = data.games.filter(g => !existingIds.has(g.id));
        const mergedGames = [...games, ...newGames];
        storage.saveGames(mergedGames);
        setGames(mergedGames);
      }

      if (data.settings) {
        storage.saveSettings(data.settings);
        setDarkMode(data.settings.darkMode);
      }

      toast({
        title: "Import Successful",
        description: mode === 'replace' 
          ? `Replaced all data with ${data.games.length} games`
          : `Added ${data.games.filter(g => !games.some(existing => existing.id === g.id)).length} new games`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  // Generate suggestions for search
  const gameSuggestions = games
    .filter(game => game.section === activeSection)
    .map(game => game.title);

  const filteredAndSortedGames = games
    .filter(game => {
      // Section filter
      if (game.section !== activeSection) return false;
      
      // Favorites filter
      if (showFavoritesOnly && !game.isFavorite) return false;
      
      // Tag filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => game.tags.includes(tag))) return false;
      
      // Search filter
      if (searchQuery === '') return true;
      
      const query = searchQuery.toLowerCase();
      return (
        game.title.toLowerCase().includes(query) ||
        game.tags.some(tag => tag.toLowerCase().includes(query)) ||
        game.categories.some(category => 
          category.name.toLowerCase().includes(query) ||
          (category.variables && category.variables.toLowerCase().includes(query))
        )
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'categories':
          return b.categories.length - a.categories.length;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'placement':
          const aBestPlacement = Math.min(...a.categories.map(c => c.placement), Infinity);
          const bBestPlacement = Math.min(...b.categories.map(c => c.placement), Infinity);
          return aBestPlacement - bBestPlacement;
        case 'pbTime':
          // This is a simplified sort - could be enhanced with proper time parsing
          return a.categories[0]?.pbTime.localeCompare(b.categories[0]?.pbTime || '') || 0;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Speedrun Organizer
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Track your personal bests and plan your next runs</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <Sun size={16} />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon size={16} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'games' | 'stats' | 'sync')} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="games">🎮 Games</TabsTrigger>
            <TabsTrigger value="stats">📊 Stats</TabsTrigger>
            <TabsTrigger value="sync">☁️ Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="games">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {SECTIONS.map(section => {
                const sectionGames = games.filter(game => game.section === section);
                const totalCategories = sectionGames.reduce((sum, game) => sum + game.categories.length, 0);
                const IconComponent = getSectionIcon(section);
                
                return (
                  <Card key={section} className="text-center hover-scale transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm flex items-center justify-center gap-1">
                        <IconComponent size={16} />
                        {section}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">{sectionGames.length}</div>
                      <p className="text-xs text-muted-foreground">{totalCategories} categories</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Tabs for sections */}
            <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SectionType)}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                {SECTIONS.map(section => {
                  const IconComponent = getSectionIcon(section);
                  return (
                    <TabsTrigger key={section} value={section} className="text-xs sm:text-sm flex items-center gap-1">
                      <IconComponent size={14} />
                      {section}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {SECTIONS.map(section => (
                <TabsContent key={section} value={section}>
                  <div className="space-y-4 sm:space-y-6">
                    {/* Advanced Search and Controls */}
                    <div className="space-y-4">
                      <AdvancedSearch
                        games={games}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        showFavoritesOnly={showFavoritesOnly}
                        onFavoritesToggle={setShowFavoritesOnly}
                      />
                      <Button onClick={() => setShowGameForm(true)} className="w-full sm:w-auto sm:self-end">
                        <Plus size={16} className="mr-2" />
                        Add Game
                      </Button>
                    </div>

                    {/* Games list */}
                    <div className="space-y-4">
                      {filteredAndSortedGames.length === 0 ? (
                        <Card className="p-6 sm:p-8 text-center">
                          <p className="text-muted-foreground mb-4">
                            {searchQuery || selectedTags.length > 0 || showFavoritesOnly 
                              ? 'No games match your filters' 
                              : `No games in ${section} yet`}
                          </p>
                          {!searchQuery && selectedTags.length === 0 && !showFavoritesOnly && (
                            <Button onClick={() => setShowGameForm(true)}>
                              <Plus size={16} className="mr-2" />
                              Add Your First Game
                            </Button>
                          )}
                        </Card>
                      ) : (
                        <div className="animate-fade-in">
                          {filteredAndSortedGames.map(game => (
                            <GameCard
                              key={game.id}
                              game={game}
                              onUpdateGame={handleUpdateGame}
                              onDeleteGame={handleDeleteGame}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="stats">
            <Stats games={games} />
          </TabsContent>

          <TabsContent value="sync">
            <CloudSync 
              onExport={handleExportData}
              onImport={handleImportData}
            />
          </TabsContent>
        </Tabs>

        {/* Game Form Modal */}
        {showGameForm && (
          <GameForm
            section={activeSection}
            onSave={handleAddGame}
            onCancel={() => setShowGameForm(false)}
          />
        )}

        {/* Import Dialog */}
        <ImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImportData}
        />
      </div>
    </div>
  );
};

export default Index;

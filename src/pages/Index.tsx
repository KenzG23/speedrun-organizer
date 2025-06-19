
import React, { useState, useEffect } from 'react';
import { Game, SectionType } from '@/types/speedrun';
import { storage } from '@/utils/storage';
import { GameCard } from '@/components/GameCard';
import { GameForm } from '@/components/GameForm';
import { SearchAndSort } from '@/components/SearchAndSort';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Download, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermissions } from '@/utils/notifications';

const SECTIONS: SectionType[] = ['ILs', 'Full Runs', 'MultiRuns', 'Troll Runs'];

const Index = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [activeSection, setActiveSection] = useState<SectionType>('ILs');
  const [showGameForm, setShowGameForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [darkMode, setDarkMode] = useState(false);
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

  // Generate suggestions for search
  const gameSuggestions = games
    .filter(game => game.section === activeSection)
    .map(game => game.title);

  const filteredAndSortedGames = games
    .filter(game => 
      game.section === activeSection &&
      (searchQuery === '' || game.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'categories':
          return b.categories.length - a.categories.length;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Sun size={16} />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon size={16} />
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {SECTIONS.map(section => {
            const sectionGames = games.filter(game => game.section === section);
            const totalCategories = sectionGames.reduce((sum, game) => sum + game.categories.length, 0);
            
            return (
              <Card key={section} className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm">{section}</CardTitle>
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
            {SECTIONS.map(section => (
              <TabsTrigger key={section} value={section} className="text-xs sm:text-sm">
                {section}
              </TabsTrigger>
            ))}
          </TabsList>

          {SECTIONS.map(section => (
            <TabsContent key={section} value={section}>
              <div className="space-y-4 sm:space-y-6">
                {/* Controls */}
                <div className="flex flex-col gap-4">
                  <SearchAndSort
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    suggestions={gameSuggestions}
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
                        {searchQuery ? 'No games match your search' : `No games in ${section} yet`}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setShowGameForm(true)}>
                          <Plus size={16} className="mr-2" />
                          Add Your First Game
                        </Button>
                      )}
                    </Card>
                  ) : (
                    filteredAndSortedGames.map(game => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onUpdateGame={handleUpdateGame}
                        onDeleteGame={handleDeleteGame}
                      />
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Game Form Modal */}
        {showGameForm && (
          <GameForm
            section={activeSection}
            onSave={handleAddGame}
            onCancel={() => setShowGameForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

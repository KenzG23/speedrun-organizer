
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, Category } from '@/types/speedrun';
import { Trophy, Zap, TrendingUp, Calendar, Target, Award } from 'lucide-react';

interface StatsProps {
  games: Game[];
}

export const Stats = ({ games }: StatsProps) => {
  // Calculate stats
  const totalGames = games.length;
  const totalCategories = games.reduce((sum, game) => sum + game.categories.length, 0);
  
  // Categories by placement
  const firstPlaces = games.flatMap(game => game.categories).filter(cat => cat.placement === 1).length;
  const topThreePlacements = games.flatMap(game => game.categories).filter(cat => cat.placement <= 3).length;
  
  // Recent runs (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentRuns = games.flatMap(game => game.categories)
    .filter(cat => cat.dateOfRun && new Date(cat.dateOfRun) >= thirtyDaysAgo).length;
  
  // Next eligible runs
  const nextEligibleRuns = games.flatMap(game => 
    game.categories.filter(cat => cat.nextRunEligible)
  ).sort((a, b) => {
    if (!a.nextRunEligible || !b.nextRunEligible) return 0;
    return new Date(a.nextRunEligible).getTime() - new Date(b.nextRunEligible).getTime();
  });
  
  // Games by section
  const sectionCounts = {
    'ILs': games.filter(g => g.section === 'ILs').length,
    'Full Runs': games.filter(g => g.section === 'Full Runs').length,
    'MultiRuns': games.filter(g => g.section === 'MultiRuns').length,
    'Troll Runs': games.filter(g => g.section === 'Troll Runs').length,
  };
  
  // Most active games (by category count)
  const mostActiveGames = [...games]
    .sort((a, b) => b.categories.length - a.categories.length)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 Stats & Insights</h2>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy size={16} />
              Total Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGames}</div>
            <p className="text-xs text-muted-foreground">{totalCategories} categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award size={16} />
              First Places
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firstPlaces}</div>
            <p className="text-xs text-muted-foreground">{topThreePlacements} top 3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar size={16} />
              Recent Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentRuns}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target size={16} />
              Next Eligible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextEligibleRuns.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming runs</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Games by Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(sectionCounts).map(([section, count]) => (
              <div key={section} className="text-center">
                <div className="text-xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{section}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Active Games */}
      {mostActiveGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Active Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostActiveGames.map((game, index) => (
                <div key={game.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <img
                      src={game.image || '/placeholder.svg'}
                      alt={game.title}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <span className="font-medium">{game.title}</span>
                  </div>
                  <Badge>{game.categories.length} categories</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Eligible Runs */}
      {nextEligibleRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Eligible Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextEligibleRuns.slice(0, 5).map((category) => {
                const game = games.find(g => g.categories.some(c => c.id === category.id));
                const isOverdue = category.nextRunEligible && new Date(category.nextRunEligible) < new Date();
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{game?.title} - {category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Eligible: {category.nextRunEligible ? new Date(category.nextRunEligible).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                    <Badge variant={isOverdue ? "destructive" : "secondary"}>
                      {isOverdue ? "Overdue" : "Upcoming"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

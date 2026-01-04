import { Flame, Trophy, Calendar } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
}

const MILESTONES = [7, 14, 30, 100];

export function StreakCard({ currentStreak, longestStreak, lastStreakDate }: StreakCardProps) {
  const nextMilestone = MILESTONES.find(m => m > currentStreak) || 100;
  const previousMilestone = MILESTONES.filter(m => m <= currentStreak).pop() || 0;
  const progress = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  
  const isActiveToday = lastStreakDate === new Date().toISOString().split('T')[0];
  
  const getMilestoneBonus = (milestone: number) => {
    switch (milestone) {
      case 7: return '₹0.50';
      case 14: return '₹1.00';
      case 30: return '₹3.00';
      case 100: return '₹10.00';
      default: return '';
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-card shadow-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          Daily Streak
        </h3>
        {isActiveToday && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500 font-medium">
            Active Today
          </span>
        )}
      </div>

      {/* Current Streak Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
          currentStreak > 0 
            ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30' 
            : 'bg-muted'
        }`}>
          <span className={`text-2xl font-bold ${currentStreak > 0 ? 'text-white' : 'text-muted-foreground'}`}>
            {currentStreak}
          </span>
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            Best: {longestStreak} days
          </p>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progress to {nextMilestone}-day streak</span>
          <span>{currentStreak}/{nextMilestone}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Bonus reward: {getMilestoneBonus(nextMilestone)}
        </p>
      </div>

      {/* Milestone Indicators */}
      <div className="flex items-center justify-between gap-1">
        {MILESTONES.map((milestone) => (
          <div
            key={milestone}
            className={`flex-1 text-center p-2 rounded-lg ${
              currentStreak >= milestone
                ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30'
                : 'bg-muted/50'
            }`}
          >
            <Flame className={`w-4 h-4 mx-auto mb-1 ${
              currentStreak >= milestone ? 'text-orange-500' : 'text-muted-foreground'
            }`} />
            <p className={`text-xs font-medium ${
              currentStreak >= milestone ? 'text-orange-500' : 'text-muted-foreground'
            }`}>
              {milestone}d
            </p>
          </div>
        ))}
      </div>

      {/* Streak Tips */}
      {currentStreak === 0 && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Watch an ad today to start your streak!
          </p>
        </div>
      )}
    </div>
  );
}

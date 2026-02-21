import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockRecommendations, mockCourses } from '@/mock/data';
import {
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  ArrowRight,
  Brain,
  Clock,
  ChevronRight,
} from 'lucide-react';

export function RecommendationsPage() {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'lesson':
        return BookOpen;
      case 'course':
        return Brain;
      case 'practice':
        return Zap;
      default:
        return Lightbulb;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'course':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'practice':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Recommendations</h1>
            <p className="text-muted-foreground mt-1">
              Personalized suggestions based on your learning patterns and goals
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
        </div>
      </motion.div>

      {/* Priority Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4">Top Priority</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRecommendations.map((recommendation, index) => {
            const Icon = getIconForType(recommendation.type);
            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getColorForType(recommendation.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {recommendation.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary mb-4">
                      <Target className="h-4 w-4" />
                      {recommendation.reason}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recommendation.relatedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      Start Learning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Path Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Suggested Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="w-0.5 h-12 bg-border" />
                </div>
                <div className="flex-1 p-4 rounded-lg bg-muted">
                  <h4 className="font-medium">Complete Python Fundamentals</h4>
                  <p className="text-sm text-muted-foreground">
                    Strengthen your programming foundation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="w-0.5 h-12 bg-border" />
                </div>
                <div className="flex-1 p-4 rounded-lg bg-muted">
                  <h4 className="font-medium">Practice Data Structures</h4>
                  <p className="text-sm text-muted-foreground">
                    Solve 50+ coding challenges
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                </div>
                <div className="flex-1 p-4 rounded-lg bg-muted">
                  <h4 className="font-medium">Build Real Projects</h4>
                  <p className="text-sm text-muted-foreground">
                    Apply your skills to portfolio projects
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills to Develop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4">Skills to Develop</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Machine Learning', level: 45, growth: '+12%' },
            { name: 'Data Analysis', level: 60, growth: '+8%' },
            { name: 'Cloud Computing', level: 30, growth: '+15%' },
            { name: 'System Design', level: 25, growth: '+20%' },
          ].map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{skill.name}</h4>
                    <Badge variant="secondary" className="text-green-600">
                      {skill.growth}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Level</span>
                      <span className="font-medium">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
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
  Loader2
} from 'lucide-react';

export function RecommendationsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    topPriority: any[];
    learningPath: any[];
    skillsToDevelop: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/recommendations');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

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

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { topPriority = [], learningPath = [], skillsToDevelop = [] } = data || {};

  const hasData = topPriority.length > 0 || learningPath.length > 0 || skillsToDevelop.length > 0;

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

      {!hasData && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground max-w-md">
              We need a bit more data about your learning journey to generate personalized AI recommendations. Try enrolling in a course or completing a few lessons!
            </p>
            <Button onClick={() => navigate('/courses')} className="mt-6">
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Priority Recommendations */}
      {topPriority && topPriority.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4">Top Priority</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPriority.map((recommendation, index) => {
              const Icon = getIconForType(recommendation.type);
              return (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${getColorForType(recommendation.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {recommendation.type}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{recommendation.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow">
                        {recommendation.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary mb-4">
                        <Target className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-2">{recommendation.reason}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {recommendation.relatedSkills && recommendation.relatedSkills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        className="w-full mt-auto" 
                        variant="outline"
                        onClick={() => navigate(recommendation.actionLink || '/student')}
                      >
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
      )}

      {/* Learning Path Suggestion */}
      {learningPath && learningPath.length > 0 && (
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
                {learningPath.map((pathItem, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${pathItem.status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                        {pathItem.step}
                      </div>
                      {index < learningPath.length - 1 && (
                        <div className="w-0.5 h-12 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-muted">
                      <h4 className="font-medium">{pathItem.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pathItem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Skills to Develop */}
      {skillsToDevelop && skillsToDevelop.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Skills to Develop</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skillsToDevelop.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium truncate mr-2">{skill.name}</h4>
                      <Badge variant="secondary" className="text-green-600 shrink-0">
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
      )}
    </div>
  );
}

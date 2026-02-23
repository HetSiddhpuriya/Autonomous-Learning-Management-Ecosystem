import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/common/CourseCard';
import { mockCourses } from '@/mock/data';
import {
  Brain,
  Target,
  Users,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  Zap,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';

export function LandingPage() {
  const featuredCourses = mockCourses.slice(0, 4);

  const features = [
    {
      icon: Brain,
      title: 'Adaptive Learning',
      description: 'AI-powered personalization that adjusts to your learning pace and style for maximum retention.',
    },
    {
      icon: Target,
      title: 'Skill Tracking',
      description: 'Visualize your progress with detailed analytics and identify areas for improvement.',
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized course suggestions based on your goals, interests, and learning history.',
    },
    {
      icon: Users,
      title: 'Peer Learning',
      description: 'Connect with fellow learners, join study groups, and collaborate on projects.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Learn',
      description: 'Access high-quality video lessons, interactive quizzes, and comprehensive study materials crafted by industry experts.',
      icon: Play,
    },
    {
      step: '02',
      title: 'Practice',
      description: 'Reinforce your knowledge with hands-on exercises, coding challenges, and real-world projects.',
      icon: Zap,
    },
    {
      step: '03',
      title: 'Master',
      description: 'Earn certificates, build your portfolio, and showcase your skills to potential employers.',
      icon: TrendingUp,
    },
  ];

  const categories = [
    { name: 'Data Science', courses: 45, icon: '📊' },
    { name: 'Web Development', courses: 78, icon: '💻' },
    { name: 'Mobile Development', courses: 32, icon: '📱' },
    { name: 'Cloud Computing', courses: 28, icon: '☁️' },
    { name: 'Design', courses: 56, icon: '🎨' },
    { name: 'Business', courses: 43, icon: '💼' },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Software Engineer at Google',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content: 'LearnFlux completely transformed my learning experience. The adaptive AI helped me focus on areas where I needed improvement, and I landed my dream job within 3 months of completing the program.',
      rating: 5,
    },
    {
      name: 'James Chen',
      role: 'Data Scientist at Netflix',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      content: 'The personalized learning path was exactly what I needed. I could learn at my own pace while still being challenged. The skill tracking feature helped me stay motivated throughout the journey.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer at Spotify',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      content: 'As a career changer, I was worried about keeping up. LearnFlux made it easy with its smart recommendations and supportive community. The instructors are world-class professionals.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Learners' },
    { value: '500+', label: 'Expert Courses' },
    { value: '95%', label: 'Completion Rate' },
    { value: '4.8', label: 'Average Rating' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="container relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Learning Platform
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Learning That{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Adapts To You
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Experience personalized education powered by AI. Our adaptive learning
              ecosystem tailors every lesson to your unique needs, helping you learn
              faster and retain more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="gap-2" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/#courses">
                  Explore Courses
                  <Play className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="container px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground">
              Our platform combines cutting-edge AI technology with proven learning methodologies
              to deliver an unparalleled educational experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="h-full p-6 rounded-xl bg-background border hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Path to Mastery
            </h2>
            <p className="text-muted-foreground">
              Our proven three-step process helps you achieve your learning goals efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative group hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
                >
                  <div className="text-6xl font-bold text-muted/20 absolute -top-4 left-1/2 -translate-x-1/2 group-hover:text-primary/10 transition-colors duration-300 z-0">
                    {step.step}
                  </div>
                  <div className="relative pt-8 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300 shadow-sm group-hover:shadow-md">
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-24 bg-muted/50">
        <div className="container px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Categories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Course Categories
            </h2>
            <p className="text-muted-foreground">
              Choose from a wide range of categories and start learning today.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="p-6 rounded-xl bg-background border hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.courses} courses
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-24">
        <div className="container px-6">
          <div className="relative mb-16 flex flex-col items-center">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-4">Featured Courses</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Learning Today
              </h2>
              <p className="text-muted-foreground">
                Hand-picked courses from industry experts to help you achieve your goals.
              </p>
            </div>
            <div className="mt-8 flex justify-center md:mt-0 md:absolute md:right-0 md:bottom-2">
              <Button variant="outline" asChild>
                <Link to="/courses">
                  View All Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/50">
        <div className="container px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Learners Say
            </h2>
            <p className="text-muted-foreground">
              Join thousands of satisfied learners who have transformed their careers with LearnFlux.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-background rounded-xl p-6 border flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mb-2"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-6">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            <div className="relative z-10 py-16 px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Ready to Start Your Learning Journey?
                </h2>
                <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                  Join over 50,000 learners who are already transforming their careers
                  with our adaptive learning platform.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/register">
                      Get Started Free
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                    <Link to="/courses">
                      Browse Courses
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

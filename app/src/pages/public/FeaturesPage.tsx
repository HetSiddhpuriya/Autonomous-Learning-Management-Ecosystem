import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Video,
    Award,
    Target,
    MessageSquare,
    Zap,
    Users,
    Layout,
    ShieldCheck,
    Globe
} from 'lucide-react';

const features = [
    {
        icon: <Video className="h-6 w-6" />,
        title: 'High-Quality Video Courses',
        description: 'Access thousands of professionally recorded video lessons with crystal clear audio and visuals, available anytime, anywhere.',
        color: 'from-blue-500/20 to-blue-500/5',
        iconColor: 'text-blue-500'
    },
    {
        icon: <Target className="h-6 w-6" />,
        title: 'Personalized Learning Paths',
        description: 'Our AI-driven engine analyzes your goals and progress to curate a custom learning journey tailored specifically for you.',
        color: 'from-emerald-500/20 to-emerald-500/5',
        iconColor: 'text-emerald-500'
    },
    {
        icon: <MessageSquare className="h-6 w-6" />,
        title: 'Interactive Discussions',
        description: 'Engage with instructors and peers in real-time discussion forums. Ask questions, share insights, and learn collaboratively.',
        color: 'from-purple-500/20 to-purple-500/5',
        iconColor: 'text-purple-500'
    },
    {
        icon: <Zap className="h-6 w-6" />,
        title: 'Bite-Sized Quizzes',
        description: 'Test your knowledge instantly with auto-graded quizzes and interactive coding exercises embedded right into your lessons.',
        color: 'from-amber-500/20 to-amber-500/5',
        iconColor: 'text-amber-500'
    },
    {
        icon: <Layout className="h-6 w-6" />,
        title: 'Intuitive Dashboard',
        description: 'Track your course progress, upcoming assignments, and performance metrics through a beautifully designed central hub.',
        color: 'from-pink-500/20 to-pink-500/5',
        iconColor: 'text-pink-500'
    },
    {
        icon: <Award className="h-6 w-6" />,
        title: 'Verified Certificates',
        description: 'Earn industry-recognized certificates upon course completion to showcase your enhanced skills to potential employers.',
        color: 'from-indigo-500/20 to-indigo-500/5',
        iconColor: 'text-indigo-500'
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: 'Expert Instructors',
        description: 'Learn directly from industry veterans and top-tier professionals who bring real-world experience to your virtual classroom.',
        color: 'from-rose-500/20 to-rose-500/5',
        iconColor: 'text-rose-500'
    },
    {
        icon: <Globe className="h-6 w-6" />,
        title: 'Learn Anywhere',
        description: 'Seamlessly synchronize your progress across all your devices, allowing you to switch from desktop to mobile effortlessly.',
        color: 'from-cyan-500/20 to-cyan-500/5',
        iconColor: 'text-cyan-500'
    },
    {
        icon: <ShieldCheck className="h-6 w-6" />,
        title: 'Enterprise-Grade Security',
        description: 'Rest easy knowing that your data, payments, and learning progress are protected by state-of-the-art encryption standards.',
        color: 'from-orange-500/20 to-orange-500/5',
        iconColor: 'text-orange-500'
    }
];

export function FeaturesPage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="min-h-screen bg-background pt-16 pb-24">
            {/* Hero Section */}
            <div className="relative overflow-hidden mb-20 py-24">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] pointer-events-none" />

                <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-medium">Next-Generation Learning</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Powerful Features for <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Limitless Growth</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                            Discover a suite of meticulously crafted tools designed to transform how you learn, teach, and grow on our platform.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20" asChild>
                                <Link to="/register">
                                    Get Started for Free
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full bg-background/50 backdrop-blur" asChild>
                                <Link to="/courses">
                                    Browse Courses
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container px-4 md:px-6 mx-auto mb-20">
                <motion.div
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`
                relative group overflow-hidden rounded-3xl p-8 border border-border/50 
                bg-card/50 backdrop-blur-sm transition-all duration-300
                hover:shadow-2xl hover:shadow-${feature.iconColor.replace('text-', '')}/10 hover:-translate-y-1
              `}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            />

                            <div className="relative z-10">
                                <div
                                    className={`
                    inline-flex p-4 rounded-2xl mb-6 
                    bg-background/80 shadow-sm border border-border/50
                    transition-transform duration-300
                    ${hoveredIndex === index ? 'scale-110 !border-transparent' : ''}
                  `}
                                >
                                    <div className={feature.iconColor}>
                                        {feature.icon}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold tracking-tight mb-3 text-foreground">
                                    {feature.title}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Call to Action Section */}
            <div className="container px-4 md:px-6 mx-auto mt-32">
                <div className="relative rounded-3xl overflow-hidden py-20 px-6 md:px-12 text-center bg-card border">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-blue-500/10 pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to Upgrade Your Learning Experience?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-10">
                            Join thousands of students and instructors who are already using our platform to achieve their educational and career goals.
                        </p>
                        <Button size="lg" className="rounded-full w-full sm:w-auto text-lg px-10 py-6" asChild>
                            <Link to="/register">
                                Create Your Free Account Now
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

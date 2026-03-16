import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Play, Quote, Award, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const allTestimonials = [
    {
        name: "Sarah Jenkins",
        role: "Senior Frontend Engineer",
        content: "The advanced React patterns course completely transformed how I build large-scale applications. The attention to detail and real-world project scenarios are unmatched.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop",
        rating: 5,
        featured: true
    },
    {
        name: "Michael Chen",
        role: "Data Scientist at TechNova",
        content: "I transitioned from a different field entirely because of the machine learning curriculum here. The adaptive pacing really works.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&auto=format&fit=crop",
        rating: 5,
        featured: true
    },
    {
        name: "Elena Rodriguez",
        role: "UX Design Lead",
        content: "As someone who has tried multiple platforms, the UI/UX deep dive available here is hands-down the most comprehensive and modern approach to design education.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&auto=format&fit=crop",
        rating: 5,
        featured: true
    },
    {
        name: "David Kim",
        role: "Full Stack Developer",
        content: "Getting hands-on with system design concepts through interactive labs saved me months of reading dry documentation.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&auto=format&fit=crop",
        rating: 4,
        featured: false
    },
    {
        name: "Amanda Foster",
        role: "Product Manager",
        content: "The agile methodology courses are so practical. My entire team started using the frameworks I learned here within a week of me finishing.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&auto=format&fit=crop",
        rating: 5,
        featured: false
    },
    {
        name: "James Wilson",
        role: "DevOps Engineer",
        content: "Finally, a platform that understands how to teach cloud infrastructure properly. The CI/CD pipelines course is exceptional.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&auto=format&fit=crop",
        rating: 5,
        featured: false
    },
    {
        name: "Nina Patel",
        role: "Mobile Developer",
        content: "The React Native curriculum is incredibly up-to-date. Finding instructors who actually work in the industry makes a massive difference.",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=400&h=400&auto=format&fit=crop",
        rating: 5,
        featured: false
    },
    {
        name: "Marcus Johnson",
        role: "Software Architect",
        content: "I use this platform to upskill my entire team. The analytics let me see who is struggling and the AI pacing keeps everyone engaged.",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&auto=format&fit=crop",
        rating: 5,
        featured: false
    }
];

const impactStats = [
    { label: "Active Learners", value: "50,000+", icon: Users },
    { label: "Courses Completed", value: "250,000+", icon: BookOpen },
    { label: "Career Transitions", value: "12,000+", icon: Award },
];

export function TestimonialsPage() {
    return (
        <div className="flex flex-col bg-background selection:bg-primary/20">

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-border/50">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl mx-auto"
                    >
                        <Badge variant="outline" className="mb-6 py-1 px-4 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                            <Star className="h-4 w-4 mr-2 inline" /> Success Stories
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-foreground">
                            Don't Just Take <br className="hidden md:block" /> Our Word For It.
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light mb-10">
                            Join a thriving global community of professionals who have accelerated their careers, mastered new skills, and transformed their futures with LearnFlux.
                        </p>
                    </motion.div>
                </div>

                {/* Global Impact Stats */}
                <div className="container relative z-10 px-4 md:px-6 mt-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm"
                    >
                        {impactStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex flex-col items-center text-center p-4 border-b md:border-b-0 md:border-r border-border/50 last:border-0">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Featured Testimonials */}
            <section className="py-24 bg-muted/20">
                <div className="container px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Featured Reviews</h2>
                        <p className="text-lg text-muted-foreground">Hear directly from some of our most dedicated alumni.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {allTestimonials.filter(t => t.featured).map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                className="bg-card rounded-[2rem] p-8 md:p-10 border border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between relative group"
                            >
                                <Quote className="absolute top-8 right-8 text-primary/10 h-16 w-16 group-hover:text-primary/20 transition-colors duration-300 pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-1 mb-6">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400 drop-shadow-sm" />
                                        ))}
                                    </div>
                                    <p className="text-lg text-foreground font-medium mb-10 leading-relaxed">
                                        "{testimonial.content}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 border-t border-border/50 pt-6 relative z-10">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-14 h-14 rounded-full border-2 border-primary/20"
                                    />
                                    <div>
                                        <p className="font-bold text-foreground">{testimonial.name}</p>
                                        <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* More Reviews Wall */}
            <section className="py-24 border-t border-border/50">
                <div className="container px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">More from the Community</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allTestimonials.filter(t => !t.featured).map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-border transition-colors duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground mb-8 leading-relaxed">
                                        "{testimonial.content}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-10 h-10 rounded-full border border-border"
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden border-t border-border/50">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[128px]" />

                <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Ready to write your own success story?
                        </h2>
                        <p className="text-xl text-muted-foreground font-light mb-12">
                            Start your journey today and gain access to world-class education designed to accelerate your career.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg hover:scale-105 transition-transform" asChild>
                                <Link to="/register">
                                    Join the Community
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full bg-background hover:scale-105 transition-transform" asChild>
                                <Link to="/courses">
                                    Browse Catalog
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}

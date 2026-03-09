import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const questionsToAdd = [
  // Web Development Fundamentals
  {
    skillMapped: 'Web Development Fundamentals',
    question: 'What does a Full Stack Developer work with?',
    options: ['Only frontend development', 'Only backend development', 'Both frontend and backend development', 'Only database management'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'A full stack developer works with both frontend and backend technologies.'
  },
  {
    skillMapped: 'Web Development Fundamentals',
    question: 'Which technology is primarily used for structuring web pages?',
    options: ['CSS', 'JavaScript', 'HTML', 'Node.js'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'HTML provides the structure and layout of web pages.'
  },
  {
    skillMapped: 'Web Development Fundamentals',
    question: 'Which CSS feature is used to create responsive layouts?',
    options: ['Grid & Flexbox', 'Variables', 'Animations', 'Fonts'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Flexbox and Grid are modern CSS layout systems used for responsive design.'
  },
  {
    skillMapped: 'Web Development Fundamentals',
    question: 'Which layer handles the user interface of a web application?',
    options: ['Backend', 'Frontend', 'Database', 'Server'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The frontend is responsible for the user interface and user interaction.'
  },
  {
    skillMapped: 'Web Development Fundamentals',
    question: 'Which database type is MongoDB?',
    options: ['Relational', 'NoSQL', 'Graph', 'SQL Server'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'MongoDB is a NoSQL document-oriented database.'
  },
  // Frontend Development with React
  {
    skillMapped: 'Frontend Development with React',
    question: 'What is React primarily used for?',
    options: ['Database management', 'Backend development', 'Building user interfaces', 'Operating systems'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'React is a JavaScript library used to build user interfaces.'
  },
  {
    skillMapped: 'Frontend Development with React',
    question: 'What does JSX stand for?',
    options: ['Java Syntax Extension', 'JavaScript XML', 'JavaScript Extension', 'JSON XML'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'JSX allows writing HTML-like syntax inside JavaScript.'
  },
  {
    skillMapped: 'Frontend Development with React',
    question: 'Which hook is used for managing state in React?',
    options: ['useFetch', 'useState', 'useNode', 'useRouter'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'useState is used to manage component state.'
  },
  {
    skillMapped: 'Frontend Development with React',
    question: 'Which hook is used for handling side effects in React?',
    options: ['useState', 'useEffect', 'useMemo', 'useReducer'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'useEffect is used for API calls, subscriptions, and DOM updates.'
  },
  {
    skillMapped: 'Frontend Development with React',
    question: 'Which library is used for routing in React applications?',
    options: ['Express', 'React Router', 'Node Router', 'Angular Router'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'React Router helps navigate between pages in a single-page application.'
  },
  // Backend Development with Node & Express
  {
    skillMapped: 'Backend Development with Node & Express',
    question: 'Node.js is built on which JavaScript engine?',
    options: ['SpiderMonkey', 'V8 Engine', 'Chakra', 'Rhino'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Node.js runs on Google\'s V8 JavaScript engine.'
  },
  {
    skillMapped: 'Backend Development with Node & Express',
    question: 'Which framework is commonly used with Node.js for building APIs?',
    options: ['Laravel', 'Django', 'Express.js', 'Flask'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'Express.js is a minimal backend framework for Node.js.'
  },
  {
    skillMapped: 'Backend Development with Node & Express',
    question: 'What does REST stand for in REST API?',
    options: ['Remote Execution System Tool', 'Representational State Transfer', 'Runtime Execution Standard Tool', 'Request Execution Server Transfer'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'REST is an architectural style used to design web APIs.'
  },
  {
    skillMapped: 'Backend Development with Node & Express',
    question: 'Which HTTP method is used to create new data?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'POST sends new data to the server.'
  },
  {
    skillMapped: 'Backend Development with Node & Express',
    question: 'Which middleware parses JSON request bodies in Express?',
    options: ['bodyParser.json()', 'router.json()', 'express.static()', 'httpParser()'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'bodyParser.json() or express.json() parses JSON request bodies.'
  },
  // Database with MongoDB
  {
    skillMapped: 'Database with MongoDB',
    question: 'MongoDB stores data in what format?',
    options: ['Tables', 'Documents', 'Graphs', 'Arrays'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'MongoDB stores data in BSON documents.'
  },
  {
    skillMapped: 'Database with MongoDB',
    question: 'Which ODM library is commonly used with MongoDB in Node.js?',
    options: ['Sequelize', 'Mongoose', 'Prisma', 'TypeORM'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Mongoose helps manage schemas in MongoDB.'
  },
  {
    skillMapped: 'Database with MongoDB',
    question: 'Which command retrieves data in MongoDB?',
    options: ['Insert', 'Delete', 'Find', 'Push'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'The find() method retrieves documents.'
  },
  {
    skillMapped: 'Database with MongoDB',
    question: 'Which command inserts a document in MongoDB?',
    options: ['add()', 'create()', 'insertOne()', 'push()'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'insertOne() adds a new document to a collection.'
  },
  {
    skillMapped: 'Database with MongoDB',
    question: 'What is a MongoDB collection?',
    options: ['Group of tables', 'Group of documents', 'Group of databases', 'Group of indexes'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Collections store documents inside MongoDB.'
  },
  // Authentication & Security
  {
    skillMapped: 'Authentication & Security',
    question: 'What does JWT stand for?',
    options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Token', 'JSON Web Transfer'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'JWT is used for secure authentication.'
  },
  {
    skillMapped: 'Authentication & Security',
    question: 'Which header usually carries the JWT token?',
    options: ['Authorization', 'Token', 'Authentication', 'HeaderKey'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'JWT tokens are sent in the Authorization header.'
  },
  {
    skillMapped: 'Authentication & Security',
    question: 'Which library is commonly used to hash passwords?',
    options: ['bcrypt', 'cryptoJS', 'md5', 'jwt'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'bcrypt securely hashes passwords.'
  },
  {
    skillMapped: 'Authentication & Security',
    question: 'What is Role-Based Access Control?',
    options: ['Users access everything', 'Access depends on user roles', 'Access depends on IP', 'Access depends on time'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Permissions depend on user roles.'
  },
  {
    skillMapped: 'Authentication & Security',
    question: 'Which attack can steal authentication tokens?',
    options: ['SQL Injection', 'XSS Attack', 'DNS Attack', 'DDoS'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'XSS can steal cookies or tokens from users.'
  },
  // Deployment & Production
  {
    skillMapped: 'Deployment & Production',
    question: 'Which platform can deploy Node.js applications?',
    options: ['Render', 'Photoshop', 'Canva', 'Figma'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Render supports Node.js hosting.'
  },
  {
    skillMapped: 'Deployment & Production',
    question: 'Which platform is commonly used for React deployment?',
    options: ['Vercel', 'Excel', 'Notepad', 'Blender'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Vercel is optimized for frontend frameworks.'
  },
  {
    skillMapped: 'Deployment & Production',
    question: 'What does production environment mean?',
    options: ['Testing server', 'Development server', 'Live server used by users', 'Local server'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'Production is the live environment used by real users.'
  },
  {
    skillMapped: 'Deployment & Production',
    question: 'Which file stores environment variables?',
    options: ['package.json', 'config.js', '.env', 'index.js'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: '.env files store sensitive environment variables.'
  },
  {
    skillMapped: 'Deployment & Production',
    question: 'Which tool manages Node.js dependencies?',
    options: ['pip', 'npm', 'composer', 'gem'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'npm is the default package manager for Node.js.'
  }
];

const moduleLessons = {
  "Web Development Fundamentals": "69aed6c8d0a604ed2452fb09",
  "Frontend Development with React": "69aed6f2d0a604ed2452fb15",
  "Backend Development with Node & Express": "69aed740d0a604ed2452fb2d",
  "Database with MongoDB": "69aed772d0a604ed2452fb39",
  "Authentication & Security": "69aed791d0a604ed2452fb41",
  "Deployment & Production": "69aed7bed0a604ed2452fb51"
};
const courseId = "69ae6578f4638ad34fd7542e"; // Full Stack Web Development with MERN Stack

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
        const Quiz = mongoose.model('Quiz', new mongoose.Schema({
            courseId: mongoose.Schema.Types.ObjectId,
            lessonId: mongoose.Schema.Types.ObjectId,
            title: String,
            questions: Array
        }, { strict: false }), 'quizzes');

        for (const q of questionsToAdd) {
            const lessonId = moduleLessons[q.skillMapped];
            // find quiz
            const existingQuiz = await Quiz.findOne({ lessonId });
            const questionData = {
                courseId: courseId,
                skillMapped: q.skillMapped,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                difficulty: q.difficulty,
                explanation: q.explanation
            };

            if (existingQuiz) {
                // check if question already exists by comparing text
                if (!existingQuiz.questions) existingQuiz.questions = [];
                const exist = existingQuiz.questions.find(ext => ext.question === q.question);
                if (!exist) {
                    existingQuiz.questions.push(questionData);
                    await Quiz.updateOne({ _id: existingQuiz._id }, { $set: { questions: existingQuiz.questions } });
                }
            } else {
                await Quiz.create({
                    courseId,
                    lessonId,
                    title: `${q.skillMapped} Quiz`,
                    questions: [questionData]
                });
            }
        }
        console.log("Seeding Success!");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
};
run();
